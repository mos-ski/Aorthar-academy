import { NextRequest, NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { upsertContractFieldValues } from '@/lib/contracts/admin';
import {
  isContractTemplateCompatible,
  ndaMetadataFieldValues,
  parseNdaRecipientRelationship,
} from '@/lib/contracts/nda';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ContractDocumentType, ContractMode } from '@/lib/contracts/types';

export async function GET(request: NextRequest) {
  try {
    await requireAdminApi('finance');
    const mode = request.nextUrl.searchParams.get('mode');
    const documentType = request.nextUrl.searchParams.get('document_type');
    const status = request.nextUrl.searchParams.get('status');
    const admin = createAdminClient();

    let query = admin
      .from('contracts')
      .select('*, contract_payments(*)')
      .order('created_at', { ascending: false });

    if (mode) query = query.eq('mode', mode);
    if (documentType) query = query.eq('document_type', documentType);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ contracts: data ?? [] });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAdminApi('finance');
    const body = await request.json() as {
      template_id?: string;
      document_type?: ContractDocumentType;
      mode?: ContractMode;
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
    };

    if (!body.template_id) return NextResponse.json({ error: 'Template is required' }, { status: 400 });
    const documentType: ContractDocumentType = body.document_type === 'nda' || body.mode === 'nda'
      ? 'nda'
      : 'agreement';
    const mode: ContractMode = documentType === 'nda' ? 'nda' : body.mode as ContractMode;

    if (!mode || !['employee', 'contractor', 'client', 'nda'].includes(mode)) {
      return NextResponse.json({ error: 'Valid contract mode is required' }, { status: 400 });
    }
    if (documentType === 'agreement' && mode === 'nda') {
      return NextResponse.json({ error: 'NDA mode requires an NDA document type' }, { status: 400 });
    }
    if (!body.title?.trim()) return NextResponse.json({ error: 'Contract title is required' }, { status: 400 });

    const admin = createAdminClient();
    const { data: template, error: templateError } = await admin
      .from('contract_templates')
      .select('id, mode, document_type, status')
      .eq('id', body.template_id)
      .maybeSingle();

    if (templateError) {
      return NextResponse.json({ error: templateError.message }, { status: 500 });
    }
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    if (!isContractTemplateCompatible(template, documentType, mode)) {
      return NextResponse.json(
        { error: 'Select an active template that matches this document type and mode' },
        { status: 400 },
      );
    }

    const paymentAmount = Number(body.payment_amount_ngn ?? 0);
    const paymentStatus = documentType === 'agreement' && mode === 'client' && paymentAmount > 0
      ? 'pending'
      : 'not_required';
    const recipientRelationship = parseNdaRecipientRelationship(body.recipient_relationship);
    const values = documentType === 'nda'
      ? {
        ...(body.values ?? {}),
        ...ndaMetadataFieldValues({
          recipientName: body.recipient_name ?? '',
          recipientEmail: body.recipient_email ?? '',
          recipientPhone: body.recipient_phone ?? '',
          recipientRelationship: recipientRelationship ?? '',
          recipientCompany: body.recipient_company,
          projectName: body.project_name ?? '',
          projectPurpose: body.values?.project_purpose ?? '',
          effectiveDate: body.values?.effective_date ?? '',
          confidentialityTerm: body.values?.confidentiality_term ?? '',
        }),
      }
      : body.values ?? {};

    const { data: contract, error } = await admin
      .from('contracts')
      .insert({
        template_id: body.template_id,
        document_type: documentType,
        mode,
        title: body.title.trim(),
        recipient_name: body.recipient_name?.trim() ?? '',
        recipient_email: body.recipient_email?.trim().toLowerCase() ?? '',
        recipient_phone: body.recipient_phone?.trim() || null,
        recipient_relationship: recipientRelationship,
        recipient_company: body.recipient_company?.trim() || null,
        project_name: body.project_name?.trim() || null,
        payment_amount_ngn: paymentStatus === 'pending' ? paymentAmount : null,
        payment_description: paymentStatus === 'pending' ? body.payment_description?.trim() || null : null,
        payment_status: paymentStatus,
        created_by: userId,
      })
      .select()
      .single();

    if (error || !contract) {
      return NextResponse.json({ error: error?.message ?? 'Failed to create contract' }, { status: 500 });
    }

    await upsertContractFieldValues(admin, contract.id, values);

    if (paymentStatus === 'pending' && paymentAmount > 0) {
      await admin.from('contract_payments').insert({
        contract_id: contract.id,
        status: 'pending',
        amount_ngn: paymentAmount,
        method: 'paystack',
        created_by: userId,
      });
    }

    return NextResponse.json({ contract });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
