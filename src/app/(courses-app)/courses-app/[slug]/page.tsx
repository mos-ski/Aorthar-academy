import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CourseWatch from './CourseWatch';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('standalone_courses')
    .select('title, description, thumbnail_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  if (!data) return { title: 'Course Not Found' };
  const title = `${data.title} — Aorthar`;
  return {
    title,
    description: data.description,
    openGraph: {
      title,
      description: data.description,
      images: data.thumbnail_url ? [{ url: data.thumbnail_url, alt: data.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: data.description,
      images: data.thumbnail_url ? [data.thumbnail_url] : undefined,
    },
  };
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
    .select('id, title, sort_order, youtube_url, content, is_published, is_scheduled')
    .eq('course_id', course.id)
    .or('is_published.eq.true,is_scheduled.eq.true')
    .order('sort_order', { ascending: true });

  const allLessons = (lessons ?? []) as { id: string; title: string; sort_order: number; youtube_url: string; content: string | null; is_published: boolean; is_scheduled: boolean }[];
  const publishedLessons = allLessons.filter((l) => l.is_published);
  const firstLesson = publishedLessons[0] ?? null;

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
      lessons={publishedLessons}
      scheduledLessons={allLessons.filter((l) => l.is_scheduled && !l.is_published)}
      firstLesson={firstLesson}
      hasPurchased={hasPurchased}
      isLoggedIn={Boolean(user)}
      userEmail={user?.email}
      userFullName={profile?.full_name}
      userAvatarUrl={profile?.avatar_url}
    />
  );
}
