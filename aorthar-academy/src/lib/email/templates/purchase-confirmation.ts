export interface PurchaseConfirmationData {
  firstName: string;
  purchaseType: 'course' | 'subscription';
  itemName: string; // course title or plan name
  amountNgn: number;
  dashboardUrl: string;
}

export function purchaseConfirmationHtml(data: PurchaseConfirmationData): string {
  const { firstName, purchaseType, itemName, amountNgn, dashboardUrl } = data;

  const bodyParagraph1 =
    purchaseType === 'course'
      ? `Your payment of <strong>₦${amountNgn.toLocaleString('en-NG')}</strong> was received and you now have full access to <strong>${itemName}</strong>. Head to your dashboard to dive in — your lessons are ready and waiting.`
      : `Your payment of <strong>₦${amountNgn.toLocaleString('en-NG')}</strong> was received and your Aorthar Academy account has been upgraded to <strong>${itemName}</strong>. You now have access to all Year 400 courses, capstone submission, and every premium feature the platform has to offer.`;

  const bodyParagraph2 =
    purchaseType === 'course'
      ? `We built this course with a lot of care, and we're genuinely excited for you to go through it. Take your time, engage with the material, and don't hesitate to reach out if you ever need support. We're rooting for you.`
      : `This is a big step in your learning journey, and we don't take that lightly. Go at your own pace, engage deeply, and remember — the Aorthar Academy team is always here if you need anything. We're rooting for you.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You just secured a sweet spot — Aorthar Academy</title>
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
                You just<br/>
                Secured a<br/>
                <span style="color:#83b900;">Sweet</span> Spot
              </h1>
            </td>
          </tr>

          <!-- Decorative divider — mimics the Figma green block strip -->
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
              <p style="margin:0 0 32px 0;">Hi ${firstName}! 🎉</p>
              <p style="margin:0 0 32px 0;">${bodyParagraph1}</p>
              <p style="margin:0;">${bodyParagraph2}</p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:40px 48px 0 48px;">
              <a href="${dashboardUrl}" style="
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
              ">Go to my dashboard →</a>
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
            <td style="padding:40px 48px 48px 48px;border-top:1px solid #e5e5e5;margin-top:40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-top:32px;">
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
                              <!-- Twitter/X -->
                              <td style="padding-right:10px;">
                                <a href="https://twitter.com/aorthar" style="display:inline-block;width:26px;height:26px;background-color:#000000;border-radius:50%;text-align:center;line-height:26px;text-decoration:none;">
                                  <span style="color:#ffffff;font-size:13px;font-weight:700;font-family:Arial,sans-serif;">𝕏</span>
                                </a>
                              </td>
                              <!-- Instagram -->
                              <td style="padding-right:10px;">
                                <a href="https://instagram.com/aorthar" style="display:inline-block;width:26px;height:26px;background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);border-radius:6px;text-align:center;line-height:26px;text-decoration:none;">
                                  <span style="color:#ffffff;font-size:13px;font-family:Arial,sans-serif;">&#9679;</span>
                                </a>
                              </td>
                              <!-- LinkedIn -->
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

export function purchaseConfirmationSubject(
  purchaseType: 'course' | 'subscription',
  itemName: string,
): string {
  return purchaseType === 'course'
    ? `You're in! Access to "${itemName}" is ready`
    : `Welcome to Aorthar Academy Premium — you're all set`;
}
