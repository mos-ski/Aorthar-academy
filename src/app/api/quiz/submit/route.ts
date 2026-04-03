import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDemoAttempt, saveDemoAttempt } from '@/lib/demo/quizAttempts';

// POST /api/quiz/submit — Delegates grading to the Edge Function
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const attemptId = (body.attempt_id ?? body.attemptId) as string | undefined;

  if (attemptId?.startsWith('demo-')) {
    const attempt = getDemoAttempt(attemptId);
    if (!attempt || attempt.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    const answers = (body.answers ?? {}) as Record<string, string>;
    const total = attempt.questions_snapshot.length;
    let correct = 0;
    for (const q of attempt.questions_snapshot) {
      const selected = answers[q.id];
      const matched = q.options.find((o) => o.id === selected);
      if (matched?.is_correct) correct += 1;
    }

    const score = total > 0 ? Number(((correct / total) * 100).toFixed(2)) : 0;
    const passed = score >= 60;
    attempt.completed_at = new Date().toISOString();
    attempt.score = score;
    attempt.passed = passed;
    saveDemoAttempt(attempt);

    return NextResponse.json({
      data: {
        attempt_id: attempt.id,
        score,
        passed,
        correct_count: correct,
        total_questions: total,
      },
    });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/grade-quiz`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.ok ? 200 : res.status });
}
