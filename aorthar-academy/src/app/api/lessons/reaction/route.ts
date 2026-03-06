import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const lessonId = req.nextUrl.searchParams.get('lessonId');
  if (!lessonId) return NextResponse.json({ error: 'lessonId is required' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('lesson_reactions')
    .select('reaction')
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reaction: data?.reaction ?? null });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const lessonId = body.lessonId as string | undefined;
  const courseId = body.courseId as string | undefined;
  const reaction = body.reaction as 'like' | 'dislike' | null;

  if (!lessonId || !courseId) {
    return NextResponse.json({ error: 'lessonId and courseId are required' }, { status: 400 });
  }

  if (reaction !== null && reaction !== 'like' && reaction !== 'dislike') {
    return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 });
  }

  if (reaction === null) {
    const { error } = await supabase
      .from('lesson_reactions')
      .delete()
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, reaction: null });
  }

  const { error } = await supabase
    .from('lesson_reactions')
    .upsert({
      user_id: user.id,
      lesson_id: lessonId,
      course_id: courseId,
      reaction,
    }, { onConflict: 'user_id,lesson_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, reaction });
}
