import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureQuizQuestions } from '@/lib/quiz/generator';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const courseId = body.courseId as string | undefined;

  if (!courseId) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
  }

  try {
    const result = await ensureQuizQuestions(supabase, courseId);
    return NextResponse.json({
      ok: true,
      createdCount: result.reusedExisting ? 0 : result.rows.length,
      reusedExisting: result.reusedExisting,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate quiz';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
