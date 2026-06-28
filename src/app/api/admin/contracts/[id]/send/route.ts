import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import {
  contractSigningRequestHtml,
  contractSigningRequestSubject,
} from '@/lib/email/templates/contracts';
import { sendEmail } from '@/lib/email';
import { findMissingContractFields, renderContractHtml } from '@/lib/contracts/placeholders';
import { createTokenExpiry } from '@/lib/contracts/tokens';
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
    const admin = createAdminClient();

    const prepared = await prepareContractForSending(admin, id);
    if ('response' in prepared) return prepared.response;

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = createTokenExpiry().toISOString();

    await admin
      .from('contract_signing_tokens')
      .update({ status: 'revoked', revoked_at: new Date().toISOString() })
      .eq('contract_id', id)
      .eq('status', 'active');

    const { error: tokenError } = await admin.from('contract_signing_tokens').insert({
      contract_id: id,
      token,
      expires_at: expiresAt,
      sent_to_email: prepared.contract.recipient_email,
      created_by: userId,
    });

    if (tokenError) return NextResponse.json({ error: tokenError.message }, { status: 500 });

    const { error: updateError } = await admin
      .from('contracts')
      .update({
        status: 'sent',
        rendered_html: prepared.renderedHtml,
        sent_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    await sendEmail({
      to: prepared.contract.recipient_email,
      subject: contractSigningRequestSubject(prepared.contract.title),
      html: contractSigningRequestHtml({
        recipientName: prepared.contract.recipient_name,
        contractTitle: prepared.contract.title,
        signingUrl: contractSigningUrl(token),
        expiresAt,
      }),
    });

    return NextResponse.json({ ok: true, expires_at: expiresAt });
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
      recipient_name: string;
      recipient_email: string;
    };
    renderedHtml: string;
  }
  | { response: NextResponse }
> {
  const { data: contract, error } = await admin
    .from('contracts')
    .select('id, title, mode, recipient_name, recipient_email, contract_templates(content_html, contract_template_fields(key, label, field_type, is_required, sort_order)), contract_field_values(field_key, value)')
    .eq('id', id)
    .single();

  if (error || !contract) {
    return { response: NextResponse.json({ error: 'Contract not found' }, { status: 404 }) };
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

  return {
    contract: {
      id: contract.id,
      title: contract.title,
      mode: contract.mode as ContractMode,
      recipient_name: contract.recipient_name,
      recipient_email: contract.recipient_email,
    },
    renderedHtml: renderContractHtml(template.content_html, values, fields),
  };
}
