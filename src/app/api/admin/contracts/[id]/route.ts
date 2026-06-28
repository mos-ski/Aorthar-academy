import { NextRequest, NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { upsertContractFieldValues } from '@/lib/contracts/admin';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireAdminApi('finance');
    const { id } = await params;
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('contracts')
      .select('*, contract_field_values(*), contract_signing_tokens(*), contract_signatures(*), contract_payments(*), contract_templates(*, contract_template_fields(*))')
      .eq('id', id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    return NextResponse.json({ contract: data });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireAdminApi('finance');
    const { id } = await params;
    const body = await request.json() as {
      title?: string;
      recipient_name?: string;
      recipient_email?: string;
      payment_amount_ngn?: number | null;
      payment_description?: string | null;
      values?: Record<string, string>;
      status?: 'draft' | 'cancelled';
    };

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.recipient_name !== undefined) updateData.recipient_name = body.recipient_name.trim();
    if (body.recipient_email !== undefined) updateData.recipient_email = body.recipient_email.trim().toLowerCase();
    if (body.payment_amount_ngn !== undefined) updateData.payment_amount_ngn = body.payment_amount_ngn;
    if (body.payment_description !== undefined) updateData.payment_description = body.payment_description?.trim() || null;
    if (body.status !== undefined) updateData.status = body.status;

    const admin = createAdminClient();
    if (Object.keys(updateData).length > 0) {
      const { error } = await admin.from('contracts').update(updateData).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (body.values) await upsertContractFieldValues(admin, id, body.values);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
