export interface WelcomeEmailData {
  firstName: string;
  isCourses: boolean;
}

export function welcomeSubject(isCourses: boolean): string {
  return isCourses
    ? "Welcome to Aorthar Courses — you're all set"
    : "Welcome to Aorthar Academy — let's get started";
}

export function welcomeHtml(data: WelcomeEmailData): string {
  const { firstName, isCourses } = data;

  const headerLine1 = 'Welcome';
  const headerLine2 = isCourses ? 'to Aorthar' : 'to Aorthar';
  const headerLine3 = isCourses ? 'Courses' : 'Academy';

  const bodyParagraph1 = isCourses
    ? `You've just created your Aorthar Courses account. You're moments away from lifetime access to world-class product design, PM, and Scrum courses — built for people who want to actually learn, not just watch.`
    : `You've just created your Aorthar Academy account. We built this platform to give everyone access to a structured, world-class design education — and we're genuinely excited to have you here.`;

  const bodyParagraph2 = isCourses
    ? `Browse the course catalogue, find what speaks to you, and pay once for lifetime access. No subscriptions, no surprises. Just great content, whenever you need it.`
    : `You'll complete onboarding to pick your department, then unlock Year 100–300 courses for free. Everything is structured, paced, and designed to take you from zero to capable — one semester at a time.`;

  const ctaUrl = isCourses ? 'https://courses.aorthar.com' : 'https://university.aorthar.com/dashboard';
  const ctaLabel = isCourses ? 'Browse courses →' : 'Go to my dashboard →';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Aorthar</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:48px 48px 0 48px;">
              <h1 style="
                margin:0;
                font-family:Impact,'Arial Narrow',Arial,sans-serif;
                font-size:96px;
                font-weight:900;
                line-height:0.88;
                letter-spacing:-3px;
                text-transform:uppercase;
                color:#08694a;
              ">
                ${headerLine1}<br/>
                ${headerLine2}<br/>
                <span style="color:#83b900;">${headerLine3}</span>
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
              <p style="margin:0 0 32px 0;">Hi ${firstName}! 👋</p>
              <p style="margin:0 0 32px 0;">${bodyParagraph1}</p>
              <p style="margin:0;">${bodyParagraph2}</p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:40px 48px 0 48px;">
              <a href="${ctaUrl}" style="
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
              ">${ctaLabel}</a>
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
