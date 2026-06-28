import puppeteer from 'puppeteer';

type ContractPdfInput = {
  title: string;
  recipientName: string;
  recipientEmail?: string | null;
  contractHtml: string;
  signature?: {
    signer_name: string;
    signer_email: string;
    signed_at: string;
    ip_address: string | null;
    consent_text?: string | null;
  } | null;
};

export async function contractPdfBuffer(input: ContractPdfInput): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(printableContractHtml(input), { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '18mm', right: '16mm', bottom: '18mm', left: '16mm' },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export function printableContractHtml({
  title,
  recipientName,
  recipientEmail,
  contractHtml,
  signature,
}: ContractPdfInput): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #ffffff; color: #111111; font-family: Helvetica, Arial, sans-serif; }
    main { width: 100%; }
    h1 { margin: 0 0 8px; color: #08694a; font-size: 26px; line-height: 1.2; }
    .meta { margin-bottom: 28px; color: #555555; font-size: 12px; }
    .contract { font-size: 13px; line-height: 1.72; }
    .contract p { margin: 0 0 10px; }
    .contract ul, .contract ol { margin: 8px 0 12px; padding-left: 22px; }
    .contract li { margin: 0 0 5px; }
    .contract h1, .contract h2, .contract h3 { color: #111111; margin: 18px 0 8px; line-height: 1.25; }
    .contract h2 { font-size: 18px; }
    .contract h3 { font-size: 15px; }
    .proof { margin-top: 36px; padding-top: 18px; border-top: 1px solid #dddddd; font-size: 12px; page-break-inside: avoid; }
    .proof-title { margin: 0 0 8px; font-weight: 700; }
    .signature { margin: 10px 0 8px; font-family: "Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive; font-size: 32px; color: #111111; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <div class="meta">Recipient: ${escapeHtml(recipientName)}${recipientEmail ? ` · ${escapeHtml(recipientEmail)}` : ''}</div>
    <section class="contract">${contractHtml}</section>
    <section class="proof">
      <p class="proof-title">Signature proof</p>
      ${signature ? `
        <div class="signature">${escapeHtml(signature.signer_name)}</div>
        <p>Signed by ${escapeHtml(signature.signer_email)} on ${escapeHtml(new Date(signature.signed_at).toLocaleString('en-NG'))}</p>
        <p>IP address: ${escapeHtml(signature.ip_address ?? '-')}</p>
        ${signature.consent_text ? `<p>${escapeHtml(signature.consent_text)}</p>` : ''}
      ` : '<p>Not signed yet.</p>'}
    </section>
  </main>
</body>
</html>`;
}

export function safeContractFilename(value: string): string {
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
