import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/admin/lessons/[lessonId]/resources
export async function POST(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const supabase = await createClient();
  const { lessonId } = await params;
  const { type, title, url, sort_order } = await req.json();

  if (!url || !title) return NextResponse.json({ error: 'title and url are required' }, { status: 400 });

  const { data, error } = await supabase
    .from('resources')
    .insert({ lesson_id: lessonId, type: type ?? 'youtube', title, url, sort_order: sort_order ?? 1 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
