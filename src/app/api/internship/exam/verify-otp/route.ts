import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/internship/exam/verify-otp
// Body: { token: string, email: string, otp: string }
export async function POST(request: NextRequest) {
  let body: { token?: string; email?: string; otp?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { token, email, otp } = body;
  if (!token || !email || !otp) {
    return NextResponse.json({ error: 'Token, email, and OTP are required' }, { status: 400 });
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

  // Verify email
  const { data: application } = await admin
    .from('internship_applications')
    .select('id, email')
    .eq('id', tokenRow.application_id)
    .maybeSingle();

  if (!application || application.email?.toLowerCase().trim() !== email.toLowerCase().trim()) {
    return NextResponse.json({ error: 'Email does not match' }, { status: 403 });
  }

  // Fetch latest live OTP
  const { data: otpRow } = await admin
    .from('internship_otp_codes')
    .select('id, otp_code, expires_at, used_at')
    .eq('application_id', application.id)
    .is('used_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!otpRow || new Date(otpRow.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Your code has expired. Please request a new one.' }, { status: 400 });
  }

  if (otpRow.otp_code !== otp.trim()) {
    return NextResponse.json({ error: 'Incorrect code. Please try again.' }, { status: 400 });
  }

  // Mark OTP as used
  await admin
    .from('internship_otp_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('id', otpRow.id);

  return NextResponse.json({ ok: true });
}
