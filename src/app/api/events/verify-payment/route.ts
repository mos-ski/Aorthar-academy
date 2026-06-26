import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyTransaction } from '@/lib/paystack';
import { requireApiAuthNotSuspended } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import {
  webinarRegistrationHtml,
  webinarRegistrationSubject,
} from '@/lib/email/templates/webinar-registration-confirmation';

// GET /api/events/verify-payment?reference=xxx
// Called after Paystack redirects back — verifies the transaction and records the registration.
export async function GET(request: NextRequest) {
  let userId: string;
  try {
    const auth = await requireApiAuthNotSuspended();
    userId = auth.userId;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reference = request.nextUrl.searchParams.get('reference');
  if (!reference) {
    return NextResponse.json({ error: 'reference required' }, { status: 400 });
  }

  let paystack: Awaited<ReturnType<typeof verifyTransaction>>;
  try {
    paystack = await verifyTransaction(reference);
  } catch (err) {
    console.error('[events/verify-payment] Paystack verify error:', err);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 502 });
  }

  const tx = paystack?.data;
  if (!tx || tx.status !== 'success') {
    return NextResponse.json({ error: 'Payment not successful' }, { status: 402 });
  }

  const meta = tx.metadata ?? {};
  if (meta.type !== 'webinar') {
    return NextResponse.json({ error: 'Not a webinar payment' }, { status: 400 });
  }

  const { webinar_id, user_id } = meta;

  if (user_id !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (!webinar_id) {
    return NextResponse.json({ error: 'Missing webinar_id in metadata' }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  const { data: webinar } = await adminSupabase
    .from('webinars')
    .select('id, title, slug, scheduled_at, join_url, price_ngn')
    .eq('id', webinar_id)
    .single();

  if (!webinar) {
    return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
  }

  const amountPaidNgn = Math.round(tx.amount / 100);

  // Idempotent upsert — safe to call multiple times for the same reference
  const { error: dbError } = await adminSupabase
    .from('webinar_registrations')
    .upsert(
      {
        user_id,
        webinar_id,
        paystack_reference: reference,
        amount_paid_ngn: amountPaidNgn,
      },
      { onConflict: 'paystack_reference' },
    );

  if (dbError) {
    console.error('[events/verify-payment] upsert error:', dbError);
    return NextResponse.json({ error: 'Failed to record registration' }, { status: 500 });
  }

  // Send confirmation email (fire-and-forget)
  void (async () => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email;

      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user_id)
        .maybeSingle();
      const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

      if (userEmail) {
        await sendEmail({
          to: userEmail,
          subject: webinarRegistrationSubject(webinar.title),
          html: webinarRegistrationHtml({
            firstName,
            webinarTitle: webinar.title,
            scheduledAt: webinar.scheduled_at,
            joinUrl: webinar.join_url,
            amountNgn: amountPaidNgn,
          }),
        });
      }
    } catch (emailErr) {
      console.error('[events/verify-payment] email failed:', emailErr);
    }
  })();

  return NextResponse.json({ ok: true, slug: webinar.slug });
}
