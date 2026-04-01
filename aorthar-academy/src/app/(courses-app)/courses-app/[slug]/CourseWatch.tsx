'use client';

import { useState } from 'react';
import Link from 'next/link';
import YouTubePlayer from '@/components/standalone/YouTubePlayer';
import DrivePlayer from '@/components/standalone/DrivePlayer';
import BuyButton from '@/components/standalone/BuyButton';
import { createClient } from '@/lib/supabase/client';

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

function extractDriveId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

type VideoSource =
  | { type: 'youtube'; id: string }
  | { type: 'drive'; id: string }
  | null;

function detectVideo(url: string): VideoSource {
  if (!url) return null;
  const ytId = extractYouTubeId(url);
  if (ytId) return { type: 'youtube', id: ytId };
  const driveId = extractDriveId(url);
  if (driveId) return { type: 'drive', id: driveId };
  return null;
}

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

  async function handleLogout() {
    await createClient().auth.signOut();
    window.location.href = '/courses-app';
  }

  const videoSource = activeLesson ? detectVideo(activeLesson.youtube_url) : null;
  const previewSeconds = !hasPurchased && videoSource ? 60 : undefined;

  const activeLessonIdx = lessons.findIndex(l => l.id === activeLesson?.id);
  const nextLesson = lessons[activeLessonIdx + 1] ?? null;
  const completedIds = getCompletedIds(lessons, activeLesson?.id);

  function selectLesson(lesson: Lesson, unlocked: boolean) {
    if (!unlocked) return;
    setActiveLesson(lesson);
    setPaywallVisible(false);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0f1011', color: '#fff' }}>

      {/* Top nav */}
      <header
        className="h-13 px-6 sm:px-10 flex items-center justify-between border-b shrink-0 z-20"
        style={{ borderColor: 'rgba(255,255,255,0.07)', backgroundColor: '#0f1011' }}
      >
        <Link href="/courses-app" className="flex items-center gap-2">
          <img src="/Aorthar Logo long complete.svg" alt="Aorthar" className="h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link
                href="/courses-app/learn"
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: '#a7d252' }}
              >
                My Courses
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-white/50 hover:text-white transition-colors">Sign in</Link>
              <Link
                href={`/register?next=/courses-app/checkout/${course.slug}`}
                className="text-sm font-semibold px-4 py-2 text-black transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#a7d252' }}
              >
                Enroll — ₦{course.price_ngn.toLocaleString()}
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 gap-6 px-6 sm:px-10 py-7 max-w-[1280px] mx-auto w-full">

        {/* Left: Course Menu */}
        <div className="w-[320px] shrink-0 flex flex-col gap-3 hidden md:flex">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">Course Menu</h2>

          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#18191a' }}
          >
            {lessons.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-white/30">Lessons coming soon</div>
            ) : (
              <ul>
                {lessons.map((lesson, i) => {
                  const isActive = activeLesson?.id === lesson.id;
                  const isDone = completedIds.has(lesson.id);
                  const isFirst = i === 0;
                  const isUnlocked = hasPurchased || isFirst;

                  return (
                    <li key={lesson.id} className="border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <button
                        onClick={() => selectLesson(lesson, isUnlocked)}
                        disabled={!isUnlocked}
                        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors"
                        style={{
                          cursor: isUnlocked ? 'pointer' : 'default',
                          backgroundColor: isActive ? 'rgba(167,210,82,0.07)' : 'transparent',
                        }}
                      >
                        <span
                          className="text-sm leading-snug"
                          style={{
                            color: isDone
                              ? 'rgba(255,255,255,0.25)'
                              : isActive
                              ? '#a7d252'
                              : isUnlocked
                              ? 'rgba(255,255,255,0.85)'
                              : 'rgba(255,255,255,0.2)',
                            fontWeight: isActive ? 500 : 400,
                          }}
                        >
                          {i + 1}. {lesson.title}
                        </span>

                        {isDone ? (
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0 ml-3">
                            <path d="M3 7.5L6.5 11L12 4" stroke="rgba(255,255,255,0.25)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : isActive ? (
                          <span className="text-xs font-semibold shrink-0 ml-3" style={{ color: '#a7d252' }}>
                            {!hasPurchased ? '1:00' : '▶'}
                          </span>
                        ) : isUnlocked ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 ml-3" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 8l6 4-6 4V8z" />
                          </svg>
                        ) : (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0 ml-3" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <div
              className="rounded-xl border p-5 flex flex-col gap-3"
              style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#18191a' }}
            >
              <div>
                <p className="text-xs text-white/40 mb-0.5">Lifetime access · {lessons.length} lessons</p>
                <p className="text-2xl font-bold" style={{ color: '#a7d252' }}>₦{course.price_ngn.toLocaleString()}</p>
              </div>
              {isLoggedIn ? (
                <BuyButton
                  slug={course.slug}
                  label="Buy this course →"
                  className="w-full py-2.5 font-bold text-black text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#a7d252' }}
                />
              ) : (
                <>
                  <Link
                    href={`/register?next=/courses-app/checkout/${course.slug}`}
                    className="block w-full py-2.5 font-bold text-black text-sm text-center transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#a7d252' }}
                  >
                    Sign up & enroll →
                  </Link>
                  <Link
                    href={`/login?next=/courses-app/checkout/${course.slug}`}
                    className="block text-xs text-center text-white/30 hover:text-white/60 transition-colors"
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
          <h1 className="text-base font-semibold text-white/90">
            {activeLesson?.title ?? course.title}
          </h1>

          {/* Video player */}
          <div className="relative rounded-xl overflow-hidden bg-black w-full">
            {videoSource ? (
              <>
                {videoSource.type === 'youtube' ? (
                  <YouTubePlayer
                    videoId={videoSource.id}
                    previewSeconds={previewSeconds}
                    onPreviewExpired={() => setPaywallVisible(true)}
                    nextLesson={hasPurchased && nextLesson ? {
                      title: nextLesson.title,
                      href: `/courses-app/learn/${course.slug}/${nextLesson.id}`,
                    } : undefined}
                    className="w-full"
                  />
                ) : (
                  <DrivePlayer
                    fileId={videoSource.id}
                    previewSeconds={previewSeconds}
                    onPreviewExpired={() => setPaywallVisible(true)}
                    nextLesson={hasPurchased && nextLesson ? {
                      title: nextLesson.title,
                      href: `/courses-app/learn/${course.slug}/${nextLesson.id}`,
                    } : undefined}
                    className="w-full"
                  />
                )}

                {/* Paywall overlay */}
                {paywallVisible && (
                  <div
                    className="absolute inset-0 z-20 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}
                  >
                    <div className="text-center max-w-xs px-6">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: 'rgba(167,210,82,0.1)', border: '1px solid rgba(167,210,82,0.25)' }}
                      >
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#a7d252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <p className="text-white font-bold text-lg mb-1">Preview ended</p>
                      <p className="text-white/50 text-sm mb-5 leading-relaxed">
                        Get lifetime access to all {lessons.length} lessons.
                      </p>
                      <div className="flex flex-col gap-2.5">
                        {isLoggedIn ? (
                          <BuyButton
                            slug={course.slug}
                            label={`Buy now — ₦${course.price_ngn.toLocaleString()}`}
                            className="w-full py-2.5 px-6 font-bold text-black text-sm transition-opacity hover:opacity-90"
                            style={{ backgroundColor: '#a7d252' }}
                          />
                        ) : (
                          <>
                            <Link
                              href={`/register?next=/courses-app/checkout/${course.slug}`}
                              className="block w-full py-2.5 font-bold text-black text-sm text-center hover:opacity-90"
                              style={{ backgroundColor: '#a7d252' }}
                            >
                              Sign up & buy — ₦{course.price_ngn.toLocaleString()}
                            </Link>
                            <Link
                              href={`/login?next=/courses-app/checkout/${course.slug}`}
                              className="block text-sm text-white/30 hover:text-white/60 text-center transition-colors"
                            >
                              Already have an account?
                            </Link>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => setPaywallVisible(false)}
                        className="mt-3 text-xs text-white/20 hover:text-white/40 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center gap-3 relative" style={{ backgroundColor: '#0d0e10' }}>
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover opacity-20 absolute inset-0" />
                ) : null}
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.1)" strokeWidth="1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
                <p className="text-sm text-white/25 relative">Lessons coming soon</p>
              </div>
            )}
          </div>

          {/* Free preview notice */}
          {!hasPurchased && videoSource && !paywallVisible && (
            <p className="text-xs text-white/35">
              Free 1-minute preview.{' '}
              {isLoggedIn ? (
                <BuyButton
                  slug={course.slug}
                  label="Buy full course →"
                  className="font-medium underline hover:opacity-70 transition-opacity"
                  style={{ color: '#a7d252' }}
                />
              ) : (
                <Link href={`/register?next=/courses-app/checkout/${course.slug}`} className="font-medium underline" style={{ color: '#a7d252' }}>
                  Sign up to get full access →
                </Link>
              )}
            </p>
          )}

          {/* About section */}
          <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">About this course</h3>
            <p className="text-sm text-white/55 leading-relaxed whitespace-pre-wrap">
              {course.long_description || course.description}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile lesson list */}
      <div className="md:hidden px-5 pb-8">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Course Menu</h2>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#18191a' }}>
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
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  backgroundColor: isActive ? 'rgba(167,210,82,0.07)' : 'transparent',
                }}
              >
                <span
                  className="text-sm"
                  style={{
                    color: isDone
                      ? 'rgba(255,255,255,0.25)'
                      : isActive
                      ? '#a7d252'
                      : isUnlocked
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(255,255,255,0.2)',
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {i + 1}. {lesson.title}
                </span>
                {isDone ? (
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0 ml-3">
                    <path d="M3 7.5L6.5 11L12 4" stroke="rgba(255,255,255,0.25)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : !isUnlocked ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0 ml-3" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
