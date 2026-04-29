export interface InternshipResultData {
  firstName: string;
  score: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  track: string;
}

export function internshipResultSubject(passed: boolean): string {
  return passed
    ? 'You passed the Aorthar Internship Assessment 🎉'
    : 'Your Aorthar Internship Assessment result';
}

export function internshipResultHtml(data: InternshipResultData): string {
  const { firstName, score, passed, correctCount, totalQuestions, track } = data;

  const headline3 = passed ? 'The Assessment' : 'Applying';
  const headlineColor = passed ? '#83b900' : '#08694a';

  const bodyParagraph = passed
    ? `Congratulations! You scored <strong>${score}%</strong> on the Aorthar Internship Assessment — that's ${correctCount} out of ${totalQuestions} questions correct. You've cleared the 70% pass mark for the <strong>${track}</strong> track. Our team will now review all results and reach out within 5 business days with next steps.`
    : `You scored <strong>${score}%</strong> on the Aorthar Internship Assessment — that's ${correctCount} out of ${totalQuestions} questions correct. The pass mark for this cohort was 70%, and unfortunately your score didn't make the cut this time. We appreciate the effort you put in and encourage you to apply again in our next cohort.`;

  const closingParagraph = passed
    ? 'In the meantime, join our community to connect with other applicants and Aorthar alumni.'
    : 'Thank you for taking the time to apply. We keep your details on file and would love to see you back next cohort.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Internship Assessment Result — Aorthar</title>
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
                ${passed ? 'You' : 'Thank You'}<br/>${passed ? 'Passed' : 'For'}<br/><span style="color:${headlineColor};">${headline3}</span>
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

          <!-- Score block -->
          <tr>
            <td style="padding:48px 48px 0 48px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background-color:${passed ? '#f0f9f4' : '#fff8f0'};border-radius:12px;padding:24px 28px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px 0;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${passed ? '#08694a' : '#b45309'};">${passed ? 'PASSED' : 'NOT PASSED'}</p>
                    <p style="margin:0;font-size:48px;font-weight:900;font-family:Impact,'Arial Narrow',Arial,sans-serif;color:${passed ? '#08694a' : '#b45309'};letter-spacing:-1px;">${score}%</p>
                    <p style="margin:8px 0 0 0;font-size:15px;color:#555;">${correctCount} of ${totalQuestions} questions correct · Pass mark: 70%</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px 0 48px;font-size:18px;line-height:1.6;color:#000000;letter-spacing:-0.2px;">
              <p style="margin:0 0 32px 0;">Hi ${firstName}!</p>
              <p style="margin:0 0 32px 0;">${bodyParagraph}</p>
              <p style="margin:0;">${closingParagraph}</p>
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
                    © 2026 Aorthar Academy
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
