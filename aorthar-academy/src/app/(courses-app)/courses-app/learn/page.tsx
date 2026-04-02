import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import UserAvatar from '@/components/standalone/UserAvatar';

export const metadata = { title: 'My Courses — Aorthar' };

export default async function MyCoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/courses-app/learn');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('user_id', user.id)
    .maybeSingle();

  // Get user's purchased courses with lesson progress
  const { data: purchases } = await supabase
    .from('standalone_purchases')
    .select('course_id, purchased_at, standalone_courses(id, slug, title, description, thumbnail_url, instructor_name)')
    .eq('user_id', user.id)
    .order('purchased_at', { ascending: false });

  const courseIds = (purchases ?? []).map((p) => p.course_id);

  // Total lesson counts per course
  const { data: allLessons } = await supabase
    .from('standalone_lessons')
    .select('id, course_id')
    .in('course_id', courseIds.length ? courseIds : ['00000000-0000-0000-0000-000000000000'])
    .eq('is_published', true);

  // Completed lessons for this user
  const lessonIds = (allLessons ?? []).map((l) => l.id);
  const { data: progress } = await supabase
    .from('standalone_lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id)
    .in('lesson_id', lessonIds.length ? lessonIds : ['00000000-0000-0000-0000-000000000000']);

  const completedSet = new Set((progress ?? []).map((p) => p.lesson_id));

  const totalMap: Record<string, number> = {};
  const completedMap: Record<string, number> = {};
  (allLessons ?? []).forEach((l) => {
    totalMap[l.course_id] = (totalMap[l.course_id] ?? 0) + 1;
    if (completedSet.has(l.id)) {
      completedMap[l.course_id] = (completedMap[l.course_id] ?? 0) + 1;
    }
  });

  // First lesson ids per course for "continue" link
  const { data: firstLessons } = await supabase
    .from('standalone_lessons')
    .select('id, course_id')
    .in('course_id', courseIds.length ? courseIds : ['00000000-0000-0000-0000-000000000000'])
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  const firstLessonMap: Record<string, string> = {};
  (firstLessons ?? []).forEach((l) => {
    if (!firstLessonMap[l.course_id]) firstLessonMap[l.course_id] = l.id;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#18191a', color: '#fff' }}>
      {/* Nav */}
      <header className="border-b px-6 sm:px-12 py-4 flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <Link href="/courses-app" className="flex items-center gap-2">
          <img src="/Aorthar Logo long complete.svg" alt="Aorthar" className="h-9 w-auto" />
        </Link>
        <UserAvatar email={user.email ?? ''} fullName={profile?.full_name} avatarUrl={profile?.avatar_url} />
      </header>

      <div className="max-w-5xl mx-auto px-6 sm:px-12 py-12">
        <h1 className="text-2xl font-bold mb-8">My Courses</h1>

        {(purchases ?? []).length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 mb-4">You haven&apos;t purchased any courses yet.</p>
            <Link href="/courses-app" className="text-sm font-semibold underline" style={{ color: '#a7d252' }}>
              Browse courses →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {(purchases ?? []).map((purchase) => {
              // Supabase returns joins as array — take first element
              const raw = purchase.standalone_courses;
              const course = (Array.isArray(raw) ? raw[0] : raw) as {
                id: string; slug: string; title: string; description: string;
                thumbnail_url: string | null; instructor_name: string;
              } | null;
              if (!course) return null;
              const total = totalMap[course.id] ?? 0;
              const completed = completedMap[course.id] ?? 0;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              const firstLesson = firstLessonMap[course.id];

              return (
                <div
                  key={purchase.course_id}
                  className="flex flex-col sm:flex-row gap-4 rounded-lg border p-5"
                  style={{ backgroundColor: '#1e1f20', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  {/* Thumbnail */}
                  <div className="w-full sm:w-40 aspect-video sm:aspect-auto sm:h-24 rounded overflow-hidden shrink-0">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#08694a' }}>
                        <span className="text-xs text-white/40">No preview</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-2 flex-1">
                    <h2 className="font-semibold text-white">{course.title}</h2>
                    <p className="text-xs text-white/40">{course.instructor_name}</p>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: '#a7d252' }}
                        />
                      </div>
                      <span className="text-xs text-white/40 shrink-0">{completed}/{total} lessons</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0">
                    {firstLesson && (
                      <Link
                        href={`/courses-app/learn/${course.slug}/${firstLesson}`}
                        className="text-sm font-semibold px-4 py-2 text-white whitespace-nowrap hover:opacity-90"
                        style={{ backgroundColor: '#08694a' }}
                      >
                        {pct > 0 ? 'Continue →' : 'Start →'}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
