import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Courses — Aorthar' };

export default async function CoursesListingPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from('standalone_courses')
    .select('id, slug, title, description, thumbnail_url, price_ngn, instructor_name, instructor_avatar_url')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  // Count lessons per course
  const courseIds = (courses ?? []).map((c) => c.id);
  const { data: lessonCounts } = await supabase
    .from('standalone_lessons')
    .select('course_id')
    .in('course_id', courseIds.length ? courseIds : ['00000000-0000-0000-0000-000000000000'])
    .eq('is_published', true);

  const countMap: Record<string, number> = {};
  (lessonCounts ?? []).forEach((l) => {
    countMap[l.course_id] = (countMap[l.course_id] ?? 0) + 1;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#18191a', color: '#fff' }}>
      {/* Nav */}
      <header className="border-b px-6 sm:px-12 py-4 flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <Link href="/" className="flex items-center gap-2">
          <img src="/Aorthar Logo long complete.svg" alt="Aorthar" className="h-9 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Sign in</Link>
          <Link href="/login" className="text-sm font-semibold px-4 py-2 text-white transition-colors hover:opacity-90" style={{ backgroundColor: '#08694a' }}>
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 sm:px-12 py-16 sm:py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: '"Impact", sans-serif', fontWeight: 400, letterSpacing: '-0.03em' }}>
          LEARN PRODUCT AT YOUR OWN PACE
        </h1>
        <p className="text-lg text-white/60 max-w-xl mx-auto">
          Pre-recorded courses in Product Management, Design, QA, and Scrum. Buy once, access forever.
        </p>
      </section>

      {/* Course Grid */}
      <section className="px-6 sm:px-12 pb-24 max-w-7xl mx-auto">
        {(courses ?? []).length === 0 ? (
          <p className="text-center text-white/40 py-20">No courses available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(courses ?? []).map((course) => (
              <Link
                key={course.id}
                href={`/courses-app/${course.slug}`}
                className="group flex flex-col rounded-lg overflow-hidden border transition-all hover:border-[#a7d252]/60"
                style={{ backgroundColor: '#1e1f20', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                {/* Thumbnail */}
                <div className="aspect-video overflow-hidden bg-[#111] relative">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#08694a' }}>
                      <span className="text-white/40 text-sm">No preview</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-3 p-5 flex-1">
                  <h2 className="text-base font-semibold text-white leading-snug">{course.title}</h2>
                  <p className="text-sm text-white/50 line-clamp-2 flex-1">{course.description}</p>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2">
                      {course.instructor_avatar_url ? (
                        <img src={course.instructor_avatar_url} alt={course.instructor_name} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#a7d252', color: '#18191a' }}>
                          {course.instructor_name[0]}
                        </div>
                      )}
                      <span className="text-xs text-white/50">{course.instructor_name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/40">{countMap[course.id] ?? 0} lessons</p>
                      <p className="text-sm font-bold" style={{ color: '#a7d252' }}>
                        ₦{course.price_ngn.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
