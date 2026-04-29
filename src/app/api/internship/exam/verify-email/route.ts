import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/internship/exam/verify-email
// Body: { token: string, email: string }
// Confirms the email matches the application linked to the token
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

  // Fetch the token
  const { data: tokenRow } = await admin
    .from('internship_exam_tokens')
    .select('id, application_id, expires_at, used_at')
    .eq('id', token)
    .maybeSingle();

  if (!tokenRow) {
    return NextResponse.json({ error: 'Invalid exam link' }, { status: 410 });
  }

  if (tokenRow.used_at) {
    return NextResponse.json({ error: 'This exam link has already been used.' }, { status: 410 });
  }

  if (new Date(tokenRow.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This exam link has expired. Please contact us.' }, { status: 410 });
  }

  // Fetch the linked application
  const { data: application } = await admin
    .from('internship_applications')
    .select('id, email')
    .eq('id', tokenRow.application_id)
    .maybeSingle();

  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  // Compare emails case-insensitively
  if (application.email?.toLowerCase().trim() !== email.toLowerCase().trim()) {
    return NextResponse.json({ error: 'Email does not match our records for this application.' }, { status: 403 });
  }

  // Check for existing attempt (no retakes)
  const { data: existingAttempt } = await admin
    .from('internship_exam_attempts')
    .select('id, completed_at')
    .eq('application_id', application.id)
    .maybeSingle();

  if (existingAttempt) {
    return NextResponse.json(
      { error: 'You have already completed this assessment.', already_attempted: true },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true, application_id: application.id });
}
