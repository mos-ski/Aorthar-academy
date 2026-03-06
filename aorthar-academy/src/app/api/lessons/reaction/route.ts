import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getCounts(supabase: Awaited<ReturnType<typeof createClient>>, lessonId: string) {
  const { data: rows } = await supabase
    .from('lesson_reactions')
    .select('reaction')
    .eq('lesson_id', lessonId);

  const like = (rows ?? []).filter((r) => r.reaction === 'like').length;
  const dislike = (rows ?? []).filter((r) => r.reaction === 'dislike').length;
  return { like, dislike };
}

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

  if (error) return NextResponse.json({ reaction: null, counts: { like: 0, dislike: 0 } });
  const counts = await getCounts(supabase, lessonId);
  return NextResponse.json({ reaction: data?.reaction ?? null, counts });
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

    if (error) return NextResponse.json({ ok: true, reaction: null, counts: { like: 0, dislike: 0 } });
    const counts = await getCounts(supabase, lessonId);
    return NextResponse.json({ ok: true, reaction: null, counts });
  }

  const { error } = await supabase
    .from('lesson_reactions')
    .upsert({
      user_id: user.id,
      lesson_id: lessonId,
      course_id: courseId,
      reaction,
    }, { onConflict: 'user_id,lesson_id' });

  if (error) {
    return NextResponse.json({
      ok: true,
      reaction,
      counts: { like: reaction === 'like' ? 1 : 0, dislike: reaction === 'dislike' ? 1 : 0 },
    });
  }
  const counts = await getCounts(supabase, lessonId);
  return NextResponse.json({ ok: true, reaction, counts });
}
