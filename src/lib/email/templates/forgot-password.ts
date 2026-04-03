export interface ForgotPasswordEmailData {
  firstName: string;
  resetUrl: string;
}

export function forgotPasswordHtml(data: ForgotPasswordEmailData): string {
  const { firstName, resetUrl } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password — Aorthar Academy</title>
  <style>
    @media only screen and (max-width: 600px) {
      .headline { font-size: 48px !important; letter-spacing: -1px !important; }
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
                Reset<br/>
                Your<br/>
                <span style="color:#83b900;">Password</span>
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
              <p style="margin:0 0 32px 0;">Hi ${firstName},</p>
              <p style="margin:0 0 32px 0;">We received a request to reset the password for your Aorthar Academy account. Click the button below to choose a new one — this link expires in 1 hour.</p>
              <p style="margin:0;">If you didn't request a password reset, you can safely ignore this email. Your account is secure and nothing has changed.</p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:40px 48px 0 48px;">
              <a href="${resetUrl}" style="
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
              ">Reset my password →</a>
            </td>
          </tr>

          <!-- Fallback link -->
          <tr>
            <td style="padding:24px 48px 0 48px;font-size:13px;line-height:1.5;color:#656565;">
              <p style="margin:0;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="margin:8px 0 0 0;word-break:break-all;">
                <a href="${resetUrl}" style="color:#08694a;text-decoration:underline;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:48px 48px 0 48px;font-size:18px;line-height:1.5;color:#000000;letter-spacing:-0.2px;">
              <p style="margin:0 0 6px 0;font-weight:700;">Student Success</p>
              <p style="margin:0;">Aorthar Academy</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:40px 48px 48px 48px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-top:32px;border-top:1px solid #e5e5e5;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td>
                          <a href="https://www.aorthar.academy/unsubscribe" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:#656565;text-decoration:underline;">Unsubscribe</a>
                        </td>
                        <td align="right">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding-right:12px;">
                                <span style="font-family:'Montserrat',sans-serif;font-size:13px;color:#656565;font-weight:500;">Follow us</span>
                              </td>
                              <td style="padding-right:10px;">
                                <a href="https://twitter.com/aorthar" style="display:inline-block;width:26px;height:26px;background-color:#000000;border-radius:50%;text-align:center;line-height:26px;text-decoration:none;">
                                  <span style="color:#ffffff;font-size:13px;font-weight:700;font-family:Arial,sans-serif;">𝕏</span>
                                </a>
                              </td>
                              <td style="padding-right:10px;">
                                <a href="https://instagram.com/aorthar" style="display:inline-block;width:26px;height:26px;background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);border-radius:6px;text-align:center;line-height:26px;text-decoration:none;">
                                  <span style="color:#ffffff;font-size:13px;font-family:Arial,sans-serif;">&#9679;</span>
                                </a>
                              </td>
                              <td>
                                <a href="https://linkedin.com/company/aorthar" style="display:inline-block;width:26px;height:26px;background-color:#0a66c2;border-radius:4px;text-align:center;line-height:26px;text-decoration:none;">
                                  <span style="color:#ffffff;font-size:12px;font-weight:700;font-family:Arial,sans-serif;">in</span>
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
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
