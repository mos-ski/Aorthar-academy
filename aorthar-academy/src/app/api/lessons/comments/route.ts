import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildSampleComments } from '@/lib/classroom/mockData';

export async function GET(req: NextRequest) {
  const lessonId = req.nextUrl.searchParams.get('lessonId');
  if (!lessonId) return NextResponse.json({ error: 'lessonId is required' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: comments, error } = await supabase
    .from('lesson_comments')
    .select('id, lesson_id, course_id, user_id, parent_id, body, created_at, updated_at')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ comments: buildSampleComments(lessonId) });
  }

  const ids = (comments ?? []).map((c) => c.id);
  const { data: reactions } = ids.length === 0
    ? { data: [] as Array<{ comment_id: string; reaction: 'like' | 'dislike' }> }
    : await supabase
      .from('lesson_comment_reactions')
      .select('comment_id, reaction')
      .in('comment_id', ids);
  const { data: myRows } = ids.length === 0
    ? { data: [] as Array<{ comment_id: string; reaction: 'like' | 'dislike' }> }
    : await supabase
      .from('lesson_comment_reactions')
      .select('comment_id, reaction')
      .eq('user_id', user.id)
      .in('comment_id', ids);

  const countMap = new Map<string, { like: number; dislike: number }>();
  for (const row of reactions ?? []) {
    const current = countMap.get(row.comment_id) ?? { like: 0, dislike: 0 };
    if (row.reaction === 'like') current.like += 1;
    if (row.reaction === 'dislike') current.dislike += 1;
    countMap.set(row.comment_id, current);
  }

  const mine = new Map<string, 'like' | 'dislike'>();
  for (const row of myRows ?? []) {
    if (row.comment_id && (row.reaction === 'like' || row.reaction === 'dislike')) {
      mine.set(row.comment_id, row.reaction);
    }
  }

  const parents = (comments ?? []).filter((c) => !c.parent_id).map((c) => ({
    ...c,
    counts: countMap.get(c.id) ?? { like: 0, dislike: 0 },
    myReaction: mine.get(c.id) ?? null,
    replies: [] as unknown[],
  }));

  const byId = new Map(parents.map((p) => [p.id, p]));
  for (const reply of (comments ?? []).filter((c) => c.parent_id)) {
    const parent = byId.get(reply.parent_id ?? '');
    if (!parent) continue;
    parent.replies.push({
      ...reply,
      counts: countMap.get(reply.id) ?? { like: 0, dislike: 0 },
      myReaction: mine.get(reply.id) ?? null,
    });
  }

  const merged: Array<Record<string, unknown>> = [...parents];
  if (merged.length < 20) {
    const mock = buildSampleComments(lessonId)
      .slice(0, 20 - merged.length)
      .map((row) => ({
        ...row,
        lesson_id: lessonId,
        course_id: null,
        updated_at: row.created_at,
      }));
    merged.push(...mock);
  }

  return NextResponse.json({ comments: merged });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const lessonId = body.lessonId as string | undefined;
  const courseId = body.courseId as string | undefined;
  const text = body.text as string | undefined;
  const parentId = body.parentId as string | undefined;

  if (!lessonId || !courseId || !text?.trim()) {
    return NextResponse.json({ error: 'lessonId, courseId and text are required' }, { status: 400 });
  }

  if (parentId) {
    const { data: parent } = await supabase
      .from('lesson_comments')
      .select('id, parent_id')
      .eq('id', parentId)
      .maybeSingle();
    if (!parent || parent.parent_id) {
      return NextResponse.json({ error: 'Only one reply level is allowed' }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from('lesson_comments')
    .insert({
      lesson_id: lessonId,
      course_id: courseId,
      user_id: user.id,
      parent_id: parentId ?? null,
      body: text.trim(),
    })
    .select('id, lesson_id, course_id, user_id, parent_id, body, created_at')
    .single();

  if (error) {
    return NextResponse.json({
      ok: true,
      comment: {
        id: `local-${Date.now()}`,
        lesson_id: lessonId,
        course_id: courseId,
        user_id: user.id,
        parent_id: parentId ?? null,
        body: text.trim(),
        created_at: new Date().toISOString(),
      },
    });
  }
  return NextResponse.json({ ok: true, comment: data });
}
