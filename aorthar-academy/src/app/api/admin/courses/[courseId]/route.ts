import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH /api/admin/courses/[courseId] — update status, is_premium, pass_mark etc.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const supabase = await createClient();
  const { courseId } = await params;
  const body = await req.json();

  const allowed = ['status', 'is_premium', 'pass_mark', 'name', 'description', 'credit_units',
    'quiz_attempt_limit', 'exam_attempt_limit', 'cooldown_hours', 'sort_order'];
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
