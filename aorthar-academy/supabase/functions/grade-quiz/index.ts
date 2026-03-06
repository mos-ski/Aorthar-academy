// Supabase Edge Function: grade-quiz
// Handles server-side quiz/exam grading with anti-cheat measures
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubmitPayload {
  attempt_id: string;
  answers: Record<string, string | string[]>; // question_id → option id(s)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Verify user JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    );
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SubmitPayload = await req.json();
    const { attempt_id, answers } = body;

    // Fetch the attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select('*, courses(pass_mark, quiz_attempt_limit, exam_attempt_limit, cooldown_hours)')
      .eq('id', attempt_id)
      .eq('user_id', user.id)
      .single();

    if (attemptError || !attempt) {
      return Response.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (attempt.completed_at) {
      return Response.json({ error: 'Attempt already submitted' }, { status: 400 });
    }

    // Check time limit (90 min for exam, 45 min for quiz by default)
    const timeLimitMins = attempt.assessment_type === 'exam' ? 90 : 45;
    const elapsed = (Date.now() - new Date(attempt.started_at).getTime()) / 60000;
    if (elapsed > timeLimitMins + 1) { // 1 min grace
      return Response.json({ error: 'Time limit exceeded' }, { status: 400 });
    }

    // Fetch questions with correct answers
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('id, options, points, is_exam_question')
      .eq('course_id', attempt.course_id)
      .eq('is_exam_question', attempt.assessment_type === 'exam');

    if (qError || !questions) {
      return Response.json({ error: 'Questions not found' }, { status: 500 });
    }

    // Grade answers
    let earned = 0;
    let total = 0;

    for (const q of questions) {
      total += q.points;
      const correctIds = (q.options as { id: string; is_correct: boolean }[])
        .filter((o) => o.is_correct)
        .map((o) => o.id);

      const studentAnswer = answers[q.id];
      if (!studentAnswer) continue;

      const studentIds = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];
      const isCorrect =
        studentIds.length === correctIds.length &&
        studentIds.every((id) => correctIds.includes(id));

      if (isCorrect) earned += q.points;
    }

    const score = total > 0 ? Math.round((earned / total) * 100) : 0;
    const passed = score >= (attempt.courses.pass_mark ?? 60);

    // Determine cooldown
    const maxAttempts = attempt.assessment_type === 'exam'
      ? attempt.courses.exam_attempt_limit
      : attempt.courses.quiz_attempt_limit;

    const attemptCount = await supabase
      .from('quiz_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('course_id', attempt.course_id)
      .eq('assessment_type', attempt.assessment_type)
      .not('completed_at', 'is', null);

    const cooldownHours = attempt.courses.cooldown_hours ?? 24;
    const cooldown_until =
      !passed && (attemptCount.count ?? 0) < maxAttempts - 1
        ? new Date(Date.now() + cooldownHours * 3600 * 1000).toISOString()
        : null;

    // Update attempt record (immutable score)
    await supabase
      .from('quiz_attempts')
      .update({
        completed_at: new Date().toISOString(),
        score,
        passed,
        answers,
        cooldown_until,
      })
      .eq('id', attempt_id);

    // If passed, update course_grades
    if (passed) {
      const gradeField = attempt.assessment_type === 'quiz' ? 'quiz_score' : 'exam_score';

      const { data: existingGrade } = await supabase
        .from('course_grades')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', attempt.course_id)
        .maybeSingle();

      if (existingGrade) {
        await supabase
          .from('course_grades')
          .update({ [gradeField]: score })
          .eq('user_id', user.id)
          .eq('course_id', attempt.course_id);
      } else {
        await supabase
          .from('course_grades')
          .insert({
            user_id: user.id,
            course_id: attempt.course_id,
            [gradeField]: score,
          });
      }
    }

    return Response.json({
      data: {
        attempt_id,
        score,
        passed,
        correct_count: earned,
        total_questions: questions.length,
        cooldown_until,
      },
    }, { headers: corsHeaders });

  } catch (err) {
    console.error('grade-quiz error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});
