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
  await supabase.from('business_contacts').insert({
    name,
    email,
    services: service || null,
    message,
  });

  // Notify the team
  await resend.emails.send({
    from: 'Aorthar Agency <noreply@aorthar.com>',
    to: process.env.CONTACT_EMAIL ?? 'adedamolamoses@gmail.com',
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
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:2rem;background:#0a0a0a;color:#fff;">
        <div style="margin-bottom:2rem;">
          <span style="font-weight:900;font-size:1.1rem;letter-spacing:0.08em;">AORTHAR<span style="color:#a7d252;">/</span></span>
        </div>
        <h1 style="font-size:1.5rem;font-weight:800;margin-bottom:1rem;">We got your message, ${name}.</h1>
        <p style="color:#aaa;line-height:1.7;margin-bottom:1rem;">
          Thanks for reaching out to Aorthar Agency. We've received your inquiry and will get back to you within <strong style="color:#fff;">24 hours</strong>.
        </p>
        <p style="color:#aaa;line-height:1.7;margin-bottom:2rem;">
          In the meantime, feel free to browse our <a href="https://business.aorthar.com/packages" style="color:#a7d252;">packages</a> or learn more <a href="https://business.aorthar.com/about" style="color:#a7d252;">about us</a>.
        </p>
        <div style="border-top:1px solid #1f1f1f;padding-top:1.5rem;color:#555;font-size:0.8rem;">
          Aorthar Agency · Marketing. Branding. Product. · <a href="https://business.aorthar.com" style="color:#555;">business.aorthar.com</a>
        </div>
      </div>
    `,
  });

  return { success: true };
}
