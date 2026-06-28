export function webinarBroadcastHtml(bodyHtml: string, webinarTitle: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${webinarTitle} — Aorthar Academy</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="padding:48px 48px 0 48px;">
              <p style="margin:0 0 14px 0;color:#83b900;font-size:13px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;">Aorthar Live Update</p>
              <h1 style="
                margin:0;
                font-family:Impact,'Arial Narrow',Arial,sans-serif;
                font-size:54px;
                font-weight:900;
                line-height:0.95;
                letter-spacing:-2px;
                text-transform:uppercase;
                color:#08694a;
              ">${webinarTitle}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 48px 0 48px;font-size:17px;line-height:1.7;color:#000000;">
              <div style="font-size:17px;line-height:1.7;color:#000000;">
                ${bodyHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:48px 48px 48px 48px;font-size:14px;color:#656565;border-top:1px solid #e5e5e5;margin-top:40px;">
              Aorthar Academy — ${webinarTitle}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
