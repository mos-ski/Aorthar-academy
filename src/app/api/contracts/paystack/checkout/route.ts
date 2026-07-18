import { NextRequest, NextResponse } from 'next/server';
import { initiatePayment } from '@/lib/paystack';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const body = await request.json() as { token?: string };
  const token = body.token?.trim();

  if (!token) {
    return NextResponse.json({ error: 'Signing token is required' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: tokenRow } = await admin
    .from('contract_signing_tokens')
    .select('token, status, contracts(id, title, mode, recipient_email, payment_status, payment_amount_ngn)')
    .eq('token', token)
    .maybeSingle();

  const contract = Array.isArray(tokenRow?.contracts) ? tokenRow?.contracts[0] : tokenRow?.contracts;
  if (!tokenRow || !contract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
  if (tokenRow.status !== 'used') return NextResponse.json({ error: 'Sign the contract before paying' }, { status: 400 });
  if (contract.mode !== 'client' || contract.payment_status !== 'pending' || !contract.payment_amount_ngn) {
    return NextResponse.json({ error: 'This contract does not have a pending Paystack payment' }, { status: 400 });
  }

  const reference = `ctr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const origin = request.nextUrl.origin;
  const callbackUrl = `${origin}/contracts/sign/${token}?payment_ref=${reference}`;

  const { error: paymentError } = await admin.from('contract_payments').insert({
    contract_id: contract.id,
    status: 'pending',
    amount_ngn: contract.payment_amount_ngn,
    method: 'paystack',
    paystack_reference: reference,
  });

  if (paymentError) return NextResponse.json({ error: paymentError.message }, { status: 500 });

  try {
    const paystack = await initiatePayment({
      email: contract.recipient_email,
      amount_kobo: contract.payment_amount_ngn * 100,
      reference,
      metadata: {
        type: 'contract_payment',
        contract_id: contract.id,
        token,
      },
      callback_url: callbackUrl,
    });

    return NextResponse.json({ payment_url: paystack.data.authorization_url, reference });
  } catch (error) {
    console.error('[contracts/paystack/checkout] Paystack error:', error);
    await admin.from('contract_payments').delete().eq('paystack_reference', reference);
    return NextResponse.json({ error: 'Payment initiation failed. Please try again.' }, { status: 500 });
  }
}
