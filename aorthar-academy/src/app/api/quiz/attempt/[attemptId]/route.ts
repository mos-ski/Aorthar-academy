import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface Params {
  params: Promise<{ attemptId: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { attemptId } = await params;

  const { data: attempt, error } = await supabase
    .from('quiz_attempts')
    .select('id, course_id, assessment_type, started_at, completed_at, time_limit_secs, score, passed, questions_snapshot')
    .eq('id', attemptId)
    .eq('user_id', user.id)
    .single();

  if (error || !attempt) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }

  return NextResponse.json({ data: attempt });
}
