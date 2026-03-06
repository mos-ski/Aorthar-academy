import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchYouTubeCandidateUrls, fetchYouTubeOembedTitle, extractYouTubeId } from '@/lib/youtube';
import { getDemoCourseDetail } from '@/lib/demo/studentSnapshot';
import { buildSampleRelatedVideos } from '@/lib/classroom/mockData';

export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get('courseId');
  const lessonId = req.nextUrl.searchParams.get('lessonId');
  if (!courseId || !lessonId) {
    return NextResponse.json({ error: 'courseId and lessonId are required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [{ data: course }, { data: lesson }] = await Promise.all([
    supabase.from('courses').select('code, name').eq('id', courseId).single(),
    supabase.from('lessons').select('title').eq('id', lessonId).single(),
  ]);

  let courseCode = course?.code;
  let courseName = course?.name;
  let lessonTitle = lesson?.title;

  if (!course || !lesson) {
    const demo = getDemoCourseDetail(courseId);
    const demoLesson = demo?.lessons?.find((l) => l.id === lessonId);
    if (!demo || !demoLesson) {
      return NextResponse.json({ videos: buildSampleRelatedVideos('Class Topic') });
    }
    courseCode = demo.code;
    courseName = demo.name;
    lessonTitle = demoLesson.title;
  }

  const query = `${courseCode} ${courseName} ${lessonTitle} tutorial deep dive`;
  const urls = await searchYouTubeCandidateUrls(query, 9);

  const rows = await Promise.all(
    urls.map(async (url) => {
      const title = await fetchYouTubeOembedTitle(url);
      const videoId = extractYouTubeId(url);
      return {
        title: title ?? 'Related video',
        url,
        thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null,
      };
    }),
  );

  if (rows.length === 0) {
    return NextResponse.json({ query, videos: buildSampleRelatedVideos(lessonTitle ?? 'Class Topic') });
  }

  return NextResponse.json({ query, videos: rows });
}
