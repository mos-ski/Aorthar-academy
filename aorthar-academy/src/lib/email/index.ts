import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions) {
  const sender = from ?? 'Aorthar Academy <hello@aorthar.com>';

  const { data, error } = await getResend().emails.send({ from: sender, to, subject, html });

  if (error) {
    console.error('[email] Failed to send email:', error);
    throw new Error(`Email send failed: ${error.message}`);
  }

  return data;
}
