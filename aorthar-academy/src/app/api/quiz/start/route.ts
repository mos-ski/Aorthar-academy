import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureQuizQuestions } from '@/lib/quiz/generator';

// POST /api/quiz/start — Creates a quiz attempt and returns shuffled questions (no answers)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const courseId = (body.courseId ?? body.course_id) as string | undefined;
  const assessment_type = (body.assessmentType ?? body.assessment_type ?? 'quiz') as 'quiz' | 'exam';

  if (!courseId) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
  }

  // Fetch course config
  const { data: course } = await supabase
    .from('courses')
    .select('id, quiz_attempt_limit, exam_attempt_limit, cooldown_hours, exam_duration_mins, quiz_duration_mins, pass_mark, status, is_premium')
    .eq('id', courseId)
    .single();

  if (!course || course.status !== 'published') {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  // Check premium access for premium courses
  if (course.is_premium) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!sub) return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
  }

  // Check cooldown
  const { data: cooldownCheck } = await supabase.rpc('is_on_cooldown', {
    p_user_id: user.id,
    p_course_id: courseId,
    p_assessment_type: assessment_type,
  });

  if (cooldownCheck) {
    return NextResponse.json({ error: 'You are on cooldown. Try again later.' }, { status: 429 });
  }

  // Check attempt limit
  const limit = assessment_type === 'exam' ? course.exam_attempt_limit : course.quiz_attempt_limit;
  const { data: count } = await supabase.rpc('get_attempt_count', {
    p_user_id: user.id,
    p_course_id: courseId,
    p_assessment_type: assessment_type,
  });

  if ((count ?? 0) >= limit) {
    return NextResponse.json({ error: 'Maximum attempts reached' }, { status: 400 });
  }

  // Fetch questions (strip correct_answer)
  const questions = assessment_type === 'quiz'
    ? (await ensureQuizQuestions(supabase, courseId)).rows
    : (await supabase
      .from('questions')
      .select('id, type, question_text, options, points, shuffle_options, is_exam_question')
      .eq('course_id', courseId)
      .eq('is_exam_question', true)).data ?? [];

  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: 'No questions available' }, { status: 404 });
  }

  // Shuffle questions server-side
  const shuffled = [...questions].sort(() => Math.random() - 0.5);

  // Strip correct answer from options
  const clientQuestions = shuffled.map((q) => ({
    ...q,
    options: (q.options as { id: string; text: string; is_correct: boolean }[])
      .sort(() => (q.shuffle_options ? Math.random() - 0.5 : 0))
      .map(({ id, text }) => ({ id, text })),
  }));

  // Create attempt record
  const { data: attempt } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: user.id,
      course_id: courseId,
      assessment_type,
      attempt_number: (count ?? 0) + 1,
      questions_snapshot: clientQuestions,
      time_limit_secs: (assessment_type === 'exam' ? course.exam_duration_mins : course.quiz_duration_mins) * 60,
    })
    .select('id, started_at')
    .single();

  if (!attempt) return NextResponse.json({ error: 'Failed to create attempt' }, { status: 500 });

  const response = {
    attemptId: attempt.id,
    attempt_id: attempt.id,
    questions: clientQuestions,
    started_at: attempt.started_at,
    time_limit_minutes: assessment_type === 'exam' ? course.exam_duration_mins : course.quiz_duration_mins,
    data: {
      attempt_id: attempt.id,
      questions: clientQuestions,
      started_at: attempt.started_at,
      time_limit_minutes: assessment_type === 'exam' ? course.exam_duration_mins : course.quiz_duration_mins,
    },
  };

  return NextResponse.json(response);
}
