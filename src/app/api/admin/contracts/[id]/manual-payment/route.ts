import { NextRequest, NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await requireAdminApi('finance');
    const { id } = await params;
    const body = await request.json() as {
      amount_ngn?: number;
      method?: 'bank_transfer' | 'cash' | 'other';
      manual_reference?: string;
      note?: string;
      paid_at?: string;
    };

    const amount = Number(body.amount_ngn);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'A valid amount is required' }, { status: 400 });
    }

    const paidAt = body.paid_at ? new Date(body.paid_at).toISOString() : new Date().toISOString();
    const admin = createAdminClient();

    const { error: paymentError } = await admin
      .from('contract_payments')
      .insert({
        contract_id: id,
        status: 'manual_paid',
        amount_ngn: amount,
        method: body.method ?? 'bank_transfer',
        manual_reference: body.manual_reference?.trim() || null,
        note: body.note?.trim() || null,
        paid_at: paidAt,
        created_by: userId,
      });

    if (paymentError) return NextResponse.json({ error: paymentError.message }, { status: 500 });

    const { error: contractError } = await admin
      .from('contracts')
      .update({ payment_status: 'manual_paid' })
      .eq('id', id);

    if (contractError) return NextResponse.json({ error: contractError.message }, { status: 500 });

    return NextResponse.json({ ok: true, paid_at: paidAt });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
