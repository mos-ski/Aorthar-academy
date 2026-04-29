export interface InternshipOnboardingData {
  firstName: string;
  examUrl: string;
  expiresAt: string; // human-readable, e.g. "Wednesday, 30 April 2026 at 10:00 AM"
}

export function internshipOnboardingSubject(): string {
  return 'Your Aorthar Internship application is confirmed — take your assessment';
}

export function internshipOnboardingHtml(data: InternshipOnboardingData): string {
  const { firstName, examUrl, expiresAt } = data;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Start Your Assessment — Aorthar Internship</title>
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
                Time to<br/>Show Us<br/><span style="color:#83b900;">What You Got</span>
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
              <p style="margin:0 0 32px 0;">Hi ${firstName}! 🎉</p>
              <p style="margin:0 0 32px 0;">Your application for the Aorthar Internship Programme has been received and your <strong>₦10,000 application fee confirmed</strong>. You're now one step away from joining Africa's most competitive product internship.</p>
              <p style="margin:0 0 32px 0;">Click the button below to start your assessment. <strong>This link expires on ${expiresAt}</strong> — please complete it before then. You'll verify your email with a one-time code before the exam begins.</p>
              <p style="margin:0;">The assessment is multiple choice. Take your time. Read each question carefully. <strong>There are no retakes.</strong></p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:40px 48px 0 48px;">
              <a href="${examUrl}" style="display:inline-block;background-color:#08694a;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:6px;letter-spacing:0.2px;">Start Your Assessment →</a>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:48px 48px 0 48px;font-size:18px;line-height:1.5;color:#000000;letter-spacing:-0.2px;">
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
                    If you did not apply for the Aorthar Internship, please ignore this email. The link above is tied to your application only.
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
