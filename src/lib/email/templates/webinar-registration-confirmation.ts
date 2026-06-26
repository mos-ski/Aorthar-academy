export interface WebinarRegistrationData {
  firstName: string;
  webinarTitle: string;
  scheduledAt: string;
  joinUrl: string;
  amountNgn: number;
  calendarAttached?: boolean;
}

function formatScheduledAt(scheduledAt: string): string {
  return new Date(scheduledAt).toLocaleString('en-NG', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  });
}

export function webinarRegistrationHtml(data: WebinarRegistrationData): string {
  const { firstName, webinarTitle, scheduledAt, joinUrl, amountNgn, calendarAttached } = data;
  const when = formatScheduledAt(scheduledAt);

  const paymentLine = amountNgn > 0
    ? `Your payment of <strong>₦${amountNgn.toLocaleString('en-NG')}</strong> was received and your spot is confirmed.`
    : `Your spot is confirmed — no payment required.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're registered — Aorthar Academy</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="padding:48px 48px 0 48px;">
              <h1 style="
                margin:0;
                font-family:Impact,'Arial Narrow',Arial,sans-serif;
                font-size:64px;
                font-weight:900;
                line-height:0.95;
                letter-spacing:-2px;
                text-transform:uppercase;
                color:#08694a;
              ">You're<br/><span style="color:#83b900;">Registered</span></h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 48px 0 48px;font-size:18px;line-height:1.6;color:#000000;">
              <p style="margin:0 0 24px 0;">Hi ${firstName}! 🎉</p>
              <p style="margin:0 0 24px 0;">${paymentLine}</p>
              <p style="margin:0 0 8px 0;"><strong>${webinarTitle}</strong></p>
              <p style="margin:0 0 24px 0;color:#444;">${when} (WAT)</p>
              <p style="margin:0;">We'll send you a reminder before it starts. When it's time, just click the button below to join.</p>
              ${calendarAttached ? '<p style="margin:18px 0 0 0;color:#444;">A calendar invite is attached so you can save the session easily.</p>' : ''}
            </td>
          </tr>
          <tr>
            <td style="padding:32px 48px 0 48px;">
              <a href="${joinUrl}" style="
                display:inline-block;
                background-color:#08694a;
                color:#ffffff;
                font-size:16px;
                font-weight:700;
                text-decoration:none;
                padding:14px 32px;
                border-radius:6px;
              ">Join the class →</a>
            </td>
          </tr>
          <tr>
            <td style="padding:48px 48px 48px 48px;font-size:14px;color:#656565;border-top:1px solid #e5e5e5;margin-top:40px;">
              Aorthar Academy
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function webinarRegistrationSubject(webinarTitle: string): string {
  return `You're registered for "${webinarTitle}"`;
}
