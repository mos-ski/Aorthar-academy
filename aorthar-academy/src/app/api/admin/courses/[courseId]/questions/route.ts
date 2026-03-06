import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/courses/[courseId]/questions
export async function GET(_req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const supabase = await createClient();
  const { courseId } = await params;

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('course_id', courseId)
    .order('is_exam_question', { ascending: true })
    .order('difficulty', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST /api/admin/courses/[courseId]/questions
export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const supabase = await createClient();
  const { courseId } = await params;
  const { question_text, options, points, shuffle_options, is_exam_question, difficulty } = await req.json();

  if (!question_text || !options) {
    return NextResponse.json({ error: 'question_text and options are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('questions')
    .insert({
      course_id: courseId,
      type: 'multiple_choice',
      question_text,
      options,
      points: points ?? 1,
      shuffle_options: shuffle_options ?? true,
      is_exam_question: is_exam_question ?? false,
      difficulty: difficulty ?? 1,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
