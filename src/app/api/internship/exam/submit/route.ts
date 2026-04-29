import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { internshipResultHtml, internshipResultSubject } from '@/lib/email/templates/internship-result';

// POST /api/internship/exam/submit
// Body: { application_id: string, answers: Record<string, 'a'|'b'|'c'|'d'> }
// Returns: { score_percent, passed, correct_count, total_questions }
export async function POST(request: NextRequest) {
  let body: { application_id?: string; answers?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { application_id, answers } = body;
  if (!application_id || !answers || typeof answers !== 'object') {
    return NextResponse.json({ error: 'application_id and answers are required' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch the attempt (must exist, must not be completed)
  const { data: attempt } = await admin
    .from('internship_exam_attempts')
    .select('id, completed_at')
    .eq('application_id', application_id)
    .maybeSingle();

  if (!attempt) {
    return NextResponse.json({ error: 'No active exam attempt found' }, { status: 404 });
  }

  // Idempotent: already submitted
  if (attempt.completed_at) {
    const { data: existing } = await admin
      .from('internship_exam_attempts')
      .select('score_percent, passed, correct_count, total_questions')
      .eq('id', attempt.id)
      .single();
    return NextResponse.json({ ...existing, already_submitted: true });
  }

  // Fetch all active questions WITH correct_option for grading
  const { data: questions } = await admin
    .from('internship_questions')
    .select('id, correct_option')
    .eq('is_active', true);

  const total = (questions ?? []).length;
  let correct = 0;

  for (const q of questions ?? []) {
    if (answers[q.id] === q.correct_option) correct++;
  }

  const scorePercent = total > 0 ? (correct / total) * 100 : 0;
  const passed = scorePercent >= 70;
  const scoreRounded = Math.round(scorePercent * 100) / 100;

  // Update attempt with results
  await admin
    .from('internship_exam_attempts')
    .update({
      answers,
      score_percent: scoreRounded,
      correct_count: correct,
      total_questions: total,
      passed,
      completed_at: new Date().toISOString(),
    })
    .eq('id', attempt.id)
    .is('completed_at', null);

  // Fetch application for result email
  const { data: application } = await admin
    .from('internship_applications')
    .select('full_name, email, track')
    .eq('id', application_id)
    .maybeSingle();

  if (application?.email) {
    const firstName = application.full_name?.split(' ')[0] ?? 'there';
    const track = application.track ?? 'General';
    const score = Math.round(scorePercent);

    void (async () => {
      try {
        await sendEmail({
          to: application.email!,
          subject: internshipResultSubject(passed),
          html: internshipResultHtml({ firstName, score, passed, correctCount: correct, totalQuestions: total, track }),
        });
      } catch (emailErr) {
        console.error('[internship/exam/submit] Result email failed:', emailErr);
      }
    })();
  }

  return NextResponse.json({
    score_percent: scoreRounded,
    passed,
    correct_count: correct,
    total_questions: total,
  });
}
