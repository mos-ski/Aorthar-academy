'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import YouTubePlayer from '@/components/standalone/YouTubePlayer';
import UserAvatar from '@/components/standalone/UserAvatar';

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? null;
}

function extractDriveId(url: string): string | null {
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  const openMatch = url.match(/drive\.google\.com\/open\?id=([A-Za-z0-9_-]+)/);
  return openMatch?.[1] ?? null;
}

interface Lesson {
  id: string;
  title: string;
  sortOrder: number;
  youtubeUrl: string;
  completed: boolean;
}

interface Course {
  id: string;
  slug: string;
  title: string;
}

interface Props {
  course: Course;
  lessons: Lesson[];
  currentLessonId: string;
  userEmail?: string;
  userFullName?: string | null;
  userAvatarUrl?: string | null;
}

export default function LessonClassroom({ course, lessons, currentLessonId, userEmail, userFullName, userAvatarUrl }: Props) {
  const router = useRouter();
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    new Set(lessons.filter((l) => l.completed).map((l) => l.id)),
  );
  const [isPending, startTransition] = useTransition();

  const currentLesson = lessons.find((l) => l.id === currentLessonId) ?? lessons[0];
  const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
  const nextLesson = lessons[currentIndex + 1] ?? null;
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;

  const videoUrl = currentLesson?.youtubeUrl ?? '';
  const youtubeId = videoUrl ? extractYouTubeId(videoUrl) : null;
  const driveId = !youtubeId && videoUrl ? extractDriveId(videoUrl) : null;

  const completedCount = completedIds.size;
  const totalCount = lessons.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  async function markComplete(lessonId: string) {
    if (completedIds.has(lessonId)) return;
    try {
      await fetch('/api/standalone/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
      });
      setCompletedIds((prev) => new Set([...prev, lessonId]));
    } catch { /* non-blocking */ }
  }

  function handleVideoEnded() {
    if (currentLesson) markComplete(currentLesson.id);
  }

  function navigateToLesson(lessonId: string) {
    startTransition(() => {
      router.push(`/courses-app/learn/${course.slug}/${lessonId}`);
    });
  }

  return (
    <div className="min-h-screen md:h-[100dvh] md:overflow-hidden flex flex-col" style={{ backgroundColor: '#0f1011', color: '#fff' }}>

      {/* ── Top nav (matches CourseWatch) ── */}
      <header
        className="h-13 px-6 sm:px-10 flex items-center justify-between border-b shrink-0 z-20"
        style={{ borderColor: 'rgba(255,255,255,0.07)', backgroundColor: '#0f1011' }}
      >
        <Link href="/courses-app" className="flex items-center gap-2">
          <img src="/Aorthar Logo long complete.svg" alt="Aorthar" className="h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/courses-app/learn" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: '#a7d252' }}>
            My Courses
          </Link>
          {userEmail && (
            <UserAvatar email={userEmail} fullName={userFullName} avatarUrl={userAvatarUrl} />
          )}
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 md:min-h-0 md:overflow-hidden gap-6 px-6 sm:px-10 py-7 max-w-[1280px] mx-auto w-full">

        {/* ── Left sidebar (desktop, matches CourseWatch) ── */}
        <div className="w-[320px] shrink-0 flex-col gap-3 hidden md:flex md:min-h-0">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">Course Menu</h2>

          <div
            className="rounded-xl border overflow-hidden flex-1 min-h-0"
            style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#18191a' }}
          >
            <ul className="h-full overflow-y-auto">
              {lessons.map((lesson) => {
                const isActive = lesson.id === currentLessonId;
                const isDone = completedIds.has(lesson.id);

                return (
                  <li key={lesson.id} className="border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <button
                      onClick={() => navigateToLesson(lesson.id)}
                      className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors"
                      style={{ backgroundColor: isActive ? 'rgba(167,210,82,0.07)' : 'transparent' }}
                    >
                      <span
                        className="text-sm leading-snug"
                        style={{
                          color: isDone ? 'rgba(255,255,255,0.25)' : isActive ? '#a7d252' : 'rgba(255,255,255,0.85)',
                          fontWeight: isActive ? 500 : 400,
                        }}
                      >
                        {lesson.sortOrder}. {lesson.title}
                      </span>

                      {isDone ? (
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0 ml-3">
                          <path d="M3 7.5L6.5 11L12 4" stroke="rgba(255,255,255,0.25)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : isActive ? (
                        <span className="text-xs font-semibold shrink-0 ml-3" style={{ color: '#a7d252' }}>▶</span>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 ml-3" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 8l6 4-6 4V8z" />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Progress */}
          <div
            className="rounded-xl border px-5 py-4 flex items-center gap-3"
            style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#18191a' }}
          >
            <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: '#a7d252' }} />
            </div>
            <span className="text-xs text-white/40 shrink-0">{completedCount}/{totalCount} lessons</span>
          </div>
        </div>

        {/* ── Right: video + info ── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0 md:h-full md:overflow-y-auto md:overflow-hidden self-start">

          {/* Lesson title */}
          <h1 className="text-base font-semibold text-white/90">{currentLesson.title}</h1>

          {/* Video player */}
          <div className="relative rounded-xl overflow-hidden bg-black w-full">
            {youtubeId ? (
              <YouTubePlayer
                videoId={youtubeId}
                onEnded={handleVideoEnded}
                nextLesson={nextLesson ? {
                  title: nextLesson.title,
                  href: `/courses-app/learn/${course.slug}/${nextLesson.id}`,
                } : undefined}
                className="w-full"
              />
            ) : driveId ? (
              <div className="aspect-video w-full overflow-hidden bg-black">
                <iframe
                  src={`https://drive.google.com/file/d/${driveId}/preview`}
                  allow="autoplay"
                  allowFullScreen
                  title={currentLesson.title}
                  style={{
                    border: 'none',
                    position: 'absolute',
                    top: '-30px',
                    left: 0,
                    width: '100%',
                    height: 'calc(100% + 30px)',
                  }}
                />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center" style={{ backgroundColor: '#0d0e10' }}>
                <p className="text-sm text-white/25">No video available for this lesson.</p>
              </div>
            )}
          </div>

          {/* Actions row */}
          <div className="flex items-center justify-between gap-3">
            {/* Prev / Next */}
            <div className="flex items-center gap-2">
              {prevLesson && (
                <button
                  onClick={() => navigateToLesson(prevLesson.id)}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors px-3 py-1.5 rounded border"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  ← Prev
                </button>
              )}
              {nextLesson && (
                <button
                  onClick={() => navigateToLesson(nextLesson.id)}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors px-3 py-1.5 rounded border"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  Next →
                </button>
              )}
            </div>

            {/* Mark complete */}
            {!completedIds.has(currentLesson.id) ? (
              <button
                onClick={() => markComplete(currentLesson.id)}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border transition-colors hover:border-[#a7d252] hover:text-[#a7d252]"
                style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark complete
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 text-sm font-semibold" style={{ color: '#a7d252' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Completed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile lesson list (always visible below video) ── */}
      <div className="md:hidden px-6 pb-10">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Course Menu</h2>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#18191a' }}>
          {lessons.map((lesson) => {
            const isActive = lesson.id === currentLessonId;
            const isDone = completedIds.has(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => navigateToLesson(lesson.id)}
                className="w-full flex items-center gap-3 px-5 py-3.5 border-b last:border-b-0 text-left transition-colors"
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  backgroundColor: isActive ? 'rgba(167,210,82,0.07)' : 'transparent',
                }}
              >
                <div
                  className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center border ${
                    isDone ? 'border-[#a7d252] bg-[#a7d252]' : isActive ? 'border-white/60' : 'border-white/15'
                  }`}
                >
                  {isDone && (
                    <svg className="w-3 h-3 text-[#0f1011]" fill="none" viewBox="0 0 12 12" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                  {isActive && !isDone && <div className="w-2 h-2 rounded-full bg-white/80" />}
                </div>
                <span
                  className="flex-1 text-sm leading-snug"
                  style={{
                    color: isDone ? 'rgba(255,255,255,0.25)' : isActive ? '#a7d252' : 'rgba(255,255,255,0.75)',
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {lesson.sortOrder}. {lesson.title}
                </span>
                {isActive && <span className="text-xs shrink-0" style={{ color: '#a7d252' }}>▶</span>}
              </button>
            );
          })}
        </div>

        {/* Mobile progress */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: '#a7d252' }} />
          </div>
          <span className="text-xs text-white/40 shrink-0">{completedCount}/{totalCount}</span>
        </div>
      </div>

    </div>
  );
}
