export interface InternshipWelcomeData {
  firstName: string;
  studyUrl: string;
  examScheduledAt: string; // human-readable, e.g. "Wednesday, 30 April 2026 at 10:00 AM WAT"
}

export function internshipWelcomeSubject(): string {
  return 'Welcome to the Aorthar Internship — your study material is ready';
}

export function internshipWelcomeHtml(data: InternshipWelcomeData): string {
  const { firstName, studyUrl, examScheduledAt } = data;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to the Aorthar Internship</title>
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
              <h1 class="headline" style="margin:0;font-family:Impact,'Arial Narrow',Arial,sans-serif;font-size:96px;font-weight:900;line-height:0.88;letter-spacing:-3px;text-transform:uppercase;color:#08694a;">
                Get Ready.<br/>Study Hard.<br/><span style="color:#83b900;">Show Up.</span>
              </h1>
            </td>
          </tr>

          <!-- Divider -->
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
              <p style="margin:0 0 32px 0;">Your application for the Aorthar Internship Programme has been received and your payment confirmed. Welcome — this is a genuinely great step.</p>
              <p style="margin:0 0 32px 0;">Before your assessment, you have <strong>24 hours to study</strong> the Aorthar Standard — our operating framework for product teams. Every question in your exam is drawn directly from it. Read it carefully.</p>
            </td>
          </tr>

          <!-- Study CTA -->
          <tr>
            <td style="padding:8px 48px 0 48px;">
              <a href="${studyUrl}" style="display:inline-block;background-color:#08694a;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:6px;letter-spacing:0.2px;">Read the Study Material →</a>
            </td>
          </tr>

          <!-- Exam schedule notice -->
          <tr>
            <td style="padding:40px 48px 0 48px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color:#f7f8f9;border-radius:12px;padding:24px 28px;">
                    <p style="margin:0 0 6px 0;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;">Your exam link arrives at</p>
                    <p style="margin:0;font-size:22px;font-weight:700;color:#08694a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${examScheduledAt}</p>
                    <p style="margin:8px 0 0 0;font-size:14px;color:#6b7280;">Keep an eye on your inbox. The link expires 24 hours after it's sent — no retakes.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Closing -->
          <tr>
            <td style="padding:40px 48px 0 48px;font-size:18px;line-height:1.6;color:#000000;letter-spacing:-0.2px;">
              <p style="margin:0 0 32px 0;">Use this time well. The material is clear and concise — if you read it properly, you&apos;ll know the answers. We&apos;re rooting for you.</p>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:0 48px 0 48px;font-size:18px;line-height:1.5;color:#000000;letter-spacing:-0.2px;">
              <p style="margin:0 0 6px 0;font-weight:700;">The Aorthar Team</p>
              <p style="margin:0;">Aorthar Academy</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:40px 48px 48px 48px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-top:32px;border-top:1px solid #e5e5e5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:#656565;">
                    © 2026 Aorthar Academy · You're receiving this because you applied for the Aorthar Internship Programme.
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
