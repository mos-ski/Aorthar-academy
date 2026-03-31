'use client';

import { useState } from 'react';
import Link from 'next/link';
import YouTubePlayer from '@/components/standalone/YouTubePlayer';

type Lesson = { id: string; title: string; sort_order: number; youtube_url: string };

interface Props {
  course: {
    id: string;
    slug: string;
    title: string;
    description: string;
    long_description: string;
    price_ngn: number;
    instructor_name: string;
    instructor_avatar_url: string | null;
    thumbnail_url: string | null;
  };
  lessons: Lesson[];
  firstLesson: Lesson | null;
  hasPurchased: boolean;
  isLoggedIn: boolean;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

// Lessons completed before the active one count as done
function getCompletedIds(lessons: Lesson[], activeId: string | undefined): Set<string> {
  const set = new Set<string>();
  for (const l of lessons) {
    if (l.id === activeId) break;
    set.add(l.id);
  }
  return set;
}

export default function CourseWatch({ course, lessons, firstLesson, hasPurchased, isLoggedIn }: Props) {
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(firstLesson);

  const videoId = activeLesson ? extractYouTubeId(activeLesson.youtube_url) : null;
  const previewSeconds = !hasPurchased && videoId ? 60 : undefined;

  const activeLessonIdx = lessons.findIndex(l => l.id === activeLesson?.id);
  const nextLesson = lessons[activeLessonIdx + 1] ?? null;
  const completedIds = getCompletedIds(lessons, activeLesson?.id);

  function selectLesson(lesson: Lesson, unlocked: boolean) {
    if (!unlocked) return;
    setActiveLesson(lesson);
    setPaywallVisible(false);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f8f8', color: '#1a1a1a' }}>

      {/* Top nav */}
      <header className="h-13 px-6 sm:px-10 flex items-center justify-between border-b bg-white shrink-0 z-20" style={{ borderColor: '#e8e8e8' }}>
        <Link href="/courses-app" className="flex items-center gap-2">
          {/* Use dark logo on light bg */}
          <span className="font-bold text-lg tracking-tight" style={{ color: '#08694a' }}>Aorthar</span>
        </Link>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link href="/courses-app/learn" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#08694a' }}>My Courses</Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">Sign in</Link>
              <Link
                href={`/register?next=/courses-app/checkout/${course.slug}`}
                className="text-sm font-semibold px-4 py-2 text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#08694a' }}
              >
                Enroll — ₦{course.price_ngn.toLocaleString()}
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 gap-8 px-6 sm:px-10 py-8 max-w-[1280px] mx-auto w-full">

        {/* Left: Course Menu */}
        <div className="w-[340px] shrink-0 flex flex-col gap-3 hidden md:flex">
          <h2 className="text-base font-semibold text-gray-800">Course Menu</h2>

          <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: '#e4e4e4' }}>
            {lessons.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">Lessons coming soon</div>
            ) : (
              <ul>
                {lessons.map((lesson, i) => {
                  const isActive = activeLesson?.id === lesson.id;
                  const isDone = completedIds.has(lesson.id);
                  const isFirst = i === 0;
                  const isUnlocked = hasPurchased || isFirst;

                  return (
                    <li key={lesson.id} className="border-b last:border-b-0" style={{ borderColor: '#f0f0f0' }}>
                      <button
                        onClick={() => selectLesson(lesson, isUnlocked)}
                        disabled={!isUnlocked}
                        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors"
                        style={{
                          cursor: isUnlocked ? 'pointer' : 'default',
                          backgroundColor: isActive ? 'rgba(8,105,74,0.04)' : 'transparent',
                        }}
                      >
                        <span
                          className="text-sm leading-snug"
                          style={{
                            color: isDone
                              ? '#b0b0b0'
                              : isActive
                              ? '#08694a'
                              : isUnlocked
                              ? '#1a1a1a'
                              : '#c0c0c0',
                            fontWeight: isActive ? 500 : 400,
                          }}
                        >
                          {i + 1} {lesson.title}
                        </span>

                        {isDone ? (
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0 ml-3">
                            <path d="M3 7.5L6.5 11L12 4" stroke="#b0b0b0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : isActive ? (
                          <span className="text-xs font-semibold shrink-0 ml-3" style={{ color: '#08694a' }}>
                            {!hasPurchased ? '1:00' : ''}
                          </span>
                        ) : isUnlocked ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 ml-3" stroke="#c8c8c8" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 8l6 4-6 4V8z" />
                          </svg>
                        ) : (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0 ml-3" stroke="#d0d0d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Buy CTA below menu if not purchased */}
          {!hasPurchased && (
            <div className="rounded-xl border bg-white p-5 flex flex-col gap-3" style={{ borderColor: '#e4e4e4' }}>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Lifetime access · {lessons.length} lessons</p>
                <p className="text-2xl font-bold" style={{ color: '#08694a' }}>₦{course.price_ngn.toLocaleString()}</p>
              </div>
              {isLoggedIn ? (
                <form action="/api/standalone/checkout" method="POST">
                  <input type="hidden" name="slug" value={course.slug} />
                  <button
                    type="submit"
                    className="w-full py-2.5 font-bold text-white text-sm transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#08694a' }}
                  >
                    Buy this course →
                  </button>
                </form>
              ) : (
                <>
                  <Link
                    href={`/register?next=/courses-app/checkout/${course.slug}`}
                    className="block w-full py-2.5 font-bold text-white text-sm text-center transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#08694a' }}
                  >
                    Sign up & enroll →
                  </Link>
                  <Link
                    href={`/login?next=/courses-app/checkout/${course.slug}`}
                    className="block text-xs text-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Already have an account? Sign in
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Video + title */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <h1 className="text-base font-semibold text-gray-800">
            {activeLesson?.title ?? course.title}
          </h1>

          {/* Video player */}
          <div className="relative rounded-xl overflow-hidden bg-black w-full">
            {videoId ? (
              <>
                <YouTubePlayer
                  videoId={videoId}
                  previewSeconds={previewSeconds}
                  onPreviewExpired={() => setPaywallVisible(true)}
                  nextLesson={hasPurchased && nextLesson ? {
                    title: nextLesson.title,
                    href: `/courses-app/learn/${course.slug}/${nextLesson.id}`,
                  } : undefined}
                  className="w-full"
                />

                {/* Paywall overlay */}
                {paywallVisible && (
                  <div
                    className="absolute inset-0 z-20 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}
                  >
                    <div className="text-center max-w-xs px-6">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                      >
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <p className="text-white font-bold text-lg mb-1">Preview ended</p>
                      <p className="text-white/60 text-sm mb-5 leading-relaxed">
                        Get lifetime access to all {lessons.length} lessons.
                      </p>
                      <div className="flex flex-col gap-2.5">
                        {isLoggedIn ? (
                          <form action="/api/standalone/checkout" method="POST">
                            <input type="hidden" name="slug" value={course.slug} />
                            <button
                              type="submit"
                              className="w-full py-2.5 px-6 font-bold text-white text-sm transition-opacity hover:opacity-90"
                              style={{ backgroundColor: '#08694a' }}
                            >
                              Buy now — ₦{course.price_ngn.toLocaleString()}
                            </button>
                          </form>
                        ) : (
                          <>
                            <Link
                              href={`/register?next=/courses-app/checkout/${course.slug}`}
                              className="block w-full py-2.5 font-bold text-white text-sm text-center hover:opacity-90"
                              style={{ backgroundColor: '#08694a' }}
                            >
                              Sign up & buy — ₦{course.price_ngn.toLocaleString()}
                            </Link>
                            <Link
                              href={`/login?next=/courses-app/checkout/${course.slug}`}
                              className="block text-sm text-white/40 hover:text-white/70 text-center transition-colors"
                            >
                              Already have an account?
                            </Link>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => setPaywallVisible(false)}
                        className="mt-3 text-xs text-white/25 hover:text-white/50 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center gap-3" style={{ backgroundColor: '#1a1a2e' }}>
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover opacity-30 absolute inset-0" />
                ) : null}
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.2)" strokeWidth="1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
                <p className="text-sm text-white/30 relative">Lessons coming soon</p>
              </div>
            )}
          </div>

          {/* Free preview notice */}
          {!hasPurchased && videoId && !paywallVisible && (
            <p className="text-xs text-gray-400">
              Free 1-minute preview.{' '}
              {isLoggedIn ? (
                <form action="/api/standalone/checkout" method="POST" className="inline">
                  <input type="hidden" name="slug" value={course.slug} />
                  <button type="submit" className="font-medium underline hover:opacity-70 transition-opacity" style={{ color: '#08694a' }}>
                    Buy full course →
                  </button>
                </form>
              ) : (
                <Link href={`/register?next=/courses-app/checkout/${course.slug}`} className="font-medium underline" style={{ color: '#08694a' }}>
                  Sign up to get full access →
                </Link>
              )}
            </p>
          )}

          {/* About section (mobile only shows description) */}
          <div className="pt-2 border-t" style={{ borderColor: '#ebebeb' }}>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">About this course</h3>
            <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">
              {course.long_description || course.description}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile lesson list (shown below video on small screens) */}
      <div className="md:hidden px-5 pb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Course Menu</h2>
        <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: '#e4e4e4' }}>
          {lessons.map((lesson, i) => {
            const isActive = activeLesson?.id === lesson.id;
            const isDone = completedIds.has(lesson.id);
            const isFirst = i === 0;
            const isUnlocked = hasPurchased || isFirst;
            return (
              <button
                key={lesson.id}
                onClick={() => selectLesson(lesson, isUnlocked)}
                disabled={!isUnlocked}
                className="w-full flex items-center justify-between px-5 py-3.5 border-b last:border-b-0 text-left"
                style={{ borderColor: '#f0f0f0', backgroundColor: isActive ? 'rgba(8,105,74,0.04)' : 'transparent' }}
              >
                <span className="text-sm" style={{ color: isDone ? '#b0b0b0' : isActive ? '#08694a' : isUnlocked ? '#1a1a1a' : '#c0c0c0', fontWeight: isActive ? 500 : 400 }}>
                  {i + 1} {lesson.title}
                </span>
                {isDone ? (
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0 ml-3">
                    <path d="M3 7.5L6.5 11L12 4" stroke="#b0b0b0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : !isUnlocked ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0 ml-3" stroke="#d0d0d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
