'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type QuizOption = { id: string; text: string };
type QuizQuestion = {
  id: string;
  type: string;
  question_text: string;
  options: QuizOption[];
  points: number;
};

type AttemptData = {
  id: string;
  course_id: string;
  assessment_type: string;
  started_at: string;
  completed_at: string | null;
  time_limit_secs: number;
  score: number | null;
  passed: boolean | null;
  questions_snapshot: QuizQuestion[] | null;
};

type SolutionRow = {
  question_id: string;
  correct_option_ids: string[];
  explanation: string | null;
};

interface Props {
  attemptId: string;
  courseId: string;
  mode?: 'classroom' | 'dashboard';
}

export default function QuizRunner({ attemptId, courseId, mode = 'classroom' }: Props) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [solutions, setSolutions] = useState<Record<string, SolutionRow>>({});
  const [showReview, setShowReview] = useState(false);

  const storageKey = `aorthar:quiz:${attemptId}:answers`;

  useEffect(() => {
    let cancelled = false;

    async function loadAttempt() {
      setLoading(true);
      try {
        const res = await fetch(`/api/quiz/attempt/${attemptId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Failed to load attempt');

        const data = json.data as AttemptData;
        if (cancelled) return;

        setAttempt(data);
        setResult(data.completed_at ? { score: data.score ?? 0, passed: !!data.passed } : null);

        const raw = window.localStorage.getItem(storageKey);
        if (raw) {
          try {
            setAnswers(JSON.parse(raw));
          } catch {
            // ignore malformed cache
          }
        }

        if (!data.completed_at) {
          const elapsed = Math.floor((Date.now() - new Date(data.started_at).getTime()) / 1000);
          setTimeLeft(Math.max(0, data.time_limit_secs - elapsed));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to load quiz';
        toast.error(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAttempt();

    return () => {
      cancelled = true;
    };
  }, [attemptId, storageKey]);

  useEffect(() => {
    if (!attempt || attempt.completed_at) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt]);

  useEffect(() => {
    if (!attempt || attempt.completed_at) return;
    window.localStorage.setItem(storageKey, JSON.stringify(answers));
  }, [answers, storageKey, attempt]);

  useEffect(() => {
    if (!result) return;

    fetch(`/api/quiz/attempt/${attemptId}/solutions`)
      .then((r) => r.json().then((j) => ({ ok: r.ok, json: j })))
      .then(({ ok, json }) => {
        if (!ok) return;
        const map: Record<string, SolutionRow> = {};
        for (const row of (json.solutions ?? []) as SolutionRow[]) {
          map[row.question_id] = row;
        }
        setSolutions(map);
      })
      .catch(() => {
        // ignore
      });
  }, [attemptId, result]);

  const questions = attempt?.questions_snapshot ?? [];
  const active = questions[current];
  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0;

  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  function choose(questionId: string, optionId: string) {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function submitQuiz() {
    if (!attempt) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attempt_id: attempt.id, answers }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Submit failed');

      setResult({ score: json.data.score, passed: json.data.passed });
      window.localStorage.removeItem(storageKey);
      toast.success('Quiz submitted');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-[#060708] p-6 text-sm text-white/70">Loading quiz...</div>;
  }

  if (!attempt || questions.length === 0) {
    return <div className="min-h-screen bg-[#060708] p-6 text-sm text-red-400">Could not load this quiz attempt.</div>;
  }

  if (result) {
    const passed = result.passed;
    return (
      <div className="min-h-screen bg-[#060708] px-4 py-8 text-white">
        <div className="mx-auto w-full max-w-[55vw] min-w-[320px] rounded-2xl border border-white/10 bg-[#0f1114] p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <div className="text-center">
            <div className={cn('mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full', passed ? 'bg-[#A7D252]/20' : 'bg-[#ef3163]/20')}>
              <CheckCircle2 className={cn('h-8 w-8 animate-pulse', passed ? 'text-[#A7D252]' : 'text-[#ef3163]')} />
            </div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Sora, Helvetica Neue, Arial, sans-serif' }}>
              {passed ? 'Great Job! Quiz Completed' : 'Quiz Completed'}
            </h1>
            <p className="mt-2 text-white/70">You scored <span className="font-semibold text-white">{result.score.toFixed(1)}%</span></p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Badge variant={passed ? 'default' : 'destructive'}>{passed ? 'Passed' : 'Needs Review'}</Badge>
            <Badge variant="outline">{questions.length} Questions</Badge>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="outline" className="border-white/20 bg-white/5 text-white" onClick={() => router.push(`/classroom/${courseId}`)}>
              Back to Class
            </Button>
            <Button className="bg-[#08694A] text-white hover:bg-[#0a7a56]" onClick={() => setShowReview((s) => !s)}>
              <Sparkles className="mr-2 h-4 w-4" /> {showReview ? 'Hide Solutions' : 'Review Solutions'}
            </Button>
          </div>

          {showReview && (
            <div className="mt-8 space-y-4">
              {questions.map((q, i) => {
                const selected = answers[q.id];
                const solution = solutions[q.id];
                const correctIds = solution?.correct_option_ids ?? [];
                return (
                  <div key={q.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="mb-3 text-sm text-white/70">Question {i + 1}</p>
                    <p className="mb-3 text-base font-medium">{q.question_text}</p>
                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const isSelected = selected === opt.id;
                        const isCorrect = correctIds.includes(opt.id);
                        return (
                          <div key={opt.id} className={cn(
                            'rounded-lg border px-3 py-2 text-sm transition',
                            isCorrect && 'border-[#A7D252] bg-[#A7D252]/20 text-white',
                            !isCorrect && isSelected && 'border-[#ef3163] bg-[#ef3163]/20 text-white',
                            !isCorrect && !isSelected && 'border-white/10 bg-black/20 text-white/75',
                          )}>
                            {opt.text}
                          </div>
                        );
                      })}
                    </div>
                    {solution?.explanation ? <p className="mt-3 text-xs text-white/70">{solution.explanation}</p> : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const canContinue = Boolean(active && answers[active.id]);

  return (
    <div className={cn('min-h-screen bg-[#060708] px-4 py-8 text-white', mode === 'dashboard' && 'pt-4')}>
      <div className="mx-auto w-full max-w-[55vw] min-w-[320px] rounded-2xl border border-white/10 bg-[#0f1114] p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push(`/classroom/${courseId}`)}
            className="inline-flex items-center gap-2 text-sm text-white/75 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <Badge variant="outline" className="border-[#A7D252]/40 text-[#A7D252]">Time: {formattedTime}</Badge>
        </div>

        <Progress value={progress} className="h-2 bg-white/10" />

        <div className="mt-6 rounded-xl border border-[#A7D252]/50 bg-[#A7D252]/10 p-5">
          <p className="text-sm text-white/70">Question {current + 1} of {questions.length}</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight" style={{ fontFamily: 'Sora, Helvetica Neue, Arial, sans-serif' }}>
            {active.question_text}
          </h1>
        </div>

        <div className="mt-6 space-y-3">
          {active.options.map((opt, idx) => {
            const selected = answers[active.id] === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => choose(active.id, opt.id)}
                className={cn(
                  'w-full rounded-xl border px-4 py-4 text-left text-lg transition-all duration-200',
                  selected
                    ? 'border-[#A7D252] bg-[#A7D252]/20 shadow-[0_0_0_1px_rgba(167,210,82,0.45)] scale-[1.01]'
                    : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30',
                )}
              >
                <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-sm text-white/70">{String.fromCharCode(65 + idx)}</span>
                {opt.text}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            className="border-white/20 bg-white/5 text-white"
            disabled={current === 0}
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          >
            Previous
          </Button>

          {current < questions.length - 1 ? (
            <Button
              className="bg-[#08694A] text-white hover:bg-[#0a7a56]"
              disabled={!canContinue}
              onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
            >
              Continue
            </Button>
          ) : (
            <Button
              className="bg-[#08694A] text-white hover:bg-[#0a7a56]"
              onClick={submitQuiz}
              disabled={submitting || !canContinue}
            >
              {submitting ? 'Submitting...' : 'Finish Quiz'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
