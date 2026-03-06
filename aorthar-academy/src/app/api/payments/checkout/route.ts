import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { initiatePayment, generateReference } from '@/lib/paystack';

// POST /api/payments/checkout — Create Paystack checkout session
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan_id } = await req.json();

  const { data: plan } = await supabase
    .from('plans')
    .select('*')
    .eq('id', plan_id)
    .single();

  if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

  const reference = generateReference(user.id);

  const result = await initiatePayment({
    email: user.email!,
    amount_kobo: Math.round(plan.price * 100), // USD cents → kobo (adjust currency if NGN)
    reference,
    metadata: { user_id: user.id, plan_type: plan.plan_type },
    callback_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
  });

  return NextResponse.json({ data: { authorization_url: result.data.authorization_url } });
}
