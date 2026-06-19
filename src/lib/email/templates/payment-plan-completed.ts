export interface PaymentPlanCompletedData {
  firstName: string;
  courseName: string;
  balanceNgn: number;
  dashboardUrl: string;
}

export function paymentPlanCompletedSubject(courseName: string): string {
  return `You're all paid up for "${courseName}"`;
}

export function paymentPlanCompletedHtml(data: PaymentPlanCompletedData): string {
  const { firstName, courseName, balanceNgn, dashboardUrl } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${paymentPlanCompletedSubject(courseName)}</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="padding:48px 48px 0 48px;">
              <h1 style="margin:0;font-family:Impact,'Arial Narrow',Arial,sans-serif;font-size:64px;font-weight:900;line-height:0.95;letter-spacing:-2px;text-transform:uppercase;color:#08694a;">
                All <span style="color:#83b900;">Paid</span><br/>Up
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 48px 0 48px;font-size:18px;line-height:1.6;color:#000000;letter-spacing:-0.2px;">
              <p style="margin:0 0 24px 0;">Hi ${firstName},</p>
              <p style="margin:0 0 24px 0;">Your final payment of <strong>₦${balanceNgn.toLocaleString('en-NG')}</strong> for <strong>${courseName}</strong> was received. Your course is fully paid for — no balance, no deadline, just access for good.</p>
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
