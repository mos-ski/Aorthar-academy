import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/courses/[courseId]/lessons
export async function GET(_req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const supabase = await createClient();
  const { courseId } = await params;

  const { data, error } = await supabase
    .from('lessons')
    .select('*, resources(id, type, title, url, sort_order)')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST /api/admin/courses/[courseId]/lessons
export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const supabase = await createClient();
  const { courseId } = await params;
  const { title, content, sort_order, duration_minutes } = await req.json();

  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

  const { data, error } = await supabase
    .from('lessons')
    .insert({ course_id: courseId, title, content: content ?? null, sort_order: sort_order ?? 1, duration_minutes: duration_minutes ?? 45, is_published: true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
