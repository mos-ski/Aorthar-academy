import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEMO_COURSE_DETAIL, DEMO_COURSES } from '@/lib/demo/adminSnapshot';

// GET /api/admin/courses/[courseId]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  if (courseId.startsWith('demo-')) {
    const course = (DEMO_COURSE_DETAIL as Record<string, object>)[courseId]
      ?? DEMO_COURSES.find((c) => c.id === courseId)
      ?? null;
    if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: course });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// PATCH /api/admin/courses/[courseId] — update status, is_premium, pass_mark etc.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const supabase = await createClient();
  const { courseId } = await params;
  const body = await req.json();

  const allowed = ['status', 'is_premium', 'pass_mark', 'name', 'code', 'description', 'credit_units',
    'quiz_weight', 'exam_weight', 'quiz_attempt_limit', 'exam_attempt_limit', 'cooldown_hours',
    'exam_duration_minutes', 'sort_order'];
  const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await supabase
    .from('courses')
    .update(update)
    .eq('id', courseId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// DELETE /api/admin/courses/[courseId]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const supabase = await createClient();
  const { courseId } = await params;

  const { error } = await supabase.from('courses').delete().eq('id', courseId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
