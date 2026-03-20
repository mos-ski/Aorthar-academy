'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, CheckCircle2, ChevronRight, Clock3, Loader2, MessageSquare, Play, Sparkles, ThumbsDown, ThumbsUp, Users } from 'lucide-react';
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
type Tab = 'info' | 'materials' | 'related' | 'comments';
type WeeklyPlanRow = { week: number; topic: string; coreConcept: string; resources: { title: string; url: string }[] };
type CommentRow = {
  id: string;
  body: string;
  user_id: string;
  parent_id: string | null;
  created_at: string;
  counts: { like: number; dislike: number };
  myReaction: Reaction;
  replies: Array<{
    id: string;
    body: string;
    user_id: string;
    parent_id: string | null;
    created_at: string;
    counts: { like: number; dislike: number };
    myReaction: Reaction;
  }>;
};

interface Props {
  mode?: 'classroom' | 'dashboard';
  courseId: string;
  courseCode: string;
  courseName: string;
  courseDescription: string;
  lessons: Lesson[];
  completedLessons: string[];
  activeLessonId: string;
  attempts: Attempt[];
  enrolledCount: number;
  weeklyPlanRows?: WeeklyPlanRow[];
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
  courseCode,
  courseName,
  courseDescription,
  lessons,
  completedLessons: initialCompleted,
  activeLessonId,
  attempts,
  enrolledCount,
  weeklyPlanRows = [],
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

  const [tab, setTab] = useState<Tab>('info');
  const [selectedId, setSelectedId] = useState(activeLessonId);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [reaction, setReaction] = useState<Reaction>(null);
  const [reactionCounts, setReactionCounts] = useState({ like: 0, dislike: 0 });
  const [reactionLoading, setReactionLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [autoSummarizing, setAutoSummarizing] = useState(false);
  const [summary, setSummary] = useState<{ summary_markdown: string; key_points: string[]; source: string } | null>(null);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState<Array<{ title: string; url: string; thumbnail: string | null }>>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(Array.from(completed)));
  }, [completed, storageKey]);

  const activeLesson = lessons.find((l) => l.id === selectedId) ?? lessons[0];
  const youtubeResources = (activeLesson?.resources ?? [])
    .filter((r) => r.type === 'youtube')
    .sort((a, b) => a.sort_order - b.sort_order);

  const fallbackVideoUrl = 'https://www.youtube.com/watch?v=M7lc1UVf-VE';
  const defaultClassUrl = youtubeResources[0]?.url ?? fallbackVideoUrl;
  const effectiveVideoUrl = selectedVideoUrl ?? defaultClassUrl;
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
  const bestAttempt = quizAttempts.reduce<Attempt | null>(
    (best, a) => (!best || a.score > best.score ? a : best),
    null,
  );

  const derivedPlanRows = weeklyPlanRows.length > 0
    ? weeklyPlanRows
    : lessons.map((lesson, idx) => ({
      week: idx + 1,
      topic: lesson.title,
      coreConcept: lesson.description ?? 'Lesson walkthrough and practical concepts',
      resources: lesson.resources.map((r) => ({ title: r.title, url: r.url })),
    }));
  const materialLinks = Array.from(new Set([
    ...derivedPlanRows.flatMap((row) => row.resources.map((r) => r.url)),
    ...(activeLesson?.resources ?? []).map((r) => r.url),
  ])).map((url) => {
    const match = derivedPlanRows.flatMap((row) => row.resources).find((r) => r.url === url)
      ?? activeLesson?.resources.find((r) => r.url === url);
    return { title: match?.title ?? 'Resource', url };
  }).filter((r) => !/youtu\\.be|youtube\\.com/i.test(r.url));
  const lessonTopic = activeLesson?.title ?? courseName;
  const codePrefix = courseCode.replace(/\d+$/, '').toUpperCase();
  const DEPT_SOURCES: Record<string, Array<{ site: string; label: string; excerpt: string }>> = {
    DES: [
      { site: 'uxdesign.cc', label: 'UX Collective', excerpt: `In-depth design writing on ${lessonTopic} from practitioners.` },
      { site: 'smashingmagazine.com', label: 'Smashing Magazine', excerpt: `Design tutorials and best practices covering ${lessonTopic}.` },
      { site: 'medium.com', label: 'Medium', excerpt: `Community articles from designers working on ${lessonTopic}.` },
      { site: 'figma.com/blog', label: 'Figma Blog', excerpt: `Official Figma insights on design workflows including ${lessonTopic}.` },
    ],
    DEV: [
      { site: 'dev.to', label: 'DEV Community', excerpt: `Developer articles and tutorials on ${lessonTopic}.` },
      { site: 'css-tricks.com', label: 'CSS-Tricks', excerpt: `Frontend-focused guides covering ${lessonTopic} techniques.` },
      { site: 'medium.com', label: 'Medium', excerpt: `Engineering deep-dives on ${lessonTopic} from senior engineers.` },
      { site: 'javascript.info', label: 'javascript.info', excerpt: `Modern JavaScript reference material related to ${lessonTopic}.` },
    ],
    PM: [
      { site: 'medium.com', label: 'Medium', excerpt: `Product thinking articles on ${lessonTopic} from PMs at top companies.` },
      { site: 'lenny.substack.com', label: 'Lenny\'s Newsletter', excerpt: `Practical PM insights on ${lessonTopic} from Lenny Rachitsky.` },
      { site: 'svpg.com', label: 'SVPG', excerpt: `Marty Cagan's resources on product management including ${lessonTopic}.` },
      { site: 'productboard.com/blog', label: 'Productboard Blog', excerpt: `Product strategy writing covering ${lessonTopic}.` },
    ],
    QA: [
      { site: 'dev.to', label: 'DEV Community', excerpt: `Quality engineering articles on ${lessonTopic}.` },
      { site: 'medium.com', label: 'Medium', excerpt: `Testing practices and case studies for ${lessonTopic}.` },
      { site: 'stickyminds.com', label: 'StickyMinds', excerpt: `Software testing resources and techniques for ${lessonTopic}.` },
      { site: 'ministryoftesting.com', label: 'Ministry of Testing', excerpt: `QA community articles on ${lessonTopic}.` },
    ],
    SCR: [
      { site: 'medium.com', label: 'Medium', excerpt: `Agile and Scrum articles covering ${lessonTopic}.` },
      { site: 'scrum.org/resources', label: 'Scrum.org', excerpt: `Official Scrum resources related to ${lessonTopic}.` },
      { site: 'mountaingoatsoftware.com', label: 'Mountain Goat Software', excerpt: `Mike Cohn\'s guides on agile practices for ${lessonTopic}.` },
      { site: 'atlassian.com/agile', label: 'Atlassian Agile', excerpt: `Practical agile guidance on ${lessonTopic}.` },
    ],
  };
  const deptSources = DEPT_SOURCES[codePrefix] ?? [
    { site: 'medium.com', label: 'Medium', excerpt: `In-depth articles on ${lessonTopic} from industry practitioners.` },
    { site: 'dev.to', label: 'DEV Community', excerpt: `Community-written posts on ${lessonTopic}.` },
    { site: 'substack.com', label: 'Substack', excerpt: `Newsletter deep-dives covering ${lessonTopic}.` },
    { site: 'hashnode.com', label: 'Hashnode', excerpt: `Developer and product blogs focused on ${lessonTopic}.` },
  ];
  const articleCards = (materialLinks.length > 0 ? materialLinks.map((item, idx) => ({
    ...item,
    id: `${item.url}-${idx}`,
    excerpt: `Supplementary reading for ${courseCode} — ${lessonTopic}.`,
  })) : deptSources.map((src, idx) => ({
    id: `${courseCode}-${lessonTopic}-${idx}`,
    title: `${lessonTopic} — ${src.label}`,
    url: 'https://www.google.com/search?q=' + encodeURIComponent(lessonTopic + ' site:' + src.site),
    excerpt: src.excerpt,
  })));

  function selectLesson(id: string) {
    setSelectedId(id);
    setSelectedVideoUrl(null);
    const qs = new URLSearchParams(window.location.search);
    qs.set('lesson', id);
    router.replace(`${pathname}?${qs.toString()}`, { scroll: false });
  }

  async function refreshLessonMeta() {
    if (!activeLesson) return;
    try {
      const [reactionRes, summaryRes] = await Promise.all([
        fetch(`/api/lessons/reaction?lessonId=${activeLesson.id}`),
        fetch(`/api/lessons/summary?lessonId=${activeLesson.id}`),
      ]);

      if (reactionRes.ok) {
        const json = await reactionRes.json();
        setReaction((json.reaction ?? null) as Reaction);
        setReactionCounts(json.counts ?? { like: 0, dislike: 0 });
      }

      if (summaryRes.ok) {
        const json = await summaryRes.json();
        setSummary(json.summary ?? null);
        if (!json.summary) {
          void autoGenerateSummary();
        }
      } else {
        setSummary(null);
        void autoGenerateSummary();
      }
    } catch {
      // noop
    }
  }

  useEffect(() => {
    void refreshLessonMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLesson?.id]);

  useEffect(() => {
    if (tab !== 'related' || !activeLesson) return;
    let cancelled = false;
    setRelatedLoading(true);
    fetch(`/api/lessons/related?courseId=${courseId}&lessonId=${activeLesson.id}`)
      .then((r) => r.json().then((j) => ({ ok: r.ok, json: j })))
      .then(({ ok, json }) => {
        if (cancelled) return;
        if (!ok) throw new Error(json.error ?? 'Failed to load related videos');
        setRelatedVideos(json.videos ?? []);
      })
      .catch(() => {
        if (!cancelled) setRelatedVideos([]);
      })
      .finally(() => {
        if (!cancelled) setRelatedLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab, activeLesson, courseId]);

  useEffect(() => {
    if (tab !== 'comments' || !activeLesson) return;
    let cancelled = false;
    setCommentsLoading(true);
    fetch(`/api/lessons/comments?lessonId=${activeLesson.id}`)
      .then((r) => r.json().then((j) => ({ ok: r.ok, json: j })))
      .then(({ ok, json }) => {
        if (cancelled) return;
        if (!ok) throw new Error(json.error ?? 'Failed to load comments');
        setComments(json.comments ?? []);
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      })
      .finally(() => {
        if (!cancelled) setCommentsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab, activeLesson]);

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
      toast.error('Course quiz unlocks at 70% progress');
      return;
    }

    const res = await fetch('/api/quiz/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, assessmentType: 'quiz' }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      toast.error(data.error ?? 'Could not start quiz');
      return;
    }

    const attemptId = data.attemptId ?? data.attempt_id ?? data?.data?.attempt_id;
    if (!attemptId) {
      toast.error('Quiz started but attempt id is missing');
      return;
    }

    router.push(`/classroom/${courseId}/quiz/${attemptId}`);
  }

  async function submitReaction(nextReaction: Reaction) {
    if (!activeLesson || reactionLoading) return;

    const previous = reaction;
    const prevCounts = { ...reactionCounts };

    setReaction(nextReaction);
    setReactionLoading(true);

    try {
      const res = await fetch('/api/lessons/reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: activeLesson.id, courseId, reaction: nextReaction }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Could not save reaction');

      setReaction((json.reaction ?? null) as Reaction);
      setReactionCounts(json.counts ?? { like: 0, dislike: 0 });
    } catch (err) {
      setReaction(previous);
      setReactionCounts(prevCounts);
      toast.error(err instanceof Error ? err.message : 'Could not save reaction');
    } finally {
      setReactionLoading(false);
    }
  }

  async function autoGenerateSummary() {
    if (!activeLesson || autoSummarizing || summaryLoading) return;
    setAutoSummarizing(true);
    try {
      const res = await fetch('/api/lessons/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonId: activeLesson.id }),
      });
      if (res.ok) {
        const json = await res.json();
        setSummary(json.summary ?? null);
      }
    } catch {
      // silent — user can still click the button manually
    } finally {
      setAutoSummarizing(false);
    }
  }

  async function generateSummary() {
    if (!activeLesson || summaryLoading) return;
    setSummaryLoading(true);

    try {
      const res = await fetch('/api/lessons/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonId: activeLesson.id }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Could not summarize lesson');

      setSummary(json.summary ?? null);
      toast.success('Summary generated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Summary failed');
    } finally {
      setSummaryLoading(false);
    }
  }

  async function postComment(parentId?: string) {
    if (!activeLesson) return;
    const text = commentText.trim();
    if (!text) return;

    const res = await fetch('/api/lessons/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: activeLesson.id, courseId, text, parentId }),
    });

    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error ?? 'Could not post comment');
      return;
    }

    setCommentText('');
    setReplyTo(null);
    const refreshed = await fetch(`/api/lessons/comments?lessonId=${activeLesson.id}`);
    const cjson = await refreshed.json();
    setComments(cjson.comments ?? []);
  }

  async function reactComment(commentId: string, next: Reaction) {
    const res = await fetch('/api/lessons/comments/reaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId, reaction: next }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error ?? 'Could not react');
      return;
    }

    if (!activeLesson) return;
    const refreshed = await fetch(`/api/lessons/comments?lessonId=${activeLesson.id}`);
    const cjson = await refreshed.json();
    setComments(cjson.comments ?? []);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#08090a] p-4 text-[#f4f5f6] md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 border-b border-white/10 pb-4">
          <div className="flex gap-6 text-base" style={{ fontFamily: 'Sora, Helvetica Neue, Arial, sans-serif' }}>
            {(['info', 'materials', 'related', 'comments'] as Tab[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={cn('border-b-2 pb-2 capitalize', tab === k ? 'border-white text-white' : 'border-transparent text-white/55')}
              >
                {k === 'info' ? 'Class Info' : k === 'materials' ? 'Materials' : k === 'related' ? 'Related' : 'Classroom'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-6">
          <div className="space-y-5">
            <h2 className="text-4xl font-bold tracking-tight" style={{ fontFamily: 'Sora, Helvetica Neue, Arial, sans-serif' }}>
              {tab === 'info'
                ? 'About this Class'
                : tab === 'materials'
                  ? 'Class Materials'
                  : tab === 'related'
                    ? 'Related Videos'
                    : 'Classroom'}
            </h2>

            {tab === 'info' && (
              <>
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
                        onClick={() => setSelectedVideoUrl(defaultClassUrl)}
                      >
                        <Play className="mr-1 h-3.5 w-3.5" /> Start Class
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
                      {activeLesson?.description ?? courseDescription ?? 'Structured class content with practical walkthroughs.'}
                    </p>

                    <div className="space-y-2 text-sm text-white/70">
                      <p>Class Length: <span className="font-semibold text-white">{lessons.length} lessons ({formatDuration(totalMinutes)})</span></p>
                      <p>Current Lesson: <span className="font-semibold text-white">{activeLesson?.title ?? 'N/A'}</span></p>
                      <p>Progress: <span className="font-semibold text-white">{progressPercent}% completed</span></p>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121417]">
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="text-lg font-semibold">Class Plan</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-white/5 text-left text-white/70">
                        <tr>
                          <th className="px-4 py-3">Week</th>
                          <th className="px-4 py-3">Topic</th>
                          <th className="px-4 py-3">Core Concept</th>
                          <th className="px-4 py-3">Resource Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {derivedPlanRows.map((row) => (
                          <tr key={`${row.week}-${row.topic}`} className="border-t border-white/10 align-top">
                            <td className="px-4 py-3">{row.week}</td>
                            <td className="px-4 py-3">{row.topic}</td>
                            <td className="px-4 py-3 text-white/80">{row.coreConcept}</td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                {row.resources.slice(0, 2).map((r) => (
                                  <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="block text-[#a7d252] hover:underline">
                                    {r.title}
                                  </a>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#121417] p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-lg font-semibold">Course Details / Transcript Material</p>
                    <Button
                      type="button"
                      onClick={generateSummary}
                      disabled={summaryLoading}
                      variant="outline"
                      className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                    >
                      {summaryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Summarize with AI
                    </Button>
                  </div>

                  {summary ? (
                    <div className="space-y-3 text-sm text-white/85">
                      <p className="whitespace-pre-wrap">{summary.summary_markdown}</p>
                      {summary.key_points?.length ? (
                        <ul className="list-disc pl-5 text-white/75">
                          {summary.key_points.map((p) => <li key={p}>{p}</li>)}
                        </ul>
                      ) : null}
                    </div>
                  ) : autoSummarizing ? (
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Generating AI summary for this lesson…
                    </div>
                  ) : (
                    <p className="text-sm text-white/65">No summary yet. Click "Summarize with AI" to generate one.</p>
                  )}
                </div>
              </>
            )}

            {tab === 'related' && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {relatedLoading ? (
                  <p className="text-sm text-white/60">Loading related videos...</p>
                ) : relatedVideos.length > 0 ? relatedVideos.map((video) => (
                  <a key={video.url} href={video.url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-lg border border-white/10 bg-[#121417] hover:bg-[#171b20]">
                    {video.thumbnail ? (
                      <div className="relative h-36 w-full">
                        <Image src={video.thumbnail} alt={video.title} fill className="object-cover" unoptimized />
                      </div>
                    ) : null}
                    <div className="p-3 text-sm text-white/90">{video.title}</div>
                  </a>
                )) : (
                  <p className="text-sm text-white/60">No related videos found for this lesson.</p>
                )}
              </div>
            )}

            {tab === 'materials' && (
              <div className="grid gap-3 rounded-xl border border-white/10 bg-[#121417] p-4 sm:grid-cols-2">
                {articleCards.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                  >
                    <p className="mb-2 inline-flex rounded-full border border-[#a7d252]/40 px-2 py-0.5 text-xs text-[#a7d252]">Article</p>
                    <p className="text-base font-medium text-white">{item.title}</p>
                    <p className="mt-2 text-sm text-white/70">{item.excerpt}</p>
                    <p className="mt-3 text-xs text-[#a7d252]">Read article →</p>
                  </a>
                ))}
              </div>
            )}

            {tab === 'comments' && (
              <div className="space-y-4 rounded-xl border border-white/10 bg-[#121417] p-4">
                <div className="space-y-2">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={replyTo ? 'Write a reply...' : 'Add a comment to this class...'}
                    className="min-h-24 w-full rounded-md border border-white/15 bg-black/20 p-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#a7d252]"
                  />
                  <div className="flex items-center gap-2">
                    <Button onClick={() => postComment(replyTo ?? undefined)}>Post</Button>
                    {replyTo ? (
                      <Button variant="outline" onClick={() => setReplyTo(null)} className="border-white/20 bg-white/5 text-white">Cancel Reply</Button>
                    ) : null}
                  </div>
                </div>

                {commentsLoading ? (
                  <p className="text-sm text-white/60">Loading comments...</p>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-white/60">No comments yet. Start the conversation.</p>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="rounded-md border border-white/10 bg-white/5 p-3">
                        <p className="mb-1 text-xs text-white/60">{comment.user_id.replace('student-', '@')}</p>
                        <p className="text-sm text-white/90">{comment.body}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <button onClick={() => reactComment(comment.id, comment.myReaction === 'like' ? null : 'like')} className="inline-flex items-center gap-1 rounded border border-white/15 px-2 py-1 hover:bg-white/10">
                            <ThumbsUp className="h-3 w-3" /> {comment.counts.like}
                          </button>
                          <button onClick={() => reactComment(comment.id, comment.myReaction === 'dislike' ? null : 'dislike')} className="inline-flex items-center gap-1 rounded border border-white/15 px-2 py-1 hover:bg-white/10">
                            <ThumbsDown className="h-3 w-3" /> {comment.counts.dislike}
                          </button>
                          <button onClick={() => setReplyTo(comment.id)} className="inline-flex items-center gap-1 rounded border border-white/15 px-2 py-1 hover:bg-white/10">
                            <MessageSquare className="h-3 w-3" /> Reply
                          </button>
                        </div>

                        {comment.replies.length > 0 ? (
                          <div className="mt-3 space-y-2 border-l border-white/15 pl-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="rounded border border-white/10 bg-black/20 p-2 text-sm">
                                <p className="mb-1 text-xs text-white/60">{reply.user_id.replace('student-', '@')}</p>
                                <p>{reply.body}</p>
                                <div className="mt-2 flex items-center gap-2 text-xs">
                                  <button onClick={() => reactComment(reply.id, reply.myReaction === 'like' ? null : 'like')} className="inline-flex items-center gap-1 rounded border border-white/15 px-2 py-1 hover:bg-white/10">
                                    <ThumbsUp className="h-3 w-3" /> {reply.counts.like}
                                  </button>
                                  <button onClick={() => reactComment(reply.id, reply.myReaction === 'dislike' ? null : 'dislike')} className="inline-flex items-center gap-1 rounded border border-white/15 px-2 py-1 hover:bg-white/10">
                                    <ThumbsDown className="h-3 w-3" /> {reply.counts.dislike}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="space-y-3">
            <div className="rounded-lg border border-white/10 bg-[#121417] p-3">
              <p className="mb-2 text-sm font-semibold text-white/90">Class Stats</p>
              <p className="mb-2 text-xs text-white/60">{courseCode} · {courseName}</p>
              <div className="flex items-center justify-between text-sm text-white/75">
                <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> Students Enrolled</span>
                <span className="font-semibold text-white">{enrolledCount}</span>
              </div>
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
                  <ThumbsUp className="mr-1 h-4 w-4" /> {reactionCounts.like}
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
                  <ThumbsDown className="mr-1 h-4 w-4" /> {reactionCounts.dislike}
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
                        {isDone ? <CheckCircle2 className="h-4 w-4 text-[#a7d252]" /> : <ChevronRight className="h-4 w-4 text-white/50" />}
                      </div>
                    </button>
                  );
                })}
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
