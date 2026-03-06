import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH /api/admin/lessons/[lessonId]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const supabase = await createClient();
  const { lessonId } = await params;
  const body = await req.json();

  const allowed = ['title', 'content', 'sort_order', 'duration_minutes', 'is_published'];
  const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await supabase
    .from('lessons')
    .update(update)
    .eq('id', lessonId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// DELETE /api/admin/lessons/[lessonId]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const supabase = await createClient();
  const { lessonId } = await params;

  const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
