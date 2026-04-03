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

  // Load all published lessons
  const { data: lessons } = await supabase
    .from('standalone_lessons')
    .select('id, title, sort_order, youtube_url')
    .eq('course_id', course.id)
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  const lesson = (lessons ?? []).find((l) => l.id === lessonId);
  if (!lesson) notFound();

  // Load completed lessons for this user
  const lessonIds = (lessons ?? []).map((l) => l.id);
  const { data: progress } = await supabase
    .from('standalone_lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id)
    .in('lesson_id', lessonIds.length ? lessonIds : ['00000000-0000-0000-0000-000000000000']);

  const completedIds = new Set((progress ?? []).map((p) => p.lesson_id));

  return (
    <LessonClassroom
      course={{ id: course.id, slug: course.slug, title: course.title }}
      lessons={(lessons ?? []).map((l) => ({
        id: l.id,
        title: l.title,
        sortOrder: l.sort_order,
        youtubeUrl: l.youtube_url,
        completed: completedIds.has(l.id),
      }))}
      currentLessonId={lessonId}
      userEmail={user.email ?? ''}
      userFullName={profile?.full_name}
      userAvatarUrl={profile?.avatar_url}
    />
  );
}
