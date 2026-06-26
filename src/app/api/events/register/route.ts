import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { initiatePayment, generateReference } from '@/lib/paystack';
import { requireApiAuthNotSuspended } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import {
  webinarRegistrationHtml,
  webinarRegistrationSubject,
} from '@/lib/email/templates/webinar-registration-confirmation';

// POST /api/events/register — register for a free webinar, or initiate Paystack checkout for a paid one
export async function POST(request: NextRequest) {
  let userId: string;
  try {
    const auth = await requireApiAuthNotSuspended();
    userId = auth.userId;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Not authenticated';
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (message === 'SUSPENDED') {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { slug } = await request.json();
  if (!slug) {
    return NextResponse.json({ error: 'Webinar slug required' }, { status: 400 });
  }

  const { data: webinar } = await supabase
    .from('webinars')
    .select('id, slug, title, scheduled_at, price_ngn, join_url, capacity')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!webinar) {
    return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from('webinar_registrations')
    .select('id')
    .eq('user_id', user.id)
    .eq('webinar_id', webinar.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ alreadyRegistered: true }, { status: 409 });
  }

  if (webinar.capacity !== null) {
    const { count } = await supabase
      .from('webinar_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('webinar_id', webinar.id);

    if ((count ?? 0) >= webinar.capacity) {
      return NextResponse.json({ error: 'Webinar is full' }, { status: 409 });
    }
  }

  // Free webinar — register immediately
  if (webinar.price_ngn === 0) {
    const adminSupabase = createAdminClient();
    const { error: insertError } = await adminSupabase
      .from('webinar_registrations')
      .insert({ user_id: user.id, webinar_id: webinar.id, amount_paid_ngn: 0 });

    if (insertError) {
      console.error('[events/register] insert error:', insertError);
      return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .maybeSingle();
    const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

    if (user.email) {
      void sendEmail({
        to: user.email,
        subject: webinarRegistrationSubject(webinar.title),
        html: webinarRegistrationHtml({
          firstName,
          webinarTitle: webinar.title,
          scheduledAt: webinar.scheduled_at,
          joinUrl: webinar.join_url,
          amountNgn: 0,
        }),
      }).catch((err) => console.error('[events/register] email failed:', err));
    }

    return NextResponse.json({ ok: true, registered: true });
  }

  // Paid webinar — initiate Paystack checkout
  const reference = generateReference(user.id);
  const origin = request.nextUrl.origin;

  try {
    const paystack = await initiatePayment({
      email: user.email!,
      amount_kobo: webinar.price_ngn * 100,
      reference,
      metadata: {
        type: 'webinar',
        webinar_id: webinar.id,
        webinar_slug: slug,
        user_id: user.id,
      },
      callback_url: `${origin}/events/${slug}`,
    });

    return NextResponse.json({ payment_url: paystack.data.authorization_url });
  } catch (err) {
    console.error('[events/register] Paystack error:', err);
    return NextResponse.json({ error: 'Payment initiation failed. Please try again.' }, { status: 500 });
  }
}
