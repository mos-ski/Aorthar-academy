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
  signedContractUrl: string;
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
            <a href="${escapeHtml(data.signedContractUrl)}" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-weight:700;">View signed agreement</a>
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
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="padding:48px 48px 0 48px;">
              <p style="margin:0 0 12px 0;color:#83b900;font-size:12px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;">${escapeHtml(eyebrow)}</p>
              <h1 style="margin:0;font-family:Impact,'Arial Narrow',Arial,sans-serif;color:#08694a;font-size:72px;line-height:0.9;font-weight:900;letter-spacing:-2px;text-transform:uppercase;">${escapeHtml(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 48px 0 48px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="height:14px;background:linear-gradient(90deg,#08694a 0%,#08694a 18%,#83b900 18%,#83b900 30%,#08694a 30%,#08694a 44%,#83b900 44%,#83b900 52%,#08694a 52%,#08694a 62%,#83b900 62%,#83b900 70%,#08694a 70%,#08694a 80%,#83b900 80%,#83b900 88%,#08694a 88%,#08694a 100%);border-radius:2px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:42px 48px 0 48px;font-size:18px;line-height:1.6;color:#000000;letter-spacing:-0.2px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:40px 48px 48px 48px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-top:32px;border-top:1px solid #e5e5e5;font-size:13px;color:#656565;">
                    Aorthar Academy · Contracts
                  </td>
                </tr>
              </table>
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
