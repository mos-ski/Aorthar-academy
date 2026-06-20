'use server';

import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export type ContactResult = { success: true } | { success: false; error: string };

export async function sendContactEmail(formData: FormData): Promise<ContactResult> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const service = String(formData.get('service') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();

  if (!name || !email || !message) {
    return { success: false, error: 'Please fill in all required fields.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  // Save to DB
  const supabase = await createClient();
  await supabase.from('studio_contacts').insert({
    name,
    email,
    services: service || null,
    message,
  });

  // Fetch team email from settings (falls back to env var, then hardcoded default)
  const { data: settingRow } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'contact_email')
    .single();
  const teamEmail = settingRow?.value || process.env.CONTACT_EMAIL || 'aorthardesignteam@gmail.com';

  // Notify the team
  await resend.emails.send({
    from: 'Aorthar Agency <noreply@aorthar.com>',
    to: teamEmail,
    replyTo: email,
    subject: `New agency inquiry from ${name}${service ? ` — ${service}` : ''}`,
    text: `Name: ${name}\nEmail: ${email}\nService: ${service || 'Not specified'}\n\n${message}`,
  });

  // Auto-reply to the sender
  await resend.emails.send({
    from: 'Aorthar Agency <noreply@aorthar.com>',
    to: email,
    subject: 'We received your message — Aorthar Agency',
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0a0a0a" style="background-color:#0a0a0a;">
  <tr>
    <td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" bgcolor="#0a0a0a" style="background-color:#0a0a0a;max-width:560px;width:100%;">

        <!-- Logo -->
        <tr>
          <td style="padding-bottom:36px;">
            <span style="font-weight:900;font-size:18px;letter-spacing:4px;color:#ffffff;font-family:-apple-system,system-ui,sans-serif;">AORTHAR<span style="color:#a7d252;">/</span></span>
          </td>
        </tr>

        <!-- Heading -->
        <tr>
          <td style="padding-bottom:20px;">
            <h1 style="font-size:26px;font-weight:800;color:#ffffff;margin:0;line-height:1.3;font-family:-apple-system,system-ui,sans-serif;">We got your message, ${name}.</h1>
          </td>
        </tr>

        <!-- Body text -->
        <tr>
          <td style="padding-bottom:24px;">
            <p style="color:#aaaaaa;line-height:1.75;margin:0;font-family:-apple-system,system-ui,sans-serif;font-size:15px;">
              Thanks for reaching out to Aorthar Agency. We&apos;ve received your inquiry and will get back to you within <strong style="color:#ffffff;">24 hours</strong>.
            </p>
          </td>
        </tr>

        ${service ? `
        <!-- Services summary -->
        <tr>
          <td style="padding-bottom:24px;">
            <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#141414" style="background-color:#141414;border-radius:8px;border:1px solid #222222;">
              <tr>
                <td style="padding:18px 20px;">
                  <p style="color:#666666;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;font-family:-apple-system,system-ui,sans-serif;">Your inquiry</p>
                  <p style="color:#ffffff;margin:0;font-family:-apple-system,system-ui,sans-serif;font-size:14px;line-height:1.6;">${service}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}

        <!-- CTA line -->
        <tr>
          <td style="padding-bottom:36px;">
            <p style="color:#aaaaaa;line-height:1.75;margin:0;font-family:-apple-system,system-ui,sans-serif;font-size:15px;">
              In the meantime, feel free to browse our <a href="https://studio.aorthar.com/packages" style="color:#a7d252;text-decoration:none;">packages</a> or learn more <a href="https://studio.aorthar.com/about" style="color:#a7d252;text-decoration:none;">about us</a>.
            </p>
          </td>
        </tr>

        <!-- Divider + footer -->
        <tr>
          <td style="border-top:1px solid #1f1f1f;padding-top:24px;">
            <p style="color:#444444;font-size:12px;margin:0;font-family:-apple-system,system-ui,sans-serif;">
              Aorthar Agency &middot; Marketing. Branding. Product. &middot;
              <a href="https://studio.aorthar.com" style="color:#444444;text-decoration:none;">studio.aorthar.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
    `,
  });

  return { success: true };
}
