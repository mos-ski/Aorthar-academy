export interface PaymentPlanStartedData {
  firstName: string;
  courseName: string;
  firstPaymentNgn: number;
  balanceNgn: number;
  deadline: string; // ISO timestamp
  dashboardUrl: string;
}

export function paymentPlanStartedSubject(courseName: string): string {
  return `Your payment plan for "${courseName}" is active`;
}

export function paymentPlanStartedHtml(data: PaymentPlanStartedData): string {
  const { firstName, courseName, firstPaymentNgn, balanceNgn, deadline, dashboardUrl } = data;
  const deadlineDate = new Date(deadline).toLocaleDateString('en-NG', {
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
  <title>${paymentPlanStartedSubject(courseName)}</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="padding:48px 48px 0 48px;">
              <h1 style="margin:0;font-family:Impact,'Arial Narrow',Arial,sans-serif;font-size:64px;font-weight:900;line-height:0.95;letter-spacing:-2px;text-transform:uppercase;color:#08694a;">
                You're In —<br/><span style="color:#83b900;">Plan</span> Started
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 48px 0 48px;font-size:18px;line-height:1.6;color:#000000;letter-spacing:-0.2px;">
              <p style="margin:0 0 24px 0;">Hi ${firstName},</p>
              <p style="margin:0 0 24px 0;">Your first payment of <strong>₦${firstPaymentNgn.toLocaleString('en-NG')}</strong> for <strong>${courseName}</strong> was received, and you now have full access to the course.</p>
              <p style="margin:0 0 24px 0;">You still owe a balance of <strong>₦${balanceNgn.toLocaleString('en-NG')}</strong>, due by <strong>${deadlineDate}</strong>. If the balance isn't paid by then, your access will be removed and the amount you've already paid is forfeited.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 48px 48px 48px;">
              <a href="${dashboardUrl}" style="display:inline-block;background-color:#08694a;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:6px;letter-spacing:0.2px;">Go to my course →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
