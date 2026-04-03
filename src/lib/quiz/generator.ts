import type { SupabaseClient } from '@supabase/supabase-js';

function option(id: string, text: string, isCorrect: boolean) {
  return { id, text, is_correct: isCorrect };
}

type LessonLike = {
  id: string;
  title: string;
  description?: string | null;
};

export function buildGeneratedQuizQuestions(course: { id: string; code: string; name: string }, lessons: LessonLike[]) {
  const safeLessons = lessons.length > 0
    ? lessons
    : [{ id: `${course.id}-intro`, title: `${course.name} fundamentals`, description: null }];

  const titles = safeLessons.map((l) => l.title.trim()).filter(Boolean);
  const fallbackDistractors = [
    'Unrelated platform setup only',
    'Financial accounting principles',
    'Backend server deployment only',
    'General office productivity tips',
  ];

  const count = Math.max(10, Math.min(20, safeLessons.length * 2));
  const rows = Array.from({ length: count }).map((_, idx) => {
    const lesson = safeLessons[idx % safeLessons.length];
    const correct = lesson.title;

    const distractors = [
      ...titles.filter((t) => t !== correct).slice(0, 3),
      ...fallbackDistractors,
    ].slice(0, 3);

    const options = [
      option('opt_a', correct, true),
      option('opt_b', distractors[0] ?? 'Overview and context', false),
      option('opt_c', distractors[1] ?? 'Tooling and setup', false),
      option('opt_d', distractors[2] ?? 'Deployment details', false),
    ];

    return {
      course_id: course.id,
      type: 'multiple_choice',
      question_text: `In ${course.code}, which topic is covered in \"${lesson.title}\"?`,
      options,
      explanation: `This question checks recall of the lesson focus for ${lesson.title}.`,
      points: 1,
      shuffle_options: true,
      is_exam_question: false,
      difficulty: 2,
      source: 'generated',
      generation_version: 'v1',
      is_active: true,
    };
  });

  return rows;
}

export async function ensureQuizQuestions(
  supabase: SupabaseClient,
  courseId: string,
): Promise<{
  rows: {
    id: string;
    type: string;
    question_text: string;
    options: unknown;
    points: number;
    shuffle_options: boolean;
    is_exam_question: boolean;
  }[];
  reusedExisting: boolean;
}> {
  const { data: existing } = await supabase
    .from('questions')
    .select('id, type, question_text, options, points, shuffle_options, is_exam_question')
    .eq('course_id', courseId)
    .eq('is_exam_question', false)
    .order('created_at', { ascending: true });

  if ((existing?.length ?? 0) > 0) {
    return { rows: existing ?? [], reusedExisting: true };
  }

  const { data: course } = await supabase
    .from('courses')
    .select('id, code, name')
    .eq('id', courseId)
    .single();

  if (!course) {
    throw new Error('Course not found for question generation');
  }

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title, content')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true });

  const generatedRows = buildGeneratedQuizQuestions(
    { id: course.id, code: course.code, name: course.name },
    (lessons ?? []).map((l) => ({ id: l.id, title: l.title, description: l.content })),
  );

  const { data: inserted, error } = await supabase
    .from('questions')
    .insert(generatedRows)
    .select('id, type, question_text, options, points, shuffle_options, is_exam_question');

  if (error) {
    throw new Error(`Failed to generate questions: ${error.message}`);
  }

  return { rows: inserted ?? [], reusedExisting: false };
}
