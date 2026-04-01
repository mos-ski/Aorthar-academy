import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { initiatePayment, generateReference } from '@/lib/paystack';
import { requireApiAuthNotSuspended } from '@/lib/auth';

// POST /api/payments/checkout — Create Paystack checkout session
export async function POST(req: NextRequest) {
  let userId: string;
  try {
    const auth = await requireApiAuthNotSuspended();
    userId = auth.userId;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (message === 'SUSPENDED') {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    amount_kobo: Math.round(plan.price * 100), // price stored in NGN → multiply by 100 for kobo
    reference,
    metadata: { user_id: user.id, plan_type: plan.plan_type },
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? 'https://www.aorthar.academy'}/dashboard?payment=success`,
  });

  return NextResponse.json({ data: { authorization_url: result.data.authorization_url } });
}
