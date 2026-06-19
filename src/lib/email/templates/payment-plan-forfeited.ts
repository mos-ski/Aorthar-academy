export interface PaymentPlanForfeitedData {
  firstName: string;
  courseName: string;
  forfeitedNgn: number;
  courseUrl: string;
}

export function paymentPlanForfeitedSubject(courseName: string): string {
  return `Access to "${courseName}" has ended`;
}

export function paymentPlanForfeitedHtml(data: PaymentPlanForfeitedData): string {
  const { firstName, courseName, forfeitedNgn, courseUrl } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${paymentPlanForfeitedSubject(courseName)}</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="padding:48px 48px 0 48px;">
              <h1 style="margin:0;font-family:Impact,'Arial Narrow',Arial,sans-serif;font-size:64px;font-weight:900;line-height:0.95;letter-spacing:-2px;text-transform:uppercase;color:#08694a;">
                Access<br/><span style="color:#cc4b37;">Has Ended</span>
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 48px 0 48px;font-size:18px;line-height:1.6;color:#000000;letter-spacing:-0.2px;">
              <p style="margin:0 0 24px 0;">Hi ${firstName},</p>
              <p style="margin:0 0 24px 0;">The payment plan deadline for <strong>${courseName}</strong> has passed without the remaining balance being paid. As agreed when you set up the plan, your access has been removed and the <strong>₦${forfeitedNgn.toLocaleString('en-NG')}</strong> you already paid has been forfeited.</p>
              <p style="margin:0 0 24px 0;">You're welcome to purchase the course again at any time, either in full or with a new payment plan.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 48px 48px 48px;">
              <a href="${courseUrl}" style="display:inline-block;background-color:#08694a;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:6px;letter-spacing:0.2px;">View the course →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
