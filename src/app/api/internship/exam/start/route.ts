import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// POST /api/internship/exam/start
// Body: { token: string, email: string }
// Returns: { application_id, questions } — questions have NO correct_option
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

  // Validate token (must be unused and not expired)
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
    return NextResponse.json({ error: 'This exam link has expired.' }, { status: 410 });
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

  // Check for existing attempt (no retakes)
  const { data: existingAttempt } = await admin
    .from('internship_exam_attempts')
    .select('id')
    .eq('application_id', application.id)
    .maybeSingle();

  if (existingAttempt) {
    return NextResponse.json({ error: 'You have already taken this exam.' }, { status: 409 });
  }

  // Mark token as used
  await admin
    .from('internship_exam_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', tokenRow.id);

  // Fetch all active questions (without correct_option)
  const { data: questions } = await admin
    .from('internship_questions')
    .select('id, question_text, option_a, option_b, option_c, option_d')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const shuffled = shuffle(questions ?? []);

  // Create empty attempt row to lock the slot
  const { error: attemptError } = await admin
    .from('internship_exam_attempts')
    .insert({
      application_id: application.id,
      token_id: tokenRow.id,
      answers: {},
    });

  if (attemptError) {
    console.error('[internship/exam/start] Attempt insert error:', attemptError);
    return NextResponse.json({ error: 'Failed to start exam. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ application_id: application.id, questions: shuffled });
}
