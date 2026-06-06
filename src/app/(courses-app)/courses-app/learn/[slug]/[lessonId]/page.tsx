import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LessonClassroom from './LessonClassroom';

type Props = { params: Promise<{ slug: string; lessonId: string }> };

export default async function LessonPage({ params }: Props) {
  const { slug, lessonId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/courses-app/learn/${slug}/${lessonId}`);

  const { data: profile } = await supabase
    .from('profiles').select('full_name, avatar_url').eq('user_id', user.id).maybeSingle();

  // Load course
  const { data: course } = await supabase
    .from('standalone_courses')
    .select('id, slug, title, status')
    .eq('slug', slug)
    .single();

  if (!course) notFound();

  // Verify purchase
  const { data: purchase } = await supabase
    .from('standalone_purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle();

  if (!purchase) redirect(`/courses-app/${slug}`);

  // Load published and scheduled lessons
  const { data: allLessons } = await supabase
    .from('standalone_lessons')
    .select('id, title, sort_order, youtube_url, content, is_published, is_scheduled')
    .eq('course_id', course.id)
    .or('is_published.eq.true,is_scheduled.eq.true')
    .order('sort_order', { ascending: true });

  const publishedLessons = (allLessons ?? []).filter((l) => l.is_published);

  // If requested lesson is scheduled (not published), redirect to first published lesson
  const isRequestedLessonScheduled = (allLessons ?? []).find((l) => l.id === lessonId && l.is_scheduled && !l.is_published);
  if (isRequestedLessonScheduled || !publishedLessons.find((l) => l.id === lessonId)) {
    const first = publishedLessons[0];
    if (first) redirect(`/courses-app/learn/${slug}/${first.id}`);
    else redirect(`/courses-app/${slug}`);
  }

  // Load completed lessons for this user (only published lessons count)
  const publishedIds = publishedLessons.map((l) => l.id);
  const { data: progress } = await supabase
    .from('standalone_lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id)
    .in('lesson_id', publishedIds.length ? publishedIds : ['00000000-0000-0000-0000-000000000000']);

  const completedIds = new Set((progress ?? []).map((p) => p.lesson_id));

  return (
    <LessonClassroom
      course={{ id: course.id, slug: course.slug, title: course.title }}
      lessons={(allLessons ?? []).map((l) => ({
        id: l.id,
        title: l.title,
        sortOrder: l.sort_order,
        youtubeUrl: l.youtube_url,
        content: l.content,
        completed: completedIds.has(l.id),
        scheduled: l.is_scheduled && !l.is_published,
      }))}
      currentLessonId={lessonId}
      userEmail={user.email ?? ''}
      userFullName={profile?.full_name}
      userAvatarUrl={profile?.avatar_url}
    />
  );
}
