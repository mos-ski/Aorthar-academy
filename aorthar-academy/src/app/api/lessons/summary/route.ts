import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { askOpenAI } from '@/lib/ai/openai';
import { fetchYouTubeTranscript } from '@/lib/youtubeTranscript';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const courseId = body.courseId as string | undefined;
  const lessonId = body.lessonId as string | undefined;

  if (!courseId || !lessonId) {
    return NextResponse.json({ error: 'courseId and lessonId are required' }, { status: 400 });
  }

  const [{ data: course }, { data: lesson }] = await Promise.all([
    supabase.from('courses').select('code, name').eq('id', courseId).single(),
    supabase.from('lessons').select('id, title, description, resources(url, title, type)').eq('id', lessonId).single(),
  ]);

  if (!course || !lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

  const firstVideo = (lesson.resources ?? []).find((r: { type: string; url: string }) => r.type === 'youtube');
  const transcript = firstVideo ? await fetchYouTubeTranscript(firstVideo.url) : null;
  const sourceText = transcript
    ?? lesson.description
    ?? `${lesson.title}. ${((lesson.resources ?? []) as Array<{ title: string }>).map((r) => r.title).join(', ')}`;

  const ai = await askOpenAI([
    {
      role: 'system',
      content: 'You are an academic assistant. Return concise markdown summary and 5 bullet key points.',
    },
    {
      role: 'user',
      content: `Course: ${course.code} ${course.name}\nLesson: ${lesson.title}\n\nContent:\n${sourceText}\n\nReturn JSON: {"summary_markdown":"...","key_points":["..."]}`,
    },
  ]);

  let summaryMarkdown = `### ${lesson.title}\n\n${sourceText.slice(0, 500)}...`;
  let keyPoints: string[] = ['Understand the lesson objective', 'Review examples from the class resource'];

  if (ai) {
    try {
      const parsed = JSON.parse(ai.match(/\{[\s\S]*\}/)?.[0] ?? '{}') as {
        summary_markdown?: string;
        key_points?: string[];
      };
      if (parsed.summary_markdown) summaryMarkdown = parsed.summary_markdown;
      if (Array.isArray(parsed.key_points) && parsed.key_points.length > 0) keyPoints = parsed.key_points.slice(0, 8);
    } catch {
      // fallback retained
    }
  }

  const { data: saved, error } = await supabase
    .from('lesson_summaries')
    .upsert(
      {
        lesson_id: lessonId,
        course_id: courseId,
        summary_markdown: summaryMarkdown,
        key_points: keyPoints,
        source: ai ? 'openai' : 'fallback',
        created_by: user.id,
      },
      { onConflict: 'lesson_id,created_by' },
    )
    .select('id, summary_markdown, key_points, source, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, summary: saved });
}

export async function GET(req: NextRequest) {
  const lessonId = req.nextUrl.searchParams.get('lessonId');
  if (!lessonId) return NextResponse.json({ error: 'lessonId is required' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('lesson_summaries')
    .select('id, summary_markdown, key_points, source, created_at')
    .eq('lesson_id', lessonId)
    .eq('created_by', user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ summary: data ?? null });
}
