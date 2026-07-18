import { NextRequest, NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { upsertContractFieldValues } from '@/lib/contracts/admin';
import { parseNdaRecipientRelationship } from '@/lib/contracts/nda';
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
      recipient_phone?: string;
      recipient_relationship?: string;
      recipient_company?: string | null;
      project_name?: string;
      payment_amount_ngn?: number | null;
      payment_description?: string | null;
      values?: Record<string, string>;
      status?: 'draft' | 'cancelled';
    };

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.recipient_name !== undefined) updateData.recipient_name = body.recipient_name.trim();
    if (body.recipient_email !== undefined) updateData.recipient_email = body.recipient_email.trim().toLowerCase();
    if (body.recipient_phone !== undefined) updateData.recipient_phone = body.recipient_phone.trim() || null;
    if (body.recipient_relationship !== undefined) {
      updateData.recipient_relationship = parseNdaRecipientRelationship(body.recipient_relationship);
    }
    if (body.recipient_company !== undefined) updateData.recipient_company = body.recipient_company?.trim() || null;
    if (body.project_name !== undefined) updateData.project_name = body.project_name.trim() || null;
    if (body.payment_amount_ngn !== undefined) updateData.payment_amount_ngn = body.payment_amount_ngn;
    if (body.payment_description !== undefined) updateData.payment_description = body.payment_description?.trim() || null;
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === 'cancelled') updateData.cancelled_at = new Date().toISOString();
    }

    const admin = createAdminClient();
    const { data: existing } = await admin
      .from('contracts')
      .select('status')
      .eq('id', id)
      .single();
    if (!existing) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    if (existing.status === 'signed' && (Object.keys(updateData).length > 0 || body.values)) {
      return NextResponse.json({ error: 'Signed documents cannot be edited' }, { status: 409 });
    }

    if (Object.keys(updateData).length > 0) {
      const { error } = await admin.from('contracts').update(updateData).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (body.values) await upsertContractFieldValues(admin, id, body.values);
    if (body.status === 'cancelled') {
      await admin
        .from('contract_signing_tokens')
        .update({ status: 'revoked', revoked_at: new Date().toISOString() })
        .eq('contract_id', id)
        .eq('status', 'active');
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAdminApi('finance');
    const { id } = await params;
    const admin = createAdminClient();

    const { error } = await admin.from('contracts').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
