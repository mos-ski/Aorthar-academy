import fs from 'node:fs';
import path from 'node:path';

type DemoOption = { id: string; text: string; is_correct: boolean };
type DemoQuestion = {
  id: string;
  type: 'multiple_choice';
  question_text: string;
  options: DemoOption[];
  points: number;
  shuffle_options: boolean;
  is_exam_question: false;
};

export type DemoQuizAttempt = {
  id: string;
  user_id: string;
  course_id: string;
  assessment_type: 'quiz' | 'exam';
  started_at: string;
  completed_at: string | null;
  time_limit_secs: number;
  score: number | null;
  passed: boolean | null;
  questions_snapshot: DemoQuestion[];
};

const storePath = path.resolve(process.cwd(), '.cache/demo-quiz-attempts.json');

function readStore(): Record<string, DemoQuizAttempt> {
  try {
    if (!fs.existsSync(storePath)) return {};
    return JSON.parse(fs.readFileSync(storePath, 'utf8')) as Record<string, DemoQuizAttempt>;
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, DemoQuizAttempt>) {
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
}

export function createDemoAttempt(input: Omit<DemoQuizAttempt, 'id'>) {
  const id = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const store = readStore();
  const attempt: DemoQuizAttempt = { id, ...input };
  store[id] = attempt;
  writeStore(store);
  return attempt;
}

export function getDemoAttempt(attemptId: string) {
  const store = readStore();
  return store[attemptId] ?? null;
}

export function saveDemoAttempt(attempt: DemoQuizAttempt) {
  const store = readStore();
  store[attempt.id] = attempt;
  writeStore(store);
}

export function buildDemoQuestions(courseName: string, lessonTitles: string[]): DemoQuestion[] {
  const titles = lessonTitles.length > 0 ? lessonTitles : ['Course Foundations'];
  const count = Math.max(5, Math.min(10, titles.length * 2));

  return Array.from({ length: count }).map((_, i) => {
    const correct = titles[i % titles.length];
    const d1 = titles[(i + 1) % titles.length] ?? 'Project launch checklist';
    const d2 = titles[(i + 2) % titles.length] ?? 'Unrelated accounting module';
    const d3 = titles[(i + 3) % titles.length] ?? 'Office productivity tips';
    return {
      id: `dq-${i + 1}`,
      type: 'multiple_choice',
      question_text: `In ${courseName}, which topic is specifically covered?`,
      options: [
        { id: 'a', text: correct, is_correct: true },
        { id: 'b', text: d1, is_correct: false },
        { id: 'c', text: d2, is_correct: false },
        { id: 'd', text: d3, is_correct: false },
      ],
      points: 1,
      shuffle_options: true,
      is_exam_question: false,
    };
  });
}

