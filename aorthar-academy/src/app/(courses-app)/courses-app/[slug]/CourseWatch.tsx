'use client';

import { useState } from 'react';
import Link from 'next/link';
import YouTubePlayer from '@/components/standalone/YouTubePlayer';

type Lesson = { id: string; title: string; sort_order: number };

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
  firstLesson: { id: string; title: string; youtube_url: string } | null;
  hasPurchased: boolean;
  isLoggedIn: boolean;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function CourseWatch({ course, lessons, firstLesson, hasPurchased, isLoggedIn }: Props) {
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [activeLesson, setActiveLesson] = useState(firstLesson);

  const videoId = activeLesson ? extractYouTubeId(activeLesson.youtube_url) : null;
  const previewSeconds = (!hasPurchased && videoId) ? 60 : undefined;

  const nextLessonIndex = lessons.findIndex(l => l.id === activeLesson?.id) + 1;
  const nextLesson = lessons[nextLessonIndex];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0f1012', color: '#fff' }}>
      {/* Top nav */}
      <header className="h-12 px-5 sm:px-8 flex items-center justify-between border-b shrink-0 z-20" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#0f1012' }}>
        <Link href="/courses-app" className="flex items-center gap-2">
          <img src="/Aorthar Logo long complete.svg" alt="Aorthar" className="h-7 w-auto" />
        </Link>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link href="/courses-app/learn" className="text-xs text-white/50 hover:text-white transition-colors">My Courses</Link>
          ) : (
            <Link href="/login" className="text-xs text-white/50 hover:text-white transition-colors">Sign in</Link>
          )}
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: video + info */}
        <div className="flex-1 flex flex-col overflow-y-auto">

          {/* Video area */}
          <div className="relative w-full bg-black" style={{ maxHeight: '60vh' }}>
            {videoId ? (
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
            ) : (
              <div className="aspect-video flex items-center justify-center" style={{ backgroundColor: '#111' }}>
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover opacity-40" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-white/30">
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                    <p className="text-sm">Lessons coming soon</p>
                  </div>
                )}
              </div>
            )}

            {/* Paywall overlay */}
            {paywallVisible && (
              <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ backgroundColor: 'rgba(10,11,12,0.93)', backdropFilter: 'blur(6px)' }}>
                <div className="text-center max-w-sm px-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: 'rgba(167,210,82,0.12)', border: '1px solid rgba(167,210,82,0.25)' }}>
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#a7d252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <p className="text-white font-bold text-xl mb-2">Your free preview has ended</p>
                  <p className="text-white/50 text-sm mb-6 leading-relaxed">
                    Get full lifetime access to all {lessons.length} lessons for a one-time payment.
                  </p>
                  <div className="flex flex-col gap-3">
                    {isLoggedIn ? (
                      <form action="/api/standalone/checkout" method="POST">
                        <input type="hidden" name="slug" value={course.slug} />
                        <button
                          type="submit"
                          className="w-full py-3 px-6 font-bold text-white text-sm hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: '#08694a' }}
                        >
                          Buy now — ₦{course.price_ngn.toLocaleString()} →
                        </button>
                      </form>
                    ) : (
                      <>
                        <Link
                          href={`/register?next=/courses-app/checkout/${course.slug}`}
                          className="block w-full py-3 px-6 font-bold text-white text-sm text-center hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: '#08694a' }}
                        >
                          Sign up & buy — ₦{course.price_ngn.toLocaleString()} →
                        </Link>
                        <Link
                          href={`/login?next=/courses-app/checkout/${course.slug}`}
                          className="block text-sm text-white/40 hover:text-white transition-colors text-center"
                        >
                          Already have an account? Sign in
                        </Link>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => setPaywallVisible(false)}
                    className="mt-4 text-xs text-white/20 hover:text-white/40 transition-colors"
                  >
                    Close preview
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Lesson info */}
          <div className="px-5 sm:px-8 py-5 flex flex-col gap-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {firstLesson && activeLesson && (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(167,210,82,0.8)' }}>
                <span className="uppercase tracking-wider font-semibold">Lesson {lessons.findIndex(l => l.id === activeLesson.id) + 1}</span>
                {!hasPurchased && (
                  <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: 'rgba(167,210,82,0.1)', color: '#a7d252' }}>
                    Free preview · 1 min
                  </span>
                )}
              </div>
            )}
            <h1 className="text-lg sm:text-xl font-bold text-white">{activeLesson?.title ?? course.title}</h1>
            <div className="flex items-center gap-3">
              {course.instructor_avatar_url ? (
                <img src={course.instructor_avatar_url} alt={course.instructor_name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: '#a7d252', color: '#18191a' }}>
                  {course.instructor_name[0]}
                </div>
              )}
              <span className="text-sm text-white/50">{course.instructor_name}</span>
            </div>
          </div>

          {/* Course description */}
          <div className="px-5 sm:px-8 py-6">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">About this course</h2>
            <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{course.long_description || course.description}</p>
          </div>
        </div>

        {/* Right: lesson sidebar */}
        <div className="w-72 xl:w-80 shrink-0 border-l flex flex-col hidden md:flex" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#0d0e10' }}>
          {/* Sidebar header */}
          <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Course content</span>
              <span className="text-xs text-white/30">{lessons.length} lessons</span>
            </div>
            {hasPurchased && (
              <div className="mt-2 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <div className="h-1 rounded-full" style={{ width: '0%', backgroundColor: '#a7d252' }} />
              </div>
            )}
          </div>

          {/* Lessons list */}
          <div className="flex-1 overflow-y-auto">
            {lessons.length === 0 ? (
              <div className="p-5 text-center text-white/20 text-sm">Lessons coming soon</div>
            ) : (
              <ul>
                {lessons.map((lesson, i) => {
                  const isActive = activeLesson?.id === lesson.id;
                  const isFirst = i === 0;
                  const isUnlocked = hasPurchased || isFirst;
                  return (
                    <li key={lesson.id}>
                      <button
                        className="w-full text-left px-4 py-3.5 flex items-center gap-3 border-b transition-colors"
                        style={{
                          borderColor: 'rgba(255,255,255,0.05)',
                          backgroundColor: isActive ? 'rgba(167,210,82,0.08)' : 'transparent',
                          cursor: isUnlocked ? 'pointer' : 'default',
                        }}
                        onClick={() => {
                          if (!isUnlocked) return;
                          setActiveLesson({ id: lesson.id, title: lesson.title, youtube_url: '' });
                          setPaywallVisible(false);
                        }}
                        disabled={!isUnlocked}
                      >
                        <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                          {isUnlocked ? (
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={isActive ? '#a7d252' : 'rgba(255,255,255,0.3)'} strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 8l6 4-6 4V8z" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: isActive ? '#a7d252' : isUnlocked ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.25)' }}>
                            {lesson.title}
                          </p>
                          {isFirst && !hasPurchased && (
                            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(167,210,82,0.5)' }}>Free preview</p>
                          )}
                        </div>
                        <span className="text-[10px] text-white/20 shrink-0">{i + 1}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Buy CTA (sidebar) — shown if not purchased */}
          {!hasPurchased && (
            <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-white/40 mb-1">Lifetime access</p>
              <p className="text-lg font-bold mb-3" style={{ color: '#a7d252' }}>₦{course.price_ngn.toLocaleString()}</p>
              {isLoggedIn ? (
                <form action="/api/standalone/checkout" method="POST">
                  <input type="hidden" name="slug" value={course.slug} />
                  <button
                    type="submit"
                    className="w-full py-2.5 font-bold text-white text-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#08694a' }}
                  >
                    Buy this course →
                  </button>
                </form>
              ) : (
                <Link
                  href={`/register?next=/courses-app/checkout/${course.slug}`}
                  className="block w-full py-2.5 font-bold text-white text-sm text-center hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#08694a' }}
                >
                  Sign up to buy →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
