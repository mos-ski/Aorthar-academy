import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { initiatePayment, generateReference } from '@/lib/paystack';
import { requireApiAuthNotSuspended } from '@/lib/auth';

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

  let planId = '';
  try {
    const body = await request.json();
    planId = body.plan_id ?? '';
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!planId) {
    return NextResponse.json({ error: 'plan_id required' }, { status: 400 });
  }

  const { data: plan } = await supabase
    .from('course_payment_plans')
    .select('id, user_id, course_id, balance_ngn, status')
    .eq('id', planId)
    .single();

  if (!plan) {
    return NextResponse.json({ error: 'Payment plan not found' }, { status: 404 });
  }

  if (plan.user_id !== user.id) {
    return NextResponse.json({ error: 'Not your payment plan' }, { status: 403 });
  }

  if (plan.status !== 'awaiting_balance') {
    return NextResponse.json({ error: 'This payment plan is not awaiting a balance payment' }, { status: 400 });
  }

  const { data: course } = await supabase
    .from('standalone_courses')
    .select('slug')
    .eq('id', plan.course_id)
    .single();

  const email = user.email ?? '';
  const reference = generateReference(user.id);
  const amountKobo = plan.balance_ngn * 100;
  const origin = request.nextUrl.origin;
  const slug = course?.slug ?? '';

  const metadata: Record<string, string> = {
    type: 'payment_plan_balance',
    plan_id: plan.id,
    course_id: plan.course_id,
    user_id: user.id,
  };

  try {
    const paystack = await initiatePayment({
      email,
      amount_kobo: amountKobo,
      reference,
      metadata,
      callback_url: `${origin}/courses-app/learn/${slug}`,
    });

    return NextResponse.json({ payment_url: paystack.data.authorization_url });
  } catch (err) {
    console.error('[standalone/checkout-plan-balance] Paystack error:', err);
    return NextResponse.json({ error: 'Payment initiation failed. Please try again.' }, { status: 500 });
  }
}
