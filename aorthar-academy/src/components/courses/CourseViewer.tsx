'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, CheckCircle2, ChevronDown, ChevronRight, Clock3, Loader2, Play, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Resource = { id: string; type: string; title: string; url: string; sort_order: number };
type Lesson = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  duration_minutes: number;
  resources: Resource[];
};
type Attempt = {
  id: string;
  score: number;
  passed: boolean;
  created_at: string;
  assessment_type: string;
};
type Reaction = 'like' | 'dislike' | null;
type DeepDiveApiRow = { id?: string; title: string; url: string };

interface Props {
  courseId: string;
  lessons: Lesson[];
  completedLessons: string[];
  activeLessonId: string;
  attempts: Attempt[];
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? null;
}

function formatDuration(minutes: number) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}

export default function CourseViewer({
  courseId,
  lessons,
  completedLessons: initialCompleted,
  activeLessonId,
  attempts,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const storageKey = `aorthar:${courseId}:completed_lessons`;
  const [completed, setCompleted] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set(initialCompleted);
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return new Set(initialCompleted);

    try {
      const ids = JSON.parse(raw) as string[];
      return new Set([...initialCompleted, ...ids]);
    } catch {
      return new Set(initialCompleted);
    }
  });

  const [selectedId, setSelectedId] = useState(activeLessonId);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [reaction, setReaction] = useState<Reaction>(null);
  const [reactionLoading, setReactionLoading] = useState(false);
  const [deepDiveLinks, setDeepDiveLinks] = useState<DeepDiveApiRow[]>([]);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);
  const [deepDiveTopic, setDeepDiveTopic] = useState('');

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(Array.from(completed)));
  }, [completed, storageKey]);

  const activeLesson = lessons.find((l) => l.id === selectedId) ?? lessons[0];
  const youtubeResources = (activeLesson?.resources ?? [])
    .filter((r) => r.type === 'youtube')
    .sort((a, b) => a.sort_order - b.sort_order);

  const fallbackVideoUrl = 'https://www.youtube.com/watch?v=M7lc1UVf-VE';
  const trailerUrl = youtubeResources[0]?.url ?? fallbackVideoUrl;
  const sampleUrl = youtubeResources[1]?.url ?? trailerUrl;
  const effectiveVideoUrl = selectedVideoUrl ?? trailerUrl;
  const videoId = extractYouTubeId(effectiveVideoUrl) ?? extractYouTubeId(fallbackVideoUrl);

  const totalMinutes = useMemo(
    () => lessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0),
    [lessons],
  );

  const progressPercent = useMemo(() => {
    if (lessons.length === 0) return 0;
    return Math.round((completed.size / lessons.length) * 100);
  }, [completed.size, lessons.length]);

  const quizUnlocked = progressPercent >= 70;
  const quizAttempts = attempts.filter((a) => a.assessment_type === 'quiz');
  const bestAttempt = attempts.reduce<Attempt | null>(
    (best, a) => (!best || a.score > best.score ? a : best),
    null,
  );

  function selectLesson(id: string) {
    setSelectedId(id);
    setSelectedVideoUrl(null);
    router.replace(`${pathname}?lesson=${id}`, { scroll: false });
  }

  useEffect(() => {
    if (!activeLesson) return;
    let cancelled = false;

    async function loadLessonMeta() {
      try {
        const [reactionRes, deepDiveRes] = await Promise.all([
          fetch(`/api/lessons/reaction?lessonId=${activeLesson.id}`),
          fetch(`/api/lessons/deep-dive?lessonId=${activeLesson.id}`),
        ]);

        if (!cancelled && reactionRes.ok) {
          const json = await reactionRes.json();
          setReaction((json.reaction ?? null) as Reaction);
        }

        if (!cancelled && deepDiveRes.ok) {
          const json = await deepDiveRes.json();
          setDeepDiveLinks((json.links ?? []).map((l: DeepDiveApiRow) => ({ title: l.title, url: l.url, id: l.id })));
        } else if (!cancelled) {
          setDeepDiveLinks([]);
        }
      } catch {
        if (!cancelled) setDeepDiveLinks([]);
      }
    }

    void loadLessonMeta();
    return () => {
      cancelled = true;
    };
  }, [activeLesson]);

  async function markComplete() {
    if (!activeLesson || completed.has(activeLesson.id)) return;

    setCompleted((prev) => new Set([...prev, activeLesson.id]));
    toast.success('Lesson marked as complete');

    const idx = lessons.findIndex((l) => l.id === activeLesson.id);
    const next = lessons[idx + 1];
    if (next) selectLesson(next.id);
  }

  async function startQuiz() {
    if (!quizUnlocked) {
      toast.error('Quiz unlocks at 70% progress');
      return;
    }

    const res = await fetch('/api/quiz/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, assessmentType: 'quiz' }),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? 'Could not start quiz');
      return;
    }

    const data = await res.json();
    const attemptId = data.attemptId ?? data.attempt_id ?? data?.data?.attempt_id;
    if (!attemptId) {
      toast.error('Quiz started but attempt id is missing');
      return;
    }

    router.push(`/courses/${courseId}/quiz/${attemptId}`);
  }

  async function submitReaction(nextReaction: Reaction) {
    if (!activeLesson || reactionLoading) return;

    const previous = reaction;
    setReaction(nextReaction);
    setReactionLoading(true);

    try {
      const res = await fetch('/api/lessons/reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: activeLesson.id, courseId, reaction: nextReaction }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Could not save reaction');
      }
    } catch (err) {
      setReaction(previous);
      toast.error(err instanceof Error ? err.message : 'Could not save reaction');
    } finally {
      setReactionLoading(false);
    }
  }

  async function generateDeepDive() {
    if (!activeLesson || deepDiveLoading) return;

    setDeepDiveLoading(true);

    try {
      const res = await fetch('/api/lessons/deep-dive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          lessonId: activeLesson.id,
          topic: deepDiveTopic || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Could not generate deep-dive links');

      setDeepDiveLinks((json.links ?? []) as DeepDiveApiRow[]);
      toast.success('Deep-dive links generated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not generate deep-dive links');
    } finally {
      setDeepDiveLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#08090a] p-4 text-[#f4f5f6] md:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 border-b border-white/10 pb-4">
          <div className="flex gap-8 text-base" style={{ fontFamily: 'Sora, Helvetica Neue, Arial, sans-serif' }}>
            <button type="button" className="border-b-2 border-white pb-2 text-white">Class Info</button>
            <button type="button" className="pb-2 text-white/55">Related</button>
            <button type="button" className="pb-2 text-white/55">FAQ</button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-6">
          <div className="space-y-5">
            <h2 className="text-4xl font-bold tracking-tight" style={{ fontFamily: 'Sora, Helvetica Neue, Arial, sans-serif' }}>
              About this Class
            </h2>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121417]">
              {videoId ? (
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
                    title={activeLesson?.title ?? 'Lesson video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex h-56 items-center justify-center text-white/60">
                  <Play className="mr-2 h-6 w-6" /> No video available
                </div>
              )}

              <div className="space-y-4 p-4">
                <Progress value={progressPercent} className="h-2 bg-white/10" />

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="bg-[#ef3163] text-white hover:bg-[#d92556]"
                    onClick={() => setSelectedVideoUrl(trailerUrl)}
                  >
                    <Play className="mr-1 h-3.5 w-3.5" /> Play Trailer
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => setSelectedVideoUrl(sampleUrl)}
                  >
                    Play Sample
                  </Button>
                  <a
                    href={effectiveVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10"
                  >
                    Open on YouTube
                  </a>
                </div>

                <p className="text-[17px] leading-8 text-white/78">
                  {activeLesson?.description ?? 'Structured class content with practical walkthroughs and examples tailored to this topic.'}
                </p>

                <div className="space-y-2 text-sm text-white/70">
                  <p>Class Length: <span className="font-semibold text-white">{lessons.length} lessons ({formatDuration(totalMinutes)})</span></p>
                  <p>Current Lesson: <span className="font-semibold text-white">{activeLesson?.title ?? 'N/A'}</span></p>
                  <p>Progress: <span className="font-semibold text-white">{progressPercent}% completed</span></p>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-3">
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => setSelectedVideoUrl(trailerUrl)}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-[#1a1c20] px-4 py-3 text-left text-white hover:bg-[#20232a]"
              >
                <span>Class Trailer</span>
                <Play className="h-4 w-4 text-[#ef3163]" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedVideoUrl(sampleUrl)}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-[#1a1c20] px-4 py-3 text-left text-white hover:bg-[#20232a]"
              >
                <span>Class Sample</span>
                <Play className="h-4 w-4 text-[#ef3163]" />
              </button>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#121417] p-3">
              <p className="mb-2 text-sm font-semibold text-white/90">Lesson Feedback</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => submitReaction(reaction === 'like' ? null : 'like')}
                  disabled={reactionLoading}
                  className={cn(
                    'inline-flex flex-1 items-center justify-center rounded-md border px-3 py-2 text-sm',
                    reaction === 'like'
                      ? 'border-[#a7d252] bg-[#a7d252] text-black'
                      : 'border-white/15 bg-white/5 text-white hover:bg-white/10',
                  )}
                >
                  <ThumbsUp className="mr-1 h-4 w-4" /> Like
                </button>
                <button
                  type="button"
                  onClick={() => submitReaction(reaction === 'dislike' ? null : 'dislike')}
                  disabled={reactionLoading}
                  className={cn(
                    'inline-flex flex-1 items-center justify-center rounded-md border px-3 py-2 text-sm',
                    reaction === 'dislike'
                      ? 'border-[#ef3163] bg-[#ef3163] text-white'
                      : 'border-white/15 bg-white/5 text-white hover:bg-white/10',
                  )}
                >
                  <ThumbsDown className="mr-1 h-4 w-4" /> Dislike
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#121417] p-3">
              <h3 className="mb-2 text-base font-semibold text-white">Browse Lesson Plan</h3>
              <div className="space-y-2">
                {lessons.map((lesson, idx) => {
                  const isActive = lesson.id === selectedId;
                  const isDone = completed.has(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => selectLesson(lesson.id)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition',
                        isActive
                          ? 'border-[#a7d252] bg-[#a7d252]/20'
                          : 'border-white/10 bg-white/5 hover:bg-white/10',
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white">
                          {idx + 1}. {lesson.title}
                        </p>
                        <p className="mt-0.5 text-xs text-white/55">
                          <Clock3 className="mr-1 inline h-3 w-3" /> {lesson.duration_minutes} min
                        </p>
                      </div>
                      <div className="ml-3 shrink-0">
                        {isDone ? <CheckCircle2 className="h-4 w-4 text-[#a7d252]" /> : <ChevronDown className="h-4 w-4 text-white/50" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#121417] p-3">
              <p className="mb-2 text-sm font-semibold text-white">Deep Dive</p>
              <input
                value={deepDiveTopic}
                onChange={(e) => setDeepDiveTopic(e.target.value)}
                placeholder="Type topic for deeper videos"
                className="mb-2 w-full rounded-md border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#a7d252]"
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateDeepDive}
                disabled={deepDiveLoading}
                className="mb-3 w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                {deepDiveLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Deep Dive Videos
              </Button>

              <div className="space-y-2">
                {deepDiveLinks.length > 0 ? deepDiveLinks.map((link, idx) => (
                  <a
                    key={link.id ?? `${link.url}-${idx}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85 hover:bg-white/10"
                  >
                    {link.title}
                  </a>
                )) : (
                  <p className="text-xs text-white/50">No deep dive links generated yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#121417] p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Course Quiz</p>
                <Badge variant={quizUnlocked ? 'default' : 'secondary'}>{quizUnlocked ? 'Unlocked' : 'Locked'}</Badge>
              </div>
              {!quizUnlocked ? (
                <p className="text-xs text-white/55">Quiz unlocks at 70% progress. You are at {progressPercent}%.</p>
              ) : (
                <>
                  {bestAttempt && (
                    <p className="mb-2 text-xs text-white/60">Best score: {bestAttempt.score.toFixed(1)}%</p>
                  )}
                  <Button
                    type="button"
                    onClick={startQuiz}
                    disabled={quizAttempts.length >= 3}
                    className="w-full bg-[#a7d252] text-black hover:bg-[#97c342]"
                  >
                    {bestAttempt ? 'Retake Quiz' : 'Start Quiz'}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                  {quizAttempts.length >= 3 && (
                    <p className="mt-2 text-xs text-white/55">Maximum quiz attempts reached.</p>
                  )}
                </>
              )}
            </div>

            {activeLesson && !completed.has(activeLesson.id) && (
              <Button
                type="button"
                onClick={markComplete}
                className="w-full bg-[#08694a] text-white hover:bg-[#0a7a56]"
              >
                <Check className="mr-1 h-4 w-4" /> Mark Lesson Complete
              </Button>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
