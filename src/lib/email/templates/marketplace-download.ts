export interface MarketplaceDownloadData {
  productName: string;
  downloadUrl: string;
  tokenExpiresAt: string; // ISO timestamp
  amountNgn: number;
  email: string;
}

export function marketplaceDownloadSubject(productName: string): string {
  return `Your download is ready — ${productName}`;
}

export function marketplaceDownloadHtml(data: MarketplaceDownloadData): string {
  const { productName, downloadUrl, tokenExpiresAt, amountNgn, email } = data;

  const expiryDate = new Date(tokenExpiresAt).toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${marketplaceDownloadSubject(productName)}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .headline { font-size: 52px !important; letter-spacing: -1px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:48px 48px 0 48px;">
              <h1 class="headline" style="
                margin:0;
                font-family:Impact,'Arial Narrow',Arial,sans-serif;
                font-size:96px;
                font-weight:900;
                line-height:0.88;
                letter-spacing:-3px;
                text-transform:uppercase;
                color:#08694a;
              ">
                Your File<br/>
                Is <span style="color:#83b900;">Ready</span>
              </h1>
            </td>
          </tr>

          <!-- Decorative divider -->
          <tr>
            <td style="padding:40px 48px 0 48px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="height:14px;background:linear-gradient(90deg,#08694a 0%,#08694a 18%,#83b900 18%,#83b900 30%,#08694a 30%,#08694a 44%,#83b900 44%,#83b900 52%,#08694a 52%,#08694a 62%,#83b900 62%,#83b900 70%,#08694a 70%,#08694a 80%,#83b900 80%,#83b900 88%,#08694a 88%,#08694a 100%);border-radius:2px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 48px 0 48px;font-size:18px;line-height:1.6;color:#000000;letter-spacing:-0.2px;">
              <p style="margin:0 0 24px 0;">Hi there! 🎉</p>
              <p style="margin:0 0 24px 0;">
                Your payment of <strong>₦${amountNgn.toLocaleString('en-NG')}</strong> was received and
                <strong>${productName}</strong> is ready to download. Click the button below to get your file.
              </p>
              <p style="margin:0;">
                We sent this to <strong>${email}</strong>. Keep this email safe — you can always come back to download again
                before the link expires.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:40px 48px 0 48px;">
              <a href="${downloadUrl}" style="
                display:inline-block;
                background-color:#08694a;
                color:#ffffff;
                font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                font-size:16px;
                font-weight:700;
                text-decoration:none;
                padding:14px 32px;
                border-radius:6px;
                letter-spacing:0.2px;
              ">Download ${productName} →</a>
            </td>
          </tr>

          <!-- Expiry notice -->
          <tr>
            <td style="padding:32px 48px 0 48px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color:#f5f5f5;border-radius:8px;padding:16px 20px;">
                    <p style="margin:0;font-size:14px;color:#555555;line-height:1.5;">
                      ⏳ <strong>Download link expires on ${expiryDate}</strong>. After that, please contact
                      <a href="mailto:hello@aorthar.com" style="color:#08694a;text-decoration:underline;">hello@aorthar.com</a> to
                      get a fresh link.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:48px 48px 0 48px;font-size:18px;line-height:1.5;color:#000000;letter-spacing:-0.2px;">
              <p style="margin:0 0 6px 0;font-weight:700;">The Aorthar Team</p>
              <p style="margin:0;color:#555555;font-size:15px;">aorthar.com</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:40px 48px 48px 48px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-top:32px;border-top:1px solid #e5e5e5;">
                    <p style="margin:0;font-size:13px;color:#888888;line-height:1.5;">
                      You received this email because you purchased ${productName} from Aorthar.
                      Questions? Email <a href="mailto:hello@aorthar.com" style="color:#08694a;">hello@aorthar.com</a>.
                    </p>
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
