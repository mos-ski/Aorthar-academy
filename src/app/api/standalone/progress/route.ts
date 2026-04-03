import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let lessonId: string;
  try {
    const body = await request.json();
    lessonId = body.lessonId;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!lessonId) {
    return NextResponse.json({ error: 'lessonId required' }, { status: 400 });
  }

  // Verify the lesson exists and belongs to a course the user purchased
  const { data: lesson } = await supabase
    .from('standalone_lessons')
    .select('id, course_id')
    .eq('id', lessonId)
    .single();

  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  const { data: purchase } = await supabase
    .from('standalone_purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', lesson.course_id)
    .maybeSingle();

  if (!purchase) {
    return NextResponse.json({ error: 'Not purchased' }, { status: 403 });
  }

  // Upsert progress (idempotent)
  const { error } = await supabase
    .from('standalone_lesson_progress')
    .upsert({ user_id: user.id, lesson_id: lessonId }, { onConflict: 'user_id,lesson_id' });

  if (error) {
    console.error('[standalone/progress] upsert error:', error);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }

  // Return updated completion count for this course
  const { count } = await supabase
    .from('standalone_lesson_progress')
    .select('lesson_id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('lesson_id',
      (await supabase
        .from('standalone_lessons')
        .select('id')
        .eq('course_id', lesson.course_id)
        .eq('is_published', true)
      ).data?.map((l) => l.id) ?? []
    );

  return NextResponse.json({ ok: true, completedCount: count ?? 0 });
}
