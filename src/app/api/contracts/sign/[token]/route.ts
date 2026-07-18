import { NextRequest, NextResponse } from 'next/server';
import {
  contractSignedNotificationHtml,
  contractSignedNotificationSubject,
  ndaCompletedOwnerHtml,
  ndaCompletedRecipientHtml,
  ndaCompletedSubject,
} from '@/lib/email/templates/contracts';
import { sendEmail } from '@/lib/email';
import {
  isNdaDocument,
  summarizeNdaDeliveryResults,
} from '@/lib/contracts/nda';
import { contractPdfBuffer, safeContractFilename } from '@/lib/contracts/pdf';
import { isTokenExpired } from '@/lib/contracts/tokens';
import { createAdminClient } from '@/lib/supabase/admin';
import { contractSigningUrl } from '@/lib/urls';
import type { NdaCompletionDeliveryStatus } from '@/lib/contracts/nda';

type Params = { params: Promise<{ token: string }> };

type AtomicSigningResult = {
  status: 'signed' | 'not_found' | 'inactive' | 'expired' | 'cancelled' | 'already_signed' | 'invalid_snapshot';
  signed_at?: string;
  snapshot_html?: string;
  signer_email?: string;
};

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
      document_type: result.contract.document_type,
      recipient_name: result.contract.recipient_name,
      recipient_email: result.contract.recipient_email,
      project_name: result.contract.project_name,
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

  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? null;
  const userAgent = request.headers.get('user-agent');
  const consentText = 'I have read this agreement and consent to sign it electronically by typing my full name.';

  const { data: signingData, error: signingError } = await admin.rpc('sign_contract_document', {
    p_token: token,
    p_signer_name: signerName,
    p_consent_text: consentText,
    p_consent_version: 'v1',
    p_ip_address: ipAddress,
    p_user_agent: userAgent,
  });
  if (signingError) {
    return NextResponse.json({ error: signingError.message }, { status: 500 });
  }

  const signingResult = signingData as AtomicSigningResult | null;
  if (!signingResult || signingResult.status !== 'signed') {
    const response = atomicSigningError(signingResult?.status);
    return NextResponse.json({ error: response.message }, { status: response.status });
  }

  const signedAt = signingResult.signed_at;
  const snapshotHtml = signingResult.snapshot_html;
  if (!signedAt || !snapshotHtml) {
    return NextResponse.json({ error: 'Signed document snapshot is unavailable' }, { status: 500 });
  }

  const contactEmail = await loadContactEmail(admin);
  let copyDelivery: NdaCompletionDeliveryStatus | 'not_applicable' = 'not_applicable';
  if (isNdaDocument(result.contract)) {
    try {
      const pdf = await contractPdfBuffer({
        title: result.contract.title,
        recipientName: result.contract.recipient_name,
        recipientEmail: result.contract.recipient_email,
        contractHtml: snapshotHtml,
        signature: {
          signer_name: signerName,
          signer_email: result.contract.recipient_email,
          signed_at: signedAt,
          ip_address: ipAddress,
          consent_text: consentText,
        },
      });
      const attachment = {
        filename: `${safeContractFilename(result.contract.title)}-signed.pdf`,
        content: pdf.toString('base64'),
      };
      const completedEmailData = {
        contractTitle: result.contract.title,
        projectName: result.contract.project_name ?? 'the project',
        signerName,
        signerEmail: result.contract.recipient_email,
        signedAt,
      };
      const recipientDelivery = sendEmail({
          to: result.contract.recipient_email,
          subject: ndaCompletedSubject(result.contract.title),
          html: ndaCompletedRecipientHtml({
            ...completedEmailData,
            recipientName: result.contract.recipient_name,
          }),
          attachments: [attachment],
        });
      const ownerDelivery = contactEmail
        ? sendEmail({
          to: contactEmail,
          subject: ndaCompletedSubject(result.contract.title),
          html: ndaCompletedOwnerHtml(completedEmailData),
          attachments: [attachment],
        })
        : Promise.reject(new Error('Owner contact email is not configured'));

      const [recipientResult, ownerResult] = await Promise.allSettled([
        recipientDelivery,
        ownerDelivery,
      ]);
      copyDelivery = summarizeNdaDeliveryResults(
        recipientResult.status === 'fulfilled',
        true,
        ownerResult.status === 'fulfilled',
      );
      const deliveryErrors = [recipientResult, ownerResult]
        .filter((delivery): delivery is PromiseRejectedResult => delivery.status === 'rejected')
        .map((delivery) => errorMessage(delivery.reason));

      if (deliveryErrors.length > 0) {
        console.error('[contracts/sign] completed NDA delivery failed:', deliveryErrors.join('; '));
      }
      await persistCompletionDelivery(admin, result.contract.id, copyDelivery, deliveryErrors);
    } catch (pdfError) {
      console.error('[contracts/sign] completed NDA PDF generation failed:', pdfError);
      copyDelivery = 'failed';
      await persistCompletionDelivery(admin, result.contract.id, copyDelivery, [errorMessage(pdfError)]);

      if (contactEmail) {
        try {
          await sendEmail({
            to: contactEmail,
            subject: contractSignedNotificationSubject(result.contract.title),
            html: contractSignedNotificationHtml({
              contractTitle: result.contract.title,
              signerName,
              signerEmail: result.contract.recipient_email,
              signedAt,
              signedContractUrl: contractSigningUrl(token),
            }),
          });
        } catch (fallbackError) {
          console.error('[contracts/sign] owner fallback notification failed:', fallbackError);
        }
      }
    }
  } else if (contactEmail) {
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
    copy_delivery: copyDelivery,
    payment_required: !isNdaDocument(result.contract)
      && result.contract.mode === 'client'
      && result.contract.payment_status === 'pending',
  });
}

async function loadSigningContract(
  admin: ReturnType<typeof createAdminClient>,
  token: string,
  options: { allowSigned: boolean },
) {
  const { data: tokenRow, error } = await admin
    .from('contract_signing_tokens')
    .select('id, token, status, expires_at, contract_id, contracts(id, title, mode, document_type, recipient_name, recipient_email, project_name, status, rendered_html, payment_status, payment_amount_ngn, payment_description, signed_at)')
    .eq('token', token)
    .maybeSingle();

  if (error || !tokenRow) {
    return { response: NextResponse.json({ error: 'Signing link not found' }, { status: 404 }) };
  }

  const contract = Array.isArray(tokenRow.contracts) ? tokenRow.contracts[0] : tokenRow.contracts;
  if (!contract) {
    return { response: NextResponse.json({ error: 'Contract not found' }, { status: 404 }) };
  }

  if (contract.status === 'cancelled') {
    return { response: NextResponse.json({ error: 'This document has been cancelled' }, { status: 410 }) };
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

function atomicSigningError(status?: AtomicSigningResult['status']): { message: string; status: number } {
  switch (status) {
    case 'not_found':
      return { message: 'Signing link not found', status: 404 };
    case 'already_signed':
      return { message: 'This contract has already been signed', status: 409 };
    case 'expired':
      return { message: 'This signing link has expired', status: 410 };
    case 'cancelled':
      return { message: 'This document has been cancelled', status: 410 };
    case 'inactive':
      return { message: 'This signing link is no longer active', status: 410 };
    default:
      return { message: 'The document could not be signed', status: 500 };
  }
}

async function persistCompletionDelivery(
  admin: ReturnType<typeof createAdminClient>,
  contractId: string,
  status: NdaCompletionDeliveryStatus,
  errors: string[],
): Promise<void> {
  const { error } = await admin
    .from('contracts')
    .update({
      completion_delivery_status: status,
      completion_delivery_error: errors.length > 0 ? errors.join('; ').slice(0, 2000) : null,
    })
    .eq('id', contractId);

  if (error) {
    console.error('[contracts/sign] completion delivery status update failed:', error.message);
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
