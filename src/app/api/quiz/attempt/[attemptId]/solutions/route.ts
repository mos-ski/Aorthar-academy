import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDemoAttempt } from '@/lib/demo/quizAttempts';

interface Params {
  params: Promise<{ attemptId: string }>;
}

type SnapshotQuestion = {
  id: string;
  question_text: string;
  explanation?: string | null;
  options: Array<{ id: string; text: string; is_correct?: boolean }>;
};

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

    const solutions = (attempt.questions_snapshot as SnapshotQuestion[]).map((q) => ({
      question_id: q.id,
      correct_option_ids: q.options.filter((o) => o.is_correct).map((o) => o.id),
      explanation: q.explanation ?? null,
    }));
    return NextResponse.json({ solutions });
  }

  const { data: attempt, error } = await supabase
    .from('quiz_attempts')
    .select('id, user_id, completed_at, questions_snapshot')
    .eq('id', attemptId)
    .eq('user_id', user.id)
    .single();

  if (error || !attempt) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }

  if (!attempt.completed_at) {
    return NextResponse.json({ error: 'Solutions available after submission only' }, { status: 400 });
  }

  const questions = (attempt.questions_snapshot ?? []) as SnapshotQuestion[];
  const solutions = questions.map((q) => ({
    question_id: q.id,
    correct_option_ids: q.options.filter((o) => o.is_correct).map((o) => o.id),
    explanation: q.explanation ?? null,
  }));

  return NextResponse.json({ solutions });
}

