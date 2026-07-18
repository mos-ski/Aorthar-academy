import { NextRequest, NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { upsertContractFieldValues } from '@/lib/contracts/admin';
import {
  isNdaDocument,
  ndaMetadataFieldValues,
  parseNdaRecipientRelationship,
} from '@/lib/contracts/nda';
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

    const admin = createAdminClient();
    const { data: existing, error: existingError } = await admin
      .from('contracts')
      .select('status, document_type, mode, updated_at, recipient_name, recipient_email, recipient_phone, recipient_relationship, recipient_company, project_name')
      .eq('id', id)
      .maybeSingle();
    if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
    if (!existing) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });

    const bodyKeys = Object.keys(body).filter((key) => key !== 'status');
    if (body.status === 'cancelled') {
      if (bodyKeys.length > 0) {
        return NextResponse.json({ error: 'Cancel the document separately from editing it' }, { status: 400 });
      }

      const cancelledAt = new Date().toISOString();
      const { data: cancelled, error: cancelError } = await admin.rpc('cancel_contract_document', {
        p_contract_id: id,
        p_cancelled_at: cancelledAt,
      });
      if (cancelError) return NextResponse.json({ error: cancelError.message }, { status: 500 });
      if (!cancelled) {
        return NextResponse.json({ error: 'Signed or already-cancelled documents cannot be cancelled' }, { status: 409 });
      }

      return NextResponse.json({ ok: true });
    }

    if (existing.status !== 'draft' && (bodyKeys.length > 0 || body.status !== undefined)) {
      return NextResponse.json({ error: 'Only draft documents can be edited' }, { status: 409 });
    }

    if (
      isNdaDocument(existing)
      && (body.payment_amount_ngn !== undefined || body.payment_description !== undefined)
    ) {
      return NextResponse.json({ error: 'NDAs cannot include payment fields' }, { status: 400 });
    }

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
    if (body.status !== undefined) updateData.status = body.status;

    if (isNdaDocument(existing)) {
      if (bodyKeys.length === 0) return NextResponse.json({ ok: true });

      const relationship = parseNdaRecipientRelationship(
        body.recipient_relationship ?? existing.recipient_relationship,
      );
      const values = { ...(body.values ?? {}) };
      const metadataValues = ndaMetadataFieldValues({
        recipientName: body.recipient_name ?? existing.recipient_name,
        recipientEmail: body.recipient_email ?? existing.recipient_email,
        recipientPhone: body.recipient_phone ?? existing.recipient_phone ?? '',
        recipientRelationship: relationship ?? '',
        recipientCompany: body.recipient_company === undefined
          ? existing.recipient_company
          : body.recipient_company,
        projectName: body.project_name ?? existing.project_name ?? '',
        projectPurpose: body.values?.project_purpose ?? '',
        effectiveDate: body.values?.effective_date ?? '',
        confidentialityTerm: body.values?.confidentiality_term ?? '',
      });
      const synchronizedKeys = [
        ['recipient_name', body.recipient_name],
        ['recipient_email', body.recipient_email],
        ['recipient_phone', body.recipient_phone],
        ['recipient_relationship', body.recipient_relationship],
        ['recipient_company', body.recipient_company],
        ['project_name', body.project_name],
      ] as const;
      synchronizedKeys.forEach(([fieldKey, columnValue]) => {
        if (columnValue !== undefined || fieldKey in values) {
          values[fieldKey] = metadataValues[fieldKey];
        }
      });

      const { data: updated, error: updateError } = await admin.rpc('update_nda_contract_draft', {
        p_contract_id: id,
        p_expected_updated_at: existing.updated_at,
        p_update: updateData,
        p_values: values,
      });
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
      if (!updated) {
        return NextResponse.json(
          { error: 'This NDA changed while you were editing it. Refresh and try again' },
          { status: 409 },
        );
      }

      return NextResponse.json({ ok: true });
    }

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
