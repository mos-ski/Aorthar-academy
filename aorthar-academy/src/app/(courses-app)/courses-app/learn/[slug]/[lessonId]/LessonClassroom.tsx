'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import YouTubePlayer from '@/components/standalone/YouTubePlayer';

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? null;
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
}

export default function LessonClassroom({ course, lessons, currentLessonId }: Props) {
  const router = useRouter();
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    new Set(lessons.filter((l) => l.completed).map((l) => l.id)),
  );
  const [isPending, startTransition] = useTransition();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentLesson = lessons.find((l) => l.id === currentLessonId) ?? lessons[0];
  const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
  const nextLesson = lessons[currentIndex + 1] ?? null;
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;

  const videoId = currentLesson?.youtubeUrl ? extractYouTubeId(currentLesson.youtubeUrl) : null;

  async function markComplete(lessonId: string) {
    if (completedIds.has(lessonId)) return;
    try {
      await fetch('/api/standalone/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
      });
      setCompletedIds((prev) => new Set([...prev, lessonId]));
    } catch {
      // non-blocking
    }
  }

  function handleVideoEnded() {
    if (currentLesson) markComplete(currentLesson.id);
  }

  function navigateToLesson(lessonId: string) {
    startTransition(() => {
      router.push(`/courses-app/learn/${course.slug}/${lessonId}`);
    });
    setSidebarOpen(false);
  }

  const completedCount = completedIds.size;
  const totalCount = lessons.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#060708', color: '#fff' }}>
      {/* ── Sidebar ── */}
      <aside
        className={`flex-col w-72 shrink-0 border-r overflow-y-auto transition-all duration-200 ${
          sidebarOpen ? 'flex' : 'hidden lg:flex'
        }`}
        style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: '#0d0e0f' }}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Link href="/courses-app/learn" className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xs text-white/40">My Courses</span>
          </Link>
          <h2 className="text-sm font-semibold text-white leading-snug">{course.title}</h2>
          {/* Progress */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <div className="h-1 rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: '#a7d252' }} />
            </div>
            <span className="text-xs text-white/40 shrink-0">{completedCount}/{totalCount}</span>
          </div>
        </div>

        {/* Lesson list */}
        <nav className="flex-1 p-2">
          {lessons.map((lesson) => {
            const isActive = lesson.id === currentLessonId;
            const isDone = completedIds.has(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => navigateToLesson(lesson.id)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded text-left transition-colors mb-0.5 ${
                  isActive
                    ? 'bg-white/10'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Completion indicator */}
                <div
                  className={`mt-0.5 w-4 h-4 rounded-full shrink-0 flex items-center justify-center border ${
                    isDone
                      ? 'border-[#a7d252] bg-[#a7d252]'
                      : isActive
                      ? 'border-white/60'
                      : 'border-white/20'
                  }`}
                >
                  {isDone && (
                    <svg className="w-2.5 h-2.5 text-[#060708]" fill="none" viewBox="0 0 12 12" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-xs leading-snug ${
                      isActive ? 'text-white font-medium' : 'text-white/60'
                    }`}
                  >
                    {lesson.sortOrder}. {lesson.title}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-3 border-b shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              className="lg:hidden p-1 rounded text-white/40 hover:text-white"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle lesson list"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/courses-app">
              <img src="/Aorthar Logo long complete.svg" alt="Aorthar" className="h-7 w-auto" />
            </Link>
          </div>

          {/* Prev / Next navigation */}
          <div className="flex items-center gap-2">
            {prevLesson && (
              <button
                onClick={() => navigateToLesson(prevLesson.id)}
                className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors px-2 py-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </button>
            )}
            {nextLesson && (
              <button
                onClick={() => navigateToLesson(nextLesson.id)}
                className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors px-2 py-1"
              >
                Next
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Video + lesson info */}
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 flex flex-col gap-6">
          {/* Video player */}
          {videoId ? (
            <YouTubePlayer
              videoId={videoId}
              onEnded={handleVideoEnded}
              nextLesson={
                nextLesson
                  ? {
                      title: nextLesson.title,
                      href: `/courses-app/learn/${course.slug}/${nextLesson.id}`,
                    }
                  : undefined
              }
            />
          ) : (
            <div className="aspect-video bg-black/40 rounded flex items-center justify-center">
              <p className="text-white/30 text-sm">No video available for this lesson.</p>
            </div>
          )}

          {/* Lesson title + actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs text-white/40 mb-1">Lesson {currentLesson.sortOrder} of {lessons.length}</p>
              <h1 className="text-xl font-semibold text-white">{currentLesson.title}</h1>
            </div>

            {!completedIds.has(currentLesson.id) ? (
              <button
                onClick={() => markComplete(currentLesson.id)}
                disabled={isPending}
                className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold border transition-colors hover:border-[#a7d252] hover:text-[#a7d252]"
                style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark complete
              </button>
            ) : (
              <div className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold" style={{ color: '#a7d252' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Completed
              </div>
            )}
          </div>

          {/* Next lesson CTA */}
          {nextLesson && (
            <div
              className="flex items-center justify-between px-5 py-4 rounded border"
              style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#1e1f20' }}
            >
              <div>
                <p className="text-xs text-white/40 mb-0.5">Up next</p>
                <p className="text-sm text-white">{nextLesson.title}</p>
              </div>
              <button
                onClick={() => navigateToLesson(nextLesson.id)}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2 text-white hover:opacity-90"
                style={{ backgroundColor: '#08694a' }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
