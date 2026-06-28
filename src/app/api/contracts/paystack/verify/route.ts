import { NextRequest, NextResponse } from 'next/server';
import { verifyTransaction } from '@/lib/paystack';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('ref')?.trim();
  if (!reference) {
    return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from('contract_payments')
    .select('id, contract_id, status')
    .eq('paystack_reference', reference)
    .maybeSingle();

  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  if (payment.status === 'paid') return NextResponse.json({ ok: true });

  let tx;
  try {
    tx = await verifyTransaction(reference);
  } catch (error) {
    console.error('[contracts/paystack/verify] Paystack verify error:', error);
    return NextResponse.json({ error: 'Could not verify payment. Please try again.' }, { status: 502 });
  }

  if (tx?.data?.status !== 'success') {
    return NextResponse.json({ error: 'Payment has not been confirmed yet.' }, { status: 402 });
  }

  const amountNgn = Math.round((tx?.data?.amount ?? 0) / 100);
  const paidAt = new Date().toISOString();

  await Promise.all([
    admin
      .from('contract_payments')
      .update({ status: 'paid', amount_ngn: amountNgn, paid_at: paidAt })
      .eq('id', payment.id),
    admin
      .from('contracts')
      .update({ payment_status: 'paid' })
      .eq('id', payment.contract_id),
  ]);

  return NextResponse.json({ ok: true, paid_at: paidAt });
}
