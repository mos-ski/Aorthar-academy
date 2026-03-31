import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

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
    .select('id, title, sort_order')
    .eq('course_id', course.id)
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  // Check if user already purchased
  const { data: { user } } = await supabase.auth.getUser();
  let hasPurchased = false;
  if (user) {
    const { data: purchase } = await supabase
      .from('standalone_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .maybeSingle();
    hasPurchased = Boolean(purchase);
  }

  const firstLessonId = (lessons ?? [])[0]?.id;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#18191a', color: '#fff' }}>
      {/* Nav */}
      <header className="border-b px-6 sm:px-12 py-4 flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <Link href="/courses-app" className="flex items-center gap-2">
          <img src="/Aorthar Logo long complete.svg" alt="Aorthar" className="h-9 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/courses-app/learn" className="text-sm font-medium text-white/60 hover:text-white transition-colors">My Courses</Link>
          ) : (
            <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Sign in</Link>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 sm:px-12 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Info */}
        <div className="flex flex-col gap-6">
          {/* Thumbnail */}
          <div className="aspect-video rounded-lg overflow-hidden bg-[#111]">
            {course.thumbnail_url ? (
              <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#08694a' }}>
                <span className="text-white/40">No preview</span>
              </div>
            )}
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-3">
            {course.instructor_avatar_url ? (
              <img src={course.instructor_avatar_url} alt={course.instructor_name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: '#a7d252', color: '#18191a' }}>
                {course.instructor_name[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white">{course.instructor_name}</p>
              <p className="text-xs text-white/40">Instructor</p>
            </div>
          </div>

          {/* Description */}
          {course.long_description && (
            <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
              {course.long_description}
            </div>
          )}
        </div>

        {/* Right: Purchase box + Outline */}
        <div className="flex flex-col gap-6">
          {/* Purchase card */}
          <div className="rounded-lg p-6 border flex flex-col gap-5" style={{ backgroundColor: '#1e1f20', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{course.title}</h1>
              <p className="text-white/60 text-sm">{course.description}</p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold" style={{ color: '#a7d252' }}>
                ₦{course.price_ngn.toLocaleString()}
              </span>
              <span className="text-white/40 text-sm">one-time</span>
            </div>

            {hasPurchased ? (
              firstLessonId ? (
                <Link
                  href={`/courses-app/learn/${slug}/${firstLessonId}`}
                  className="flex items-center justify-center gap-2 py-3 px-6 font-bold text-white text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#08694a' }}
                >
                  Continue Learning →
                </Link>
              ) : (
                <p className="text-sm text-white/40 text-center">No lessons available yet.</p>
              )
            ) : (
              <form action={`/api/standalone/checkout`} method="POST">
                <input type="hidden" name="slug" value={slug} />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 font-bold text-white text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#08694a' }}
                >
                  Buy for ₦{course.price_ngn.toLocaleString()} →
                </button>
              </form>
            )}

            <p className="text-xs text-white/30 text-center">Lifetime access · All future updates included</p>
          </div>

          {/* Lesson outline */}
          {(lessons ?? []).length > 0 && (
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#1e1f20' }}>
                <h2 className="text-sm font-semibold text-white/80">
                  Course Outline · {(lessons ?? []).length} lessons
                </h2>
              </div>
              <ul className="divide-y divide-white/5">
                {(lessons ?? []).map((lesson, i) => (
                  <li key={lesson.id} className="flex items-center gap-3 px-5 py-3" style={{ backgroundColor: '#18191a' }}>
                    <span className="text-xs text-white/30 w-5 shrink-0">{i + 1}</span>
                    <svg className="w-4 h-4 shrink-0 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-white/70">{lesson.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
