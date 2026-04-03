import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchYouTubeOembedTitle, isPlayableYouTubeUrl, searchYouTubeCandidateUrls } from '@/lib/youtube';

const MAX_RESULTS = 5;

export async function GET(req: NextRequest) {
  const lessonId = req.nextUrl.searchParams.get('lessonId');
  if (!lessonId) return NextResponse.json({ error: 'lessonId is required' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('lesson_deep_dive_links')
    .select('id, title, url, query, source, created_at')
    .eq('lesson_id', lessonId)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ links: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const courseId = body.courseId as string | undefined;
  const lessonId = body.lessonId as string | undefined;
  const topic = body.topic as string | undefined;

  if (!courseId || !lessonId) {
    return NextResponse.json({ error: 'courseId and lessonId are required' }, { status: 400 });
  }

  const [{ data: course }, { data: lesson }] = await Promise.all([
    supabase.from('courses').select('id, code, name').eq('id', courseId).single(),
    supabase.from('lessons').select('id, title').eq('id', lessonId).single(),
  ]);

  if (!course || !lesson) {
    return NextResponse.json({ error: 'Course or lesson not found' }, { status: 404 });
  }

  const query = `${course.code} ${course.name} ${lesson.title} ${topic ?? ''} deep dive tutorial`.trim();
  const candidates = await searchYouTubeCandidateUrls(query, 12);

  const prepared: { title: string; url: string }[] = [];
  for (const url of candidates) {
    if (prepared.length >= MAX_RESULTS) break;

    const ok = await isPlayableYouTubeUrl(url);
    if (!ok) continue;

    const title = await fetchYouTubeOembedTitle(url);
    prepared.push({ title: title ?? `Deep Dive Video ${prepared.length + 1}`, url });
  }

  if (prepared.length === 0) {
    return NextResponse.json({ error: 'No deep-dive links found right now' }, { status: 404 });
  }

  const rows = prepared.map((item) => ({
    lesson_id: lessonId,
    course_id: courseId,
    query,
    title: item.title,
    url: item.url,
    source: 'youtube_search',
    created_by: user.id,
  }));

  const { error } = await supabase
    .from('lesson_deep_dive_links')
    .upsert(rows, { onConflict: 'lesson_id,url' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    query,
    links: prepared,
  });
}
