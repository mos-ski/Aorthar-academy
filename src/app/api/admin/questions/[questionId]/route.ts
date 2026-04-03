import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH /api/admin/questions/[questionId]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ questionId: string }> }) {
  const supabase = await createClient();
  const { questionId } = await params;
  const body = await req.json();

  const allowed = ['question_text', 'options', 'points', 'shuffle_options', 'is_exam_question', 'difficulty'];
  const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await supabase
    .from('questions').update(update).eq('id', questionId).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// DELETE /api/admin/questions/[questionId]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ questionId: string }> }) {
  const supabase = await createClient();
  const { questionId } = await params;

  const { error } = await supabase.from('questions').delete().eq('id', questionId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
