import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CourseWatch from './CourseWatch';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('standalone_courses')
    .select('title, description')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  if (!data) return { title: 'Course Not Found' };
  return { title: `${data.title} — Aorthar`, description: data.description };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from('standalone_courses')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!course) notFound();

  const { data: lessons } = await supabase
    .from('standalone_lessons')
    .select('id, title, sort_order, youtube_url')
    .eq('course_id', course.id)
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  const allLessons = (lessons ?? []) as { id: string; title: string; sort_order: number; youtube_url: string }[];
  const firstLesson = allLessons[0] ?? null;

  const { data: { user } } = await supabase.auth.getUser();
  let hasPurchased = false;
  let profile: { full_name?: string | null; avatar_url?: string | null } | null = null;
  if (user) {
    const [{ data: purchase }, { data: prof }] = await Promise.all([
      supabase.from('standalone_purchases').select('id').eq('user_id', user.id).eq('course_id', course.id).maybeSingle(),
      supabase.from('profiles').select('full_name, avatar_url').eq('user_id', user.id).maybeSingle(),
    ]);
    hasPurchased = Boolean(purchase);
    profile = prof;
  }

  return (
    <CourseWatch
      course={course}
      lessons={allLessons}
      firstLesson={firstLesson}
      hasPurchased={hasPurchased}
      isLoggedIn={Boolean(user)}
      userEmail={user?.email}
      userFullName={profile?.full_name}
      userAvatarUrl={profile?.avatar_url}
    />
  );
}
