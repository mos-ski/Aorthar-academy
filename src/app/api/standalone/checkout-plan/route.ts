import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { initiatePayment, generateReference } from '@/lib/paystack';
import { requireApiAuthNotSuspended } from '@/lib/auth';
import { calculateSplit, isValidPlanPercent } from '@/lib/paymentPlans';

const DEFAULT_MIN_PERCENT = 50;
const DEFAULT_DEADLINE_DAYS = 30;

export async function POST(request: NextRequest) {
  let userId: string;
  try {
    const auth = await requireApiAuthNotSuspended();
    userId = auth.userId;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Not authenticated';
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

  let slug = '';
  let percent = NaN;
  let termsAccepted = false;
  try {
    const body = await request.json();
    slug = body.slug ?? '';
    percent = Number(body.percent);
    termsAccepted = body.terms_accepted === true;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!slug) {
    return NextResponse.json({ error: 'Course slug required' }, { status: 400 });
  }

  const { data: course } = await supabase
    .from('standalone_courses')
    .select('id, title, price_ngn, status, allow_payment_plan')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  if (!course.allow_payment_plan) {
    return NextResponse.json({ error: 'Payment plans are not available for this course' }, { status: 400 });
  }

  const { data: existingPurchase } = await supabase
    .from('standalone_purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle();

  if (existingPurchase) {
    return NextResponse.json({ redirect: `/courses-app/learn/${slug}` }, { status: 409 });
  }

  const { data: settingsRows } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['payment_plan_min_percent', 'payment_plan_deadline_days']);

  const settings = Object.fromEntries((settingsRows ?? []).map((row: { key: string; value: string | null }) => [row.key, row.value]));
  const minPercent = Number(settings.payment_plan_min_percent ?? DEFAULT_MIN_PERCENT);
  const deadlineDays = Number(settings.payment_plan_deadline_days ?? DEFAULT_DEADLINE_DAYS);

  if (!isValidPlanPercent(percent, minPercent)) {
    return NextResponse.json(
      { error: `Percent must be at least ${minPercent} and less than 100` },
      { status: 400 },
    );
  }

  if (!termsAccepted) {
    return NextResponse.json({ error: 'You must accept the payment plan terms' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', user.id)
    .maybeSingle();

  const { firstPaymentNgn, balanceNgn } = calculateSplit(course.price_ngn, percent);

  const email = user.email ?? '';
  const reference = generateReference(user.id);
  const amountKobo = firstPaymentNgn * 100;
  const origin = request.nextUrl.origin;

  const metadata: Record<string, string> = {
    type: 'payment_plan_first',
    course_id: course.id,
    course_slug: slug,
    user_id: user.id,
    user_name: profile?.full_name ?? '',
    percent: String(percent),
    total_price_ngn: String(course.price_ngn),
    first_payment_ngn: String(firstPaymentNgn),
    deadline_days: String(deadlineDays),
    terms_accepted_at: new Date().toISOString(),
  };

  try {
    const paystack = await initiatePayment({
      email,
      amount_kobo: amountKobo,
      reference,
      metadata,
      callback_url: `${origin}/courses-app/learn/${slug}`,
    });

    return NextResponse.json({
      payment_url: paystack.data.authorization_url,
      first_payment_ngn: firstPaymentNgn,
      balance_ngn: balanceNgn,
      deadline_days: deadlineDays,
    });
  } catch (err) {
    console.error('[standalone/checkout-plan] Paystack error:', err);
    return NextResponse.json({ error: 'Payment initiation failed. Please try again.' }, { status: 500 });
  }
}
