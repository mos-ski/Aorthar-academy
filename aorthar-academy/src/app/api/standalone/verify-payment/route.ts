import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyTransaction } from '@/lib/paystack';
import { requireApiAuthNotSuspended } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import {
  purchaseConfirmationHtml,
  purchaseConfirmationSubject,
} from '@/lib/email/templates/purchase-confirmation';

// GET /api/standalone/verify-payment?reference=xxx
// Called after Paystack redirects back — verifies the transaction and records the purchase.
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

  // Verify with Paystack
  let paystack: Awaited<ReturnType<typeof verifyTransaction>>;
  try {
    paystack = await verifyTransaction(reference);
  } catch (err) {
    console.error('[verify-payment] Paystack verify error:', err);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 502 });
  }

  const tx = paystack?.data;
  if (!tx || tx.status !== 'success') {
    return NextResponse.json({ error: 'Payment not successful' }, { status: 402 });
  }

  const meta = tx.metadata ?? {};
  if (meta.type !== 'standalone_course') {
    return NextResponse.json({ error: 'Not a standalone course payment' }, { status: 400 });
  }

  const { course_id, user_id } = meta;

  // Security: logged-in user must match the paying user
  if (user_id !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (!course_id) {
    return NextResponse.json({ error: 'Missing course_id in metadata' }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  // Fetch course details
  const { data: course } = await adminSupabase
    .from('standalone_courses')
    .select('id, title, price_ngn, slug')
    .eq('id', course_id)
    .single();

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  // Idempotent upsert — safe to call multiple times for the same reference
  const { error: dbError } = await adminSupabase
    .from('standalone_purchases')
    .upsert(
      {
        user_id,
        course_id,
        paystack_reference: reference,
        amount_paid_ngn: course.price_ngn,
      },
      { onConflict: 'paystack_reference' },
    );

  if (dbError) {
    console.error('[verify-payment] upsert error:', dbError);
    return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
  }

  // Send purchase confirmation email (fire-and-forget)
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
          subject: purchaseConfirmationSubject('course', course.title),
          html: purchaseConfirmationHtml({
            firstName,
            purchaseType: 'course',
            itemName: course.title,
            amountNgn: course.price_ngn,
            dashboardUrl: 'https://courses.aorthar.com',
          }),
        });
      }
    } catch (emailErr) {
      console.error('[verify-payment] email failed:', emailErr);
    }
  })();

  return NextResponse.json({ ok: true, slug: course.slug });
}
