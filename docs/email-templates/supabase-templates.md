# Aorthar — Supabase Email Templates

Paste each section into **Supabase → Authentication → Email Templates**.
All templates use the brand style: Impact headline, green divider, white background.

Supabase variables used:
- `{{ .ConfirmationURL }}` — the action link (confirm, reset, invite, magic link)
- `{{ .Email }}` — the recipient's email address
- `{{ .NewEmail }}` — used only in the Change Email template
- `{{ .Token }}` — 6-digit OTP code (used in OTP-style templates)
- `{{ .SiteURL }}` — your project's site URL

---

## 1. Invite User

**Where:** Authentication → Email Templates → Invite User
**Sent when:** Admin invites a student via the Ops Hub (offline payment flow)

**Subject:**
```
You've been invited to Aorthar Academy
```

**Body:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">

        <tr><td style="padding:48px 48px 0 48px;">
          <h1 style="margin:0;font-family:Impact,'Arial Narrow',Arial,sans-serif;font-size:96px;font-weight:900;line-height:0.88;letter-spacing:-3px;text-transform:uppercase;color:#08694a;">
            YOU'VE<br/>BEEN<br/><span style="color:#83b900;">INVITED</span>
          </h1>
        </td></tr>

        <tr><td style="padding:40px 48px 0 48px;">
          <div style="height:14px;background:linear-gradient(90deg,#08694a 0%,#08694a 18%,#83b900 18%,#83b900 30%,#08694a 30%,#08694a 44%,#83b900 44%,#83b900 52%,#08694a 52%,#08694a 62%,#83b900 62%,#83b900 70%,#08694a 70%,#08694a 80%,#83b900 80%,#83b900 88%,#08694a 88%,#08694a 100%);border-radius:2px;">&nbsp;</div>
        </td></tr>

        <tr><td style="padding:48px 48px 0 48px;font-size:18px;line-height:1.6;color:#000000;letter-spacing:-0.2px;">
          <p style="margin:0 0 32px 0;">Hi there 👋</p>
          <p style="margin:0 0 32px 0;">You've been invited to join Aorthar Academy. Your course access has already been set up and will be waiting for you the moment you sign in.</p>
          <p style="margin:0;">Click the button below to set your password and get started.</p>
        </td></tr>

        <tr><td style="padding:40px 48px 0 48px;">
          <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#08694a;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:6px;">Accept the invite →</a>
        </td></tr>

        <tr><td style="padding:48px 48px 0 48px;font-size:18px;line-height:1.5;color:#000000;">
          <p style="margin:0 0 6px 0;font-weight:700;">Student Success</p>
          <p style="margin:0;">Aorthar Academy</p>
        </td></tr>

        <tr><td style="padding:40px 48px 48px 48px;">
          <div style="padding-top:32px;border-top:1px solid #e5e5e5;font-size:14px;color:#656565;">
            <a href="https://aorthar.com" style="color:#656565;text-decoration:underline;">aorthar.com</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

## 2. Confirm Signup

**Where:** Authentication → Email Templates → Confirm signup
**Sent when:** A new user signs up and email confirmation is enabled

**Subject:**
```
Confirm your Aorthar Academy email
```

**Body:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">

        <tr><td style="padding:48px 48px 0 48px;">
          <h1 style="margin:0;font-family:Impact,'Arial Narrow',Arial,sans-serif;font-size:96px;font-weight:900;line-height:0.88;letter-spacing:-3px;text-transform:uppercase;color:#08694a;">
            ALMOST<br/>THERE<br/><span style="color:#83b900;">CONFIRM</span>
          </h1>
        </td></tr>

        <tr><td style="padding:40px 48px 0 48px;">
          <div style="height:14px;background:linear-gradient(90deg,#08694a 0%,#08694a 18%,#83b900 18%,#83b900 30%,#08694a 30%,#08694a 44%,#83b900 44%,#83b900 52%,#08694a 52%,#08694a 62%,#83b900 62%,#83b900 70%,#08694a 70%,#08694a 80%,#83b900 80%,#83b900 88%,#08694a 88%,#08694a 100%);border-radius:2px;">&nbsp;</div>
        </td></tr>

        <tr><td style="padding:48px 48px 0 48px;font-size:18px;line-height:1.6;color:#000000;letter-spacing:-0.2px;">
          <p style="margin:0 0 32px 0;">Hi there 👋</p>
          <p style="margin:0 0 32px 0;">Thanks for signing up. Click the button below to confirm your email address and activate your Aorthar Academy account.</p>
          <p style="margin:0;">If you didn't create an account, you can safely ignore this email.</p>
        </td></tr>

        <tr><td style="padding:40px 48px 0 48px;">
          <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#08694a;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:6px;">Confirm my email →</a>
        </td></tr>

        <tr><td style="padding:24px 48px 0 48px;font-size:13px;line-height:1.5;color:#656565;">
          <p style="margin:0;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="margin:8px 0 0 0;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#08694a;">{{ .ConfirmationURL }}</a></p>
        </td></tr>

        <tr><td style="padding:48px 48px 0 48px;font-size:18px;line-height:1.5;color:#000000;">
          <p style="margin:0 0 6px 0;font-weight:700;">Student Success</p>
          <p style="margin:0;">Aorthar Academy</p>
        </td></tr>

        <tr><td style="padding:40px 48px 48px 48px;">
          <div style="padding-top:32px;border-top:1px solid #e5e5e5;font-size:14px;color:#656565;">
            <a href="https://aorthar.com" style="color:#656565;text-decoration:underline;">aorthar.com</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

## 3. Reset Password

**Where:** Authentication → Email Templates → Reset Password
**Sent when:** User clicks "Forgot password" on the login page

**Subject:**
```
Reset your Aorthar Academy password
```

**Body:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">

        <tr><td style="padding:48px 48px 0 48px;">
          <h1 style="margin:0;font-family:Impact,'Arial Narrow',Arial,sans-serif;font-size:96px;font-weight:900;line-height:0.88;letter-spacing:-3px;text-transform:uppercase;color:#08694a;">
            RESET<br/>YOUR<br/><span style="color:#83b900;">PASSWORD</span>
          </h1>
        </td></tr>

        <tr><td style="padding:40px 48px 0 48px;">
          <div style="height:14px;background:linear-gradient(90deg,#08694a 0%,#08694a 18%,#83b900 18%,#83b900 30%,#08694a 30%,#08694a 44%,#83b900 44%,#83b900 52%,#08694a 52%,#08694a 62%,#83b900 62%,#83b900 70%,#08694a 70%,#08694a 80%,#83b900 80%,#83b900 88%,#08694a 88%,#08694a 100%);border-radius:2px;">&nbsp;</div>
        </td></tr>

        <tr><td style="padding:48px 48px 0 48px;font-size:18px;line-height:1.6;color:#000000;letter-spacing:-0.2px;">
          <p style="margin:0 0 32px 0;">Hi there,</p>
          <p style="margin:0 0 32px 0;">We received a request to reset the password for your Aorthar Academy account. Click the button below to choose a new one — this link expires in 1 hour.</p>
          <p style="margin:0;">If you didn't request a password reset, you can safely ignore this email. Your account is secure and nothing has changed.</p>
        </td></tr>

        <tr><td style="padding:40px 48px 0 48px;">
          <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#08694a;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:6px;">Reset my password →</a>
        </td></tr>

        <tr><td style="padding:24px 48px 0 48px;font-size:13px;line-height:1.5;color:#656565;">
          <p style="margin:0;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="margin:8px 0 0 0;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#08694a;">{{ .ConfirmationURL }}</a></p>
        </td></tr>

        <tr><td style="padding:48px 48px 0 48px;font-size:18px;line-height:1.5;color:#000000;">
          <p style="margin:0 0 6px 0;font-weight:700;">Student Success</p>
          <p style="margin:0;">Aorthar Academy</p>
        </td></tr>

        <tr><td style="padding:40px 48px 48px 48px;">
          <div style="padding-top:32px;border-top:1px solid #e5e5e5;font-size:14px;color:#656565;">
            <a href="https://aorthar.com" style="color:#656565;text-decoration:underline;">aorthar.com</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

## 4. Magic Link

**Where:** Authentication → Email Templates → Magic Link
**Sent when:** User requests a magic link login (passwordless)

**Subject:**
```
Your Aorthar Academy sign-in link
```

**Body:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">

        <tr><td style="padding:48px 48px 0 48px;">
          <h1 style="margin:0;font-family:Impact,'Arial Narrow',Arial,sans-serif;font-size:96px;font-weight:900;line-height:0.88;letter-spacing:-3px;text-transform:uppercase;color:#08694a;">
            YOUR<br/>SIGN-IN<br/><span style="color:#83b900;">LINK</span>
          </h1>
        </td></tr>

        <tr><td style="padding:40px 48px 0 48px;">
          <div style="height:14px;background:linear-gradient(90deg,#08694a 0%,#08694a 18%,#83b900 18%,#83b900 30%,#08694a 30%,#08694a 44%,#83b900 44%,#83b900 52%,#08694a 52%,#08694a 62%,#83b900 62%,#83b900 70%,#08694a 70%,#08694a 80%,#83b900 80%,#83b900 88%,#08694a 88%,#08694a 100%);border-radius:2px;">&nbsp;</div>
        </td></tr>

        <tr><td style="padding:48px 48px 0 48px;font-size:18px;line-height:1.6;color:#000000;letter-spacing:-0.2px;">
          <p style="margin:0 0 32px 0;">Hi there 👋</p>
          <p style="margin:0 0 32px 0;">Here's your one-click sign-in link for Aorthar Academy. It expires in 10 minutes and can only be used once.</p>
          <p style="margin:0;">If you didn't request this, you can safely ignore it — your account is untouched.</p>
        </td></tr>

        <tr><td style="padding:40px 48px 0 48px;">
          <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#08694a;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:6px;">Sign in to Aorthar →</a>
        </td></tr>

        <tr><td style="padding:24px 48px 0 48px;font-size:13px;line-height:1.5;color:#656565;">
          <p style="margin:0;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="margin:8px 0 0 0;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#08694a;">{{ .ConfirmationURL }}</a></p>
        </td></tr>

        <tr><td style="padding:48px 48px 0 48px;font-size:18px;line-height:1.5;color:#000000;">
          <p style="margin:0 0 6px 0;font-weight:700;">Student Success</p>
          <p style="margin:0;">Aorthar Academy</p>
        </td></tr>

        <tr><td style="padding:40px 48px 48px 48px;">
          <div style="padding-top:32px;border-top:1px solid #e5e5e5;font-size:14px;color:#656565;">
            <a href="https://aorthar.com" style="color:#656565;text-decoration:underline;">aorthar.com</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

## 5. Change Email Address

**Where:** Authentication → Email Templates → Change Email Address
**Sent when:** A user updates their email in account settings — sent to the NEW email to confirm it

**Subject:**
```
Confirm your new email address — Aorthar Academy
```

**Body:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">

        <tr><td style="padding:48px 48px 0 48px;">
          <h1 style="margin:0;font-family:Impact,'Arial Narrow',Arial,sans-serif;font-size:96px;font-weight:900;line-height:0.88;letter-spacing:-3px;text-transform:uppercase;color:#08694a;">
            CONFIRM<br/>NEW<br/><span style="color:#83b900;">EMAIL</span>
          </h1>
        </td></tr>

        <tr><td style="padding:40px 48px 0 48px;">
          <div style="height:14px;background:linear-gradient(90deg,#08694a 0%,#08694a 18%,#83b900 18%,#83b900 30%,#08694a 30%,#08694a 44%,#83b900 44%,#83b900 52%,#08694a 52%,#08694a 62%,#83b900 62%,#83b900 70%,#08694a 70%,#08694a 80%,#83b900 80%,#83b900 88%,#08694a 88%,#08694a 100%);border-radius:2px;">&nbsp;</div>
        </td></tr>

        <tr><td style="padding:48px 48px 0 48px;font-size:18px;line-height:1.6;color:#000000;letter-spacing:-0.2px;">
          <p style="margin:0 0 32px 0;">Hi there,</p>
          <p style="margin:0 0 32px 0;">We received a request to change your Aorthar Academy email address to <strong>{{ .NewEmail }}</strong>. Click the button below to confirm this change.</p>
          <p style="margin:0;">If you didn't make this request, please ignore this email — your current email address remains unchanged.</p>
        </td></tr>

        <tr><td style="padding:40px 48px 0 48px;">
          <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#08694a;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:6px;">Confirm new email →</a>
        </td></tr>

        <tr><td style="padding:24px 48px 0 48px;font-size:13px;line-height:1.5;color:#656565;">
          <p style="margin:0;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="margin:8px 0 0 0;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#08694a;">{{ .ConfirmationURL }}</a></p>
        </td></tr>

        <tr><td style="padding:48px 48px 0 48px;font-size:18px;line-height:1.5;color:#000000;">
          <p style="margin:0 0 6px 0;font-weight:700;">Student Success</p>
          <p style="margin:0;">Aorthar Academy</p>
        </td></tr>

        <tr><td style="padding:40px 48px 48px 48px;">
          <div style="padding-top:32px;border-top:1px solid #e5e5e5;font-size:14px;color:#656565;">
            <a href="https://aorthar.com" style="color:#656565;text-decoration:underline;">aorthar.com</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

## Notes

- The **Resend-powered emails** (welcome, purchase confirmation, forgot password) already use this same brand style and are sent directly from app code — no Supabase template needed for those.
- Supabase only controls the 5 templates above (Invite, Confirm Signup, Reset Password, Magic Link, Change Email).
- After pasting each template, click **Save** — changes take effect immediately with no redeploy needed.
