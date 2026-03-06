'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

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

interface Props {
  attemptId: string;
  courseId: string;
}

export default function QuizRunner({ attemptId, courseId }: Props) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

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
    return <div className="text-sm text-muted-foreground">Loading quiz...</div>;
  }

  if (!attempt) {
    return <div className="text-sm text-destructive">Could not load this quiz attempt.</div>;
  }

  if (questions.length === 0) {
    return <div className="text-sm text-muted-foreground">No quiz questions were found for this attempt.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Course Quiz</h1>
          <p className="text-sm text-muted-foreground">Attempt ID: {attempt.id.slice(0, 8)}...</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{attempt.assessment_type}</Badge>
          {result ? (
            <Badge className={result.passed ? 'bg-primary text-primary-foreground' : ''} variant={result.passed ? 'default' : 'destructive'}>
              {result.passed ? `Passed ${result.score.toFixed(1)}%` : `Failed ${result.score.toFixed(1)}%`}
            </Badge>
          ) : (
            <Badge variant="secondary">Time left: {formattedTime}</Badge>
          )}
        </div>
      </div>

      <Progress value={progress} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Question {current + 1} of {questions.length}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-medium">{active.question_text}</p>
          <div className="space-y-2">
            {active.options.map((opt) => {
              const selected = answers[active.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => choose(active.id, opt.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${selected ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-accent/20'}`}
                  disabled={!!result}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={current === 0} onClick={() => setCurrent((c) => Math.max(0, c - 1))}>
          Previous
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/courses/${courseId}`)}>
            Back to Course
          </Button>
          {current < questions.length - 1 ? (
            <Button onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}>Next</Button>
          ) : (
            <Button onClick={submitQuiz} disabled={submitting || !!result}>
              {submitting ? 'Submitting...' : result ? 'Submitted' : 'Submit Quiz'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
