import { NextRequest, NextResponse } from 'next/server';
import {
  contractSignedNotificationHtml,
  contractSignedNotificationSubject,
} from '@/lib/email/templates/contracts';
import { sendEmail } from '@/lib/email';
import { isTokenExpired } from '@/lib/contracts/tokens';
import { createAdminClient } from '@/lib/supabase/admin';
import { contractSigningUrl } from '@/lib/urls';

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { token } = await params;
  const admin = createAdminClient();
  const result = await loadSigningContract(admin, token, { allowSigned: true });

  if ('response' in result) return result.response;
  await markViewed(admin, result.token.id, result.contract.id);

  return NextResponse.json({
    contract: {
      id: result.contract.id,
      title: result.contract.title,
      mode: result.contract.mode,
      recipient_name: result.contract.recipient_name,
      recipient_email: result.contract.recipient_email,
      rendered_html: result.contract.rendered_html,
      payment_status: result.contract.payment_status,
      payment_amount_ngn: result.contract.payment_amount_ngn,
      payment_description: result.contract.payment_description,
      signed_at: result.contract.signed_at,
    },
  });
}

export async function POST(request: NextRequest, { params }: Params) {
  const { token } = await params;
  const body = await request.json() as { signer_name?: string; consent_accepted?: boolean };
  const signerName = body.signer_name?.trim();

  if (!signerName) {
    return NextResponse.json({ error: 'Enter your full name to sign' }, { status: 400 });
  }
  if (!body.consent_accepted) {
    return NextResponse.json({ error: 'Consent is required before signing' }, { status: 400 });
  }

  const admin = createAdminClient();
  const result = await loadSigningContract(admin, token, { allowSigned: false });
  if ('response' in result) return result.response;

  const signedAt = new Date().toISOString();
  const snapshotHtml = result.contract.rendered_html ?? '';
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? null;
  const userAgent = request.headers.get('user-agent');
  const consentText = 'I have read this agreement and consent to sign it electronically by typing my full name.';

  const { error: signatureError } = await admin.from('contract_signatures').insert({
    contract_id: result.contract.id,
    token_id: result.token.id,
    signer_name: signerName,
    signer_email: result.contract.recipient_email,
    consent_text: consentText,
    consent_version: 'v1',
    ip_address: ipAddress,
    user_agent: userAgent,
    snapshot_html: snapshotHtml,
    signed_at: signedAt,
  });

  if (signatureError) {
    return NextResponse.json({ error: signatureError.message }, { status: 500 });
  }

  await Promise.all([
    admin
      .from('contract_signing_tokens')
      .update({ status: 'used', used_at: signedAt })
      .eq('id', result.token.id),
    admin
      .from('contracts')
      .update({
        status: 'signed',
        signed_at: signedAt,
        signed_snapshot_html: snapshotHtml,
      })
      .eq('id', result.contract.id),
  ]);

  const contactEmail = await loadContactEmail(admin);
  if (contactEmail) {
    void sendEmail({
      to: contactEmail,
      subject: contractSignedNotificationSubject(result.contract.title),
      html: contractSignedNotificationHtml({
        contractTitle: result.contract.title,
        signerName,
        signerEmail: result.contract.recipient_email,
        signedAt,
        signedContractUrl: contractSigningUrl(token),
      }),
    }).catch((emailErr: unknown) => {
      console.error('[contracts/sign] signed notification failed:', emailErr);
    });
  }

  return NextResponse.json({
    ok: true,
    signed_at: signedAt,
    payment_required: result.contract.mode === 'client' && result.contract.payment_status === 'pending',
  });
}

async function loadSigningContract(
  admin: ReturnType<typeof createAdminClient>,
  token: string,
  options: { allowSigned: boolean },
) {
  const { data: tokenRow, error } = await admin
    .from('contract_signing_tokens')
    .select('id, token, status, expires_at, contract_id, contracts(id, title, mode, recipient_name, recipient_email, status, rendered_html, payment_status, payment_amount_ngn, payment_description, signed_at)')
    .eq('token', token)
    .maybeSingle();

  if (error || !tokenRow) {
    return { response: NextResponse.json({ error: 'Signing link not found' }, { status: 404 }) };
  }

  const contract = Array.isArray(tokenRow.contracts) ? tokenRow.contracts[0] : tokenRow.contracts;
  if (!contract) {
    return { response: NextResponse.json({ error: 'Contract not found' }, { status: 404 }) };
  }

  if (tokenRow.status !== 'active') {
    if (options.allowSigned && tokenRow.status === 'used' && contract.status === 'signed') {
      return { token: tokenRow, contract };
    }

    return { response: NextResponse.json({ error: 'This signing link is no longer active' }, { status: 410 }) };
  }

  if (isTokenExpired(tokenRow.expires_at)) {
    await admin
      .from('contract_signing_tokens')
      .update({ status: 'expired' })
      .eq('id', tokenRow.id);
    await admin
      .from('contracts')
      .update({ status: 'expired' })
      .eq('id', tokenRow.contract_id)
      .neq('status', 'signed');
    return { response: NextResponse.json({ error: 'This signing link has expired' }, { status: 410 }) };
  }

  if (contract.status === 'signed') {
    if (options.allowSigned) return { token: tokenRow, contract };
    return { response: NextResponse.json({ error: 'This contract has already been signed' }, { status: 409 }) };
  }

  return { token: tokenRow, contract };
}

async function markViewed(
  admin: ReturnType<typeof createAdminClient>,
  tokenId: string,
  contractId: string,
): Promise<void> {
  const viewedAt = new Date().toISOString();
  await Promise.all([
    admin.from('contract_signing_tokens').update({ viewed_at: viewedAt }).eq('id', tokenId).is('viewed_at', null),
    admin.from('contracts').update({ status: 'viewed', viewed_at: viewedAt }).eq('id', contractId).eq('status', 'sent'),
  ]);
}

async function loadContactEmail(admin: ReturnType<typeof createAdminClient>): Promise<string | null> {
  const { data } = await admin
    .from('site_settings')
    .select('value')
    .eq('key', 'contact_email')
    .maybeSingle();

  return data?.value || null;
}
