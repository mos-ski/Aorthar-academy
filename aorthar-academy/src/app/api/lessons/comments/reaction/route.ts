import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const commentId = body.commentId as string | undefined;
  const reaction = body.reaction as 'like' | 'dislike' | null;

  if (!commentId) return NextResponse.json({ error: 'commentId is required' }, { status: 400 });
  if (reaction !== null && reaction !== 'like' && reaction !== 'dislike') {
    return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 });
  }

  if (reaction === null) {
    const { error } = await supabase
      .from('lesson_comment_reactions')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id);

    if (error) return NextResponse.json({ ok: true, reaction: null, counts: { like: 0, dislike: 0 } });
  } else {
    const { error } = await supabase
      .from('lesson_comment_reactions')
      .upsert(
        { comment_id: commentId, user_id: user.id, reaction },
        { onConflict: 'comment_id,user_id' },
      );
    if (error) return NextResponse.json({ ok: true, reaction, counts: { like: reaction === 'like' ? 1 : 0, dislike: reaction === 'dislike' ? 1 : 0 } });
  }

  const { data: rows } = await supabase
    .from('lesson_comment_reactions')
    .select('reaction')
    .eq('comment_id', commentId);

  const counts = rows ? {
    like: (rows ?? []).filter((r) => r.reaction === 'like').length,
    dislike: (rows ?? []).filter((r) => r.reaction === 'dislike').length,
  } : { like: reaction === 'like' ? 1 : 0, dislike: reaction === 'dislike' ? 1 : 0 };

  return NextResponse.json({ ok: true, reaction, counts });
}
