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

  // ── Purchased courses ──
  const { data: purchases } = await supabase
    .from('standalone_purchases')
    .select('course_id, purchased_at, standalone_courses(id, slug, title, description, thumbnail_url, instructor_name)')
    .eq('user_id', user.id)
    .order('purchased_at', { ascending: false });

  const purchasedIds = (purchases ?? []).map((p) => p.course_id);

  // ── All published courses (for browsing) ──
  const { data: allCourses } = await supabase
    .from('standalone_courses')
    .select('id, slug, title, description, thumbnail_url, price_ngn, instructor_name, instructor_avatar_url')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  // ── Lesson counts ──
  const allCourseIds = [...new Set([...purchasedIds, ...(allCourses ?? []).map((c) => c.id)])];
  const { data: lessonCounts } = await supabase
    .from('standalone_lessons')
    .select('id, course_id, title, sort_order, is_published, is_scheduled')
    .in('course_id', allCourseIds.length ? allCourseIds : ['00000000-0000-0000-0000-000000000000'])
    .or('is_published.eq.true,is_scheduled.eq.true')
    .order('sort_order', { ascending: true });

  const publishedLessonCounts = (lessonCounts ?? []).filter((l) => l.is_published);
  const scheduledLessonCounts = (lessonCounts ?? []).filter((l) => l.is_scheduled && !l.is_published);

  const countMap: Record<string, number> = {};
  publishedLessonCounts.forEach((l) => {
    countMap[l.course_id] = (countMap[l.course_id] ?? 0) + 1;
  });

  const scheduledCountMap: Record<string, number> = {};
  const scheduledLessonsMap: Record<string, { id: string; title: string; sortOrder: number }[]> = {};
  scheduledLessonCounts.forEach((l) => {
    scheduledCountMap[l.course_id] = (scheduledCountMap[l.course_id] ?? 0) + 1;
    (scheduledLessonsMap[l.course_id] ??= []).push({ id: l.id, title: l.title, sortOrder: l.sort_order });
  });

  // ── Progress for purchased courses (published lessons only) ──
  const purchasedLessonIds = publishedLessonCounts.filter((l) => purchasedIds.includes(l.course_id)).map((l) => l.id);
  const { data: progress } = await supabase
    .from('standalone_lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id)
    .in('lesson_id', purchasedLessonIds.length ? purchasedLessonIds : ['00000000-0000-0000-0000-000000000000']);

  const completedSet = new Set((progress ?? []).map((p) => p.lesson_id));

  const totalMap: Record<string, number> = {};
  const completedMap: Record<string, number> = {};
  publishedLessonCounts.forEach((l) => {
    totalMap[l.course_id] = (totalMap[l.course_id] ?? 0) + 1;
    if (completedSet.has(l.id)) {
      completedMap[l.course_id] = (completedMap[l.course_id] ?? 0) + 1;
    }
  });

  // ── First lesson ids ──
  const { data: firstLessons } = await supabase
    .from('standalone_lessons')
    .select('id, course_id')
    .in('course_id', allCourseIds.length ? allCourseIds : ['00000000-0000-0000-0000-000000000000'])
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  const firstLessonMap: Record<string, string> = {};
  (firstLessons ?? []).forEach((l) => {
    if (!firstLessonMap[l.course_id]) firstLessonMap[l.course_id] = l.id;
  });

  // ── Separate purchased vs unpurchased ──
  const purchasedCourses = (purchases ?? [])
    .map((p) => {
      const raw = p.standalone_courses;
      return (Array.isArray(raw) ? raw[0] : raw) as {
        id: string; slug: string; title: string; description: string;
        thumbnail_url: string | null; instructor_name: string;
      } | null;
    })
    .filter(Boolean);

  const unpurchasedCourses = (allCourses ?? []).filter((c) => !purchasedIds.includes(c.id));

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#18191a', color: '#fff' }}>
      {/* Nav */}
      <header className="border-b px-6 sm:px-12 py-4 flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <Link href="/courses-app" className="flex items-center gap-2">
          <img src="/Aorthar Logo long complete.svg" alt="Aorthar" className="h-9 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/courses-app" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Browse</Link>
          <UserAvatar email={user.email ?? ''} fullName={profile?.full_name} avatarUrl={profile?.avatar_url} />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 sm:px-12 py-12">
        <h1 className="text-2xl font-bold mb-2">My Courses</h1>
        <p className="text-sm text-white/40 mb-8">Track your progress and discover new courses.</p>

        {/* ── Purchased Courses ── */}
        <h2 className="text-lg font-semibold mb-4 text-white/80">In Progress</h2>
        {purchasedCourses.length === 0 ? (
          <div className="text-center py-12 mb-12 rounded-lg border border-dashed" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-white/40 mb-4">You haven&apos;t purchased any courses yet.</p>
            <Link href="/courses-app" className="text-sm font-semibold underline" style={{ color: '#a7d252' }}>
              Browse courses →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mb-12">
            {purchasedCourses.map((course) => {
              if (!course) return null;
              const total = totalMap[course.id] ?? 0;
              const completed = completedMap[course.id] ?? 0;
              const scheduledLessons = scheduledLessonsMap[course.id] ?? [];
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              const firstLesson = firstLessonMap[course.id];

              return (
                <div
                  key={course.id}
                  className="rounded-lg border overflow-hidden transition-colors hover:border-[#a7d252]/40"
                  style={{ backgroundColor: '#1e1f20', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <Link
                    href={firstLesson ? `/courses-app/learn/${course.slug}/${firstLesson}` : `/courses-app/${course.slug}`}
                    className="flex flex-col sm:flex-row gap-4 p-5"
                  >
                    <div className="w-full sm:w-40 aspect-video sm:aspect-auto sm:h-24 rounded overflow-hidden shrink-0">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#08694a' }}>
                          <span className="text-xs text-white/40">No preview</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <h3 className="font-semibold text-white">{course.title}</h3>
                      <p className="text-xs text-white/40">{course.instructor_name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: '#a7d252' }} />
                        </div>
                        <span className="text-xs text-white/40 shrink-0">{completed}/{total} lessons</span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0 self-center">
                      <span className="text-sm font-semibold px-4 py-2 text-white whitespace-nowrap" style={{ backgroundColor: '#08694a' }}>
                        {pct > 0 ? 'Continue →' : 'Start →'}
                      </span>
                    </div>
                  </Link>

                  {scheduledLessons.length > 0 && (
                    <div className="border-t px-5 py-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-white/30 mb-2">Coming up</p>
                      <ul className="flex flex-col gap-1.5">
                        {scheduledLessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center justify-between gap-3">
                            <span className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
                              {lesson.sortOrder}. {lesson.title}
                            </span>
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                              style={{ backgroundColor: 'rgba(99,130,255,0.15)', color: 'rgba(130,160,255,0.8)' }}
                            >
                              Scheduled
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Browse More Courses ── */}
        {unpurchasedCourses.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white/80">Browse More Courses</h2>
              <Link href="/courses-app" className="text-sm text-white/40 hover:text-white transition-colors">View all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {unpurchasedCourses.slice(0, 6).map((course) => (
                <Link
                  key={course.id}
                  href={`/courses-app/${course.slug}`}
                  className="group flex flex-col rounded-lg overflow-hidden border transition-all hover:border-[#a7d252]/60"
                  style={{ backgroundColor: '#1e1f20', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <div className="aspect-video overflow-hidden bg-[#111] relative">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#08694a' }}>
                        <span className="text-white/40 text-sm">No preview</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 p-4 flex-1">
                    <h3 className="text-sm font-semibold text-white leading-snug">{course.title}</h3>
                    <p className="text-xs text-white/40 line-clamp-2 flex-1">{course.description}</p>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-white/40">{countMap[course.id] ?? 0} lessons</span>
                        {(scheduledCountMap[course.id] ?? 0) > 0 && (
                          <span className="text-[10px]" style={{ color: 'rgba(150,175,255,0.7)' }}>+ {scheduledCountMap[course.id]} coming soon</span>
                        )}
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#a7d252' }}>₦{course.price_ngn.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
