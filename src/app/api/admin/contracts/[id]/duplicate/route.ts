import { NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { upsertContractFieldValues } from '@/lib/contracts/admin';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string }> };

type FieldValueRow = {
  field_key: string;
  value: string;
  field_label: string;
  field_type: string;
};

export async function POST(_request: Request, { params }: Params) {
  try {
    const { userId } = await requireAdminApi('finance');
    const { id } = await params;
    const admin = createAdminClient();

    const { data: source, error: sourceError } = await admin
      .from('contracts')
      .select('template_id, mode, title, recipient_name, recipient_email, payment_amount_ngn, payment_description, contract_field_values(field_key, value, field_label, field_type)')
      .eq('id', id)
      .single();

    if (sourceError || !source) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const paymentAmount = Number(source.payment_amount_ngn ?? 0);
    const paymentStatus = source.mode === 'client' && paymentAmount > 0 ? 'pending' : 'not_required';
    const { data: copy, error: copyError } = await admin
      .from('contracts')
      .insert({
        template_id: source.template_id,
        mode: source.mode,
        title: `Copy of ${source.title}`,
        recipient_name: source.recipient_name,
        recipient_email: source.recipient_email,
        payment_amount_ngn: paymentAmount > 0 ? paymentAmount : null,
        payment_description: source.payment_description,
        payment_status: paymentStatus,
        status: 'draft',
        created_by: userId,
      })
      .select('id')
      .single();

    if (copyError || !copy) {
      return NextResponse.json({ error: copyError?.message ?? 'Failed to duplicate contract' }, { status: 500 });
    }

    const fieldRows = (source.contract_field_values ?? []) as FieldValueRow[];
    await upsertContractFieldValues(
      admin,
      copy.id,
      Object.fromEntries(fieldRows.map((row) => [row.field_key, row.value])),
      Object.fromEntries(fieldRows.map((row) => [row.field_key, { label: row.field_label, fieldType: row.field_type }])),
    );

    if (paymentStatus === 'pending' && paymentAmount > 0) {
      await admin.from('contract_payments').insert({
        contract_id: copy.id,
        status: 'pending',
        amount_ngn: paymentAmount,
        method: 'paystack',
        created_by: userId,
      });
    }

    return NextResponse.json({ contract: copy });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
