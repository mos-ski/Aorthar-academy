import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';

// POST /api/internship/exam/send-otp
// Body: { token: string, email: string }
// Generates and emails a 6-digit OTP
export async function POST(request: NextRequest) {
  let body: { token?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { token, email } = body;
  if (!token || !email) {
    return NextResponse.json({ error: 'Token and email are required' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Validate token
  const { data: tokenRow } = await admin
    .from('internship_exam_tokens')
    .select('id, application_id, expires_at, used_at')
    .eq('id', token)
    .maybeSingle();

  if (!tokenRow || tokenRow.used_at || new Date(tokenRow.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired exam link' }, { status: 410 });
  }

  // Verify email matches
  const { data: application } = await admin
    .from('internship_applications')
    .select('id, email')
    .eq('id', tokenRow.application_id)
    .maybeSingle();

  if (!application || application.email?.toLowerCase().trim() !== email.toLowerCase().trim()) {
    return NextResponse.json({ error: 'Email does not match' }, { status: 403 });
  }

  // Rate limit: one OTP per 60 seconds
  const { data: recentOtp } = await admin
    .from('internship_otp_codes')
    .select('created_at')
    .eq('application_id', application.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentOtp) {
    const secondsSince = (Date.now() - new Date(recentOtp.created_at).getTime()) / 1000;
    if (secondsSince < 60) {
      return NextResponse.json(
        { error: 'Please wait before requesting a new code.', retry_after: Math.ceil(60 - secondsSince) },
        { status: 429 },
      );
    }
  }

  // Invalidate any previous live OTPs
  await admin
    .from('internship_otp_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('application_id', application.id)
    .is('used_at', null);

  // Generate 6-digit code
  const otp = String(Math.floor(100000 + Math.random() * 900000));

  await admin
    .from('internship_otp_codes')
    .insert({ application_id: application.id, otp_code: otp });

  // Send OTP email
  void (async () => {
    try {
      await sendEmail({
        to: email.toLowerCase().trim(),
        subject: `Your Aorthar assessment code: ${otp}`,
        html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
          <tr><td style="padding:48px 48px 0 48px;">
            <h1 style="margin:0;font-family:Impact,'Arial Narrow',Arial,sans-serif;font-size:64px;font-weight:900;line-height:0.9;letter-spacing:-2px;text-transform:uppercase;color:#08694a;">
              Your Code
            </h1>
          </td></tr>
          <tr><td style="padding:40px 48px 0 48px;">
            <div style="background-color:#f0f9f4;border-radius:12px;padding:32px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:#08694a;">ONE-TIME CODE</p>
              <p style="margin:0;font-size:56px;font-weight:900;font-family:Impact,'Arial Narrow',Arial,sans-serif;letter-spacing:8px;color:#08694a;">${otp}</p>
              <p style="margin:12px 0 0 0;font-size:14px;color:#666;">This code expires in 10 minutes</p>
            </div>
          </td></tr>
          <tr><td style="padding:32px 48px 48px 48px;font-size:15px;line-height:1.6;color:#555;">
            <p style="margin:0;">Enter this code in the exam portal to begin your assessment. If you didn't request this code, please ignore this email.</p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      });
    } catch (emailErr) {
      console.error('[internship/exam/send-otp] OTP email failed:', emailErr);
    }
  })();

  return NextResponse.json({ ok: true });
}
