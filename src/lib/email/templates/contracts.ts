type ContractSigningRequestEmailData = {
  recipientName: string;
  contractTitle: string;
  signingUrl: string;
  expiresAt: string;
};

type ContractSignedNotificationEmailData = {
  contractTitle: string;
  signerName: string;
  signerEmail: string;
  signedAt: string;
  adminUrl: string;
};

export function contractSigningRequestSubject(contractTitle: string): string {
  return `Signature requested: ${contractTitle}`;
}

export function contractSigningRequestHtml(data: ContractSigningRequestEmailData): string {
  const expiresAt = formatEmailDate(data.expiresAt);

  return baseContractEmail({
    eyebrow: 'Signature Request',
    title: 'Review and sign your agreement',
    body: `
      <p style="margin:0 0 16px 0;">Hi ${escapeHtml(data.recipientName || 'there')},</p>
      <p style="margin:0 0 16px 0;">Aorthar has sent you <strong>${escapeHtml(data.contractTitle)}</strong> for review and signature.</p>
      <p style="margin:0 0 28px 0;">This secure link expires on <strong>${escapeHtml(expiresAt)}</strong>.</p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="border-radius:10px;background:#08694a;">
            <a href="${escapeHtml(data.signingUrl)}" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-weight:700;">Open agreement</a>
          </td>
        </tr>
      </table>
      <p style="margin:28px 0 0 0;color:#656565;font-size:13px;line-height:1.6;">If the button does not work, copy and paste this link into your browser:<br>${escapeHtml(data.signingUrl)}</p>
    `,
  });
}

export function contractSignedNotificationSubject(contractTitle: string): string {
  return `Signed: ${contractTitle}`;
}

export function contractSignedNotificationHtml(data: ContractSignedNotificationEmailData): string {
  return baseContractEmail({
    eyebrow: 'Contract Signed',
    title: 'Agreement completed',
    body: `
      <p style="margin:0 0 16px 0;"><strong>${escapeHtml(data.signerName)}</strong> has signed <strong>${escapeHtml(data.contractTitle)}</strong>.</p>
      <p style="margin:0 0 8px 0;">Signer email: ${escapeHtml(data.signerEmail)}</p>
      <p style="margin:0 0 28px 0;">Signed at: ${escapeHtml(formatEmailDate(data.signedAt))}</p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="border-radius:10px;background:#08694a;">
            <a href="${escapeHtml(data.adminUrl)}" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-weight:700;">View contract</a>
          </td>
        </tr>
      </table>
    `,
  });
}

function baseContractEmail({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} — Aorthar</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f8f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f7f8f4;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e4e8dd;border-radius:18px;overflow:hidden;">
          <tr>
            <td style="padding:40px 40px 0 40px;">
              <p style="margin:0 0 12px 0;color:#83b900;font-size:12px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;">${escapeHtml(eyebrow)}</p>
              <h1 style="margin:0;color:#08694a;font-size:34px;line-height:1.05;font-weight:850;letter-spacing:-0.5px;">${escapeHtml(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 40px 40px;font-size:16px;line-height:1.7;color:#1c1c1c;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;font-size:13px;color:#656565;border-top:1px solid #e5e5e5;">
              Aorthar Contracts
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function formatEmailDate(iso: string): string {
  return new Date(iso).toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
