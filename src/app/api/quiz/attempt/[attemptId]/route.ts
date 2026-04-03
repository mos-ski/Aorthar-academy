import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDemoAttempt } from '@/lib/demo/quizAttempts';

interface Params {
  params: Promise<{ attemptId: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { attemptId } = await params;

  if (attemptId.startsWith('demo-')) {
    const attempt = getDemoAttempt(attemptId);
    if (!attempt || attempt.user_id !== user.id) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: attempt.id,
        course_id: attempt.course_id,
        assessment_type: attempt.assessment_type,
        started_at: attempt.started_at,
        completed_at: attempt.completed_at,
        time_limit_secs: attempt.time_limit_secs,
        score: attempt.score,
        passed: attempt.passed,
        questions_snapshot: attempt.questions_snapshot.map((q) => ({
          ...q,
          options: q.options.map(({ id, text }) => ({ id, text })),
        })),
      },
    });
  }

  const { data: attempt, error } = await supabase
    .from('quiz_attempts')
    .select('id, course_id, assessment_type, started_at, completed_at, time_limit_secs, score, passed, questions_snapshot')
    .eq('id', attemptId)
    .eq('user_id', user.id)
    .single();

  if (error || !attempt) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }

  const sanitized = {
    ...attempt,
    questions_snapshot: ((attempt.questions_snapshot ?? []) as Array<{
      id: string;
      type: string;
      question_text: string;
      options: Array<{ id: string; text: string; is_correct?: boolean }>;
      points: number;
    }>).map((q) => ({
      ...q,
      options: q.options.map(({ id, text }) => ({ id, text })),
    })),
  };

  return NextResponse.json({ data: sanitized });
}
