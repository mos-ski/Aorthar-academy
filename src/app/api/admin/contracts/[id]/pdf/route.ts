import { NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdminApi('finance');
    const { id } = await params;
    const admin = createAdminClient();
    const { data: contract } = await admin
      .from('contracts')
      .select('id, title, recipient_name, recipient_email, signed_snapshot_html, rendered_html, contract_signatures(signer_name, signer_email, signed_at, ip_address, consent_text)')
      .eq('id', id)
      .single();

    if (!contract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    const signature = Array.isArray(contract.contract_signatures) ? contract.contract_signatures[0] : contract.contract_signatures;
    const html = contract.signed_snapshot_html ?? contract.rendered_html ?? '<p>No contract snapshot available.</p>';

    return new NextResponse(printableContractHtml({
      title: contract.title,
      recipientName: contract.recipient_name,
      recipientEmail: contract.recipient_email,
      contractHtml: html,
      signature,
    }), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${safeFilename(contract.title)}.html"`,
      },
    });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}

function printableContractHtml({
  title,
  recipientName,
  recipientEmail,
  contractHtml,
  signature,
}: {
  title: string;
  recipientName: string;
  recipientEmail: string;
  contractHtml: string;
  signature?: {
    signer_name: string;
    signer_email: string;
    signed_at: string;
    ip_address: string | null;
    consent_text: string;
  } | null;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; background: #f6f6f1; color: #111; font-family: Helvetica, Arial, sans-serif; }
    main { max-width: 820px; margin: 32px auto; background: #fff; padding: 56px; border: 1px solid #ddd; }
    h1 { margin: 0 0 8px; color: #08694a; }
    .meta { margin-bottom: 32px; color: #555; font-size: 13px; }
    .contract { font-size: 14px; line-height: 1.75; }
    .proof { margin-top: 48px; padding-top: 24px; border-top: 1px solid #ddd; font-size: 13px; }
    .signature { margin-top: 12px; font-family: "Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive; font-size: 32px; }
    @media print {
      body { background: #fff; }
      main { margin: 0; border: 0; padding: 0; max-width: none; }
    }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <div class="meta">Recipient: ${escapeHtml(recipientName)} · ${escapeHtml(recipientEmail)}</div>
    <section class="contract">${contractHtml}</section>
    <section class="proof">
      <strong>Signature proof</strong>
      ${signature ? `
        <div class="signature">${escapeHtml(signature.signer_name)}</div>
        <p>Signed by ${escapeHtml(signature.signer_email)} on ${escapeHtml(new Date(signature.signed_at).toLocaleString('en-NG'))}</p>
        <p>IP address: ${escapeHtml(signature.ip_address ?? '-')}</p>
        <p>${escapeHtml(signature.consent_text)}</p>
      ` : '<p>Not signed yet.</p>'}
    </section>
  </main>
  <script>window.addEventListener('load', () => window.print());</script>
</body>
</html>`;
}

function safeFilename(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'contract';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
