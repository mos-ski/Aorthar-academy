import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import {
  contractSigningRequestHtml,
  contractSigningRequestSubject,
  ndaSigningRequestHtml,
  ndaSigningRequestSubject,
} from '@/lib/email/templates/contracts';
import { sendEmail } from '@/lib/email';
import { isNdaDocument, parseNdaRecipientRelationship, validateNdaMetadata } from '@/lib/contracts/nda';
import { findMissingContractFields, renderContractHtml } from '@/lib/contracts/placeholders';
import { createTokenExpiry, isContractSendableStatus } from '@/lib/contracts/tokens';
import { createAdminClient } from '@/lib/supabase/admin';
import { contractSigningUrl } from '@/lib/urls';
import type { ContractMode, ContractTemplateField } from '@/lib/contracts/types';

type Params = { params: Promise<{ id: string }> };

type TemplateFieldRow = {
  key: string;
  label: string;
  field_type: ContractTemplateField['fieldType'];
  is_required: boolean;
  sort_order: number;
};

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await requireAdminApi('finance');
    const { id } = await params;
    const body = await request.json().catch(() => ({})) as { delivery_method?: 'email' | 'link' };
    const deliveryMethod = body.delivery_method === 'link' ? 'link' : 'email';
    const admin = createAdminClient();

    const prepared = await prepareContractForSending(admin, id);
    if ('response' in prepared) return prepared.response;

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = createTokenExpiry().toISOString();
    const sentAt = new Date().toISOString();

    const { data: sent, error: sendError } = await admin.rpc('send_contract_document', {
      p_contract_id: id,
      p_token: token,
      p_expires_at: expiresAt,
      p_sent_to_email: prepared.contract.recipient_email,
      p_created_by: userId,
      p_rendered_html: prepared.renderedHtml,
      p_sent_at: sentAt,
    });
    if (sendError) return NextResponse.json({ error: sendError.message }, { status: 500 });
    if (!sent) {
      return NextResponse.json({ error: 'Signed or cancelled documents cannot be sent again' }, { status: 409 });
    }

    const signingUrl = contractSigningUrl(token);
    let emailError: string | null = null;

    if (deliveryMethod === 'email') {
      try {
        const nda = isNdaDocument(prepared.contract);
        await sendEmail({
          to: prepared.contract.recipient_email,
          subject: nda
            ? ndaSigningRequestSubject(prepared.contract.title)
            : contractSigningRequestSubject(prepared.contract.title),
          html: nda
            ? ndaSigningRequestHtml({
              recipientName: prepared.contract.recipient_name,
              contractTitle: prepared.contract.title,
              projectName: prepared.contract.project_name ?? 'the project',
              signingUrl,
              expiresAt,
            })
            : contractSigningRequestHtml({
              recipientName: prepared.contract.recipient_name,
              contractTitle: prepared.contract.title,
              signingUrl,
              expiresAt,
            }),
        });
      } catch (error) {
        emailError = error instanceof Error ? error.message : 'Email delivery failed';
      }
    }

    return NextResponse.json({
      ok: true,
      signing_url: signingUrl,
      expires_at: expiresAt,
      email_sent: deliveryMethod === 'email' && emailError === null,
      ...(emailError ? { email_error: emailError } : {}),
    });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}

async function prepareContractForSending(
  admin: ReturnType<typeof createAdminClient>,
  id: string,
): Promise<
  | {
    contract: {
      id: string;
      title: string;
      mode: ContractMode;
      document_type: 'agreement' | 'nda';
      recipient_name: string;
      recipient_email: string;
      recipient_phone: string | null;
      recipient_relationship: string | null;
      recipient_company: string | null;
      project_name: string | null;
    };
    renderedHtml: string;
  }
  | { response: NextResponse }
> {
  const { data: contract, error } = await admin
    .from('contracts')
    .select('id, title, mode, document_type, recipient_name, recipient_email, recipient_phone, recipient_relationship, recipient_company, project_name, status, contract_templates(content_html, contract_template_fields(key, label, field_type, is_required, sort_order)), contract_field_values(field_key, value)')
    .eq('id', id)
    .single();

  if (error || !contract) {
    return { response: NextResponse.json({ error: 'Contract not found' }, { status: 404 }) };
  }

  if (!isContractSendableStatus(contract.status)) {
    return {
      response: NextResponse.json(
        { error: `${contract.status === 'signed' ? 'Signed' : 'Cancelled'} documents cannot be sent again` },
        { status: 409 },
      ),
    };
  }

  if (!contract.recipient_email || !/^[^@]+@[^@]+\.[^@]+$/.test(contract.recipient_email)) {
    return { response: NextResponse.json({ error: 'A valid recipient email is required before sending' }, { status: 400 }) };
  }

  const template = Array.isArray(contract.contract_templates)
    ? contract.contract_templates[0]
    : contract.contract_templates;

  if (!template?.content_html) {
    return { response: NextResponse.json({ error: 'Contract template not found' }, { status: 404 }) };
  }

  const fields = (template.contract_template_fields ?? [])
    .map((field: TemplateFieldRow) => ({
      key: field.key,
      label: field.label,
      mode: contract.mode as ContractMode,
      fieldType: field.field_type,
      required: field.is_required,
      sortOrder: field.sort_order,
    }));

  const values = Object.fromEntries(
    (contract.contract_field_values ?? []).map((row: { field_key: string; value: string }) => [row.field_key, row.value]),
  ) as Record<string, string>;

  const missing = findMissingContractFields(template.content_html, fields, values);
  if (missing.length > 0) {
    return {
      response: NextResponse.json({
        error: 'Required fields must be completed before sending',
        missing_fields: missing.map((field) => ({ key: field.key, label: field.label })),
      }, { status: 400 }),
    };
  }

  if (isNdaDocument(contract)) {
    const ndaIssues = validateNdaMetadata({
      recipientName: contract.recipient_name,
      recipientEmail: contract.recipient_email,
      recipientPhone: contract.recipient_phone ?? '',
      recipientRelationship: parseNdaRecipientRelationship(contract.recipient_relationship) ?? '',
      recipientCompany: contract.recipient_company,
      projectName: contract.project_name ?? '',
      projectPurpose: values.project_purpose ?? '',
      effectiveDate: values.effective_date ?? '',
      confidentialityTerm: values.confidentiality_term ?? '',
    });
    if (ndaIssues.length > 0) {
      return {
        response: NextResponse.json({
          error: 'Required NDA details must be completed before sending',
          missing_fields: ndaIssues.map((issue) => ({ key: issue.field, label: issue.message })),
        }, { status: 400 }),
      };
    }
  }

  return {
    contract: {
      id: contract.id,
      title: contract.title,
      mode: contract.mode as ContractMode,
      document_type: contract.document_type as 'agreement' | 'nda',
      recipient_name: contract.recipient_name,
      recipient_email: contract.recipient_email,
      recipient_phone: contract.recipient_phone,
      recipient_relationship: contract.recipient_relationship,
      recipient_company: contract.recipient_company,
      project_name: contract.project_name,
    },
    renderedHtml: renderContractHtml(template.content_html, values, fields),
  };
}
