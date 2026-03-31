import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/quiz/generator', () => ({
  ensureQuizQuestions: vi.fn().mockResolvedValue({
    rows: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question_text: 'What does PM stand for?',
        options: [
          { id: 'a', text: 'Project Manager', is_correct: false },
          { id: 'b', text: 'Product Manager', is_correct: true },
        ],
        points: 1,
        shuffle_options: false,
      },
    ],
  }),
}));
vi.mock('@/lib/demo/studentSnapshot', () => ({
  getDemoCourseDetail: vi.fn().mockReturnValue(null),
}));
vi.mock('@/lib/demo/quizAttempts', () => ({
  buildDemoQuestions: vi.fn().mockReturnValue([]),
  createDemoAttempt: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { POST } from '@/app/api/quiz/start/route';

const COURSE_ID = '550e8400-e29b-41d4-a716-446655440000';
const ATTEMPT_ID = 'att-001';

const makeSupabase = ({
  user = { id: 'user-123' },
  course = {
    id: COURSE_ID,
    quiz_attempt_limit: 3,
    exam_attempt_limit: 3,
    cooldown_hours: 24,
    exam_duration_mins: 90,
    quiz_duration_mins: 45,
    pass_mark: 60,
    status: 'published',
    is_premium: false,
  },
  onCooldown = false,
  attemptCount = 0,
  insertAttemptError = null,
}: {
  user?: { id: string } | null;
  course?: unknown | null;
  onCooldown?: boolean;
  attemptCount?: number;
  insertAttemptError?: unknown;
} = {}) => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user } }),
  },
  from: vi.fn().mockImplementation((table: string) => {
    if (table === 'courses') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: course }),
        maybeSingle: vi.fn().mockResolvedValue({ data: course }),
      };
    }
    if (table === 'quiz_attempts') {
      return {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: insertAttemptError ? null : { id: ATTEMPT_ID, started_at: new Date().toISOString() },
          error: insertAttemptError,
        }),
      };
    }
    if (table === 'subscriptions') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      };
    }
    return {};
  }),
  rpc: vi.fn().mockImplementation((fn: string) => {
    if (fn === 'is_on_cooldown') return Promise.resolve({ data: onCooldown });
    if (fn === 'get_attempt_count') return Promise.resolve({ data: attemptCount });
    return Promise.resolve({ data: null });
  }),
});

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/quiz/start', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/quiz/start', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase({ user: null }));

    const res = await POST(makeRequest({ courseId: COURSE_ID }));
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('Unauthorized');
  });

  it('returns 400 when courseId is missing', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain('courseId');
  });

  it('returns 404 when course is not found', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase({ course: null }));

    const res = await POST(makeRequest({ courseId: 'non-existent-id' }));
    expect(res.status).toBe(404);
  });

  it('returns 429 when user is on cooldown', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase({ onCooldown: true }));

    const res = await POST(makeRequest({ courseId: COURSE_ID }));
    expect(res.status).toBe(429);
    expect((await res.json()).error).toContain('cooldown');
  });

  it('returns 400 when attempt limit is reached', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ attemptCount: 3 }), // equals quiz_attempt_limit of 3
    );

    const res = await POST(makeRequest({ courseId: COURSE_ID }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain('Maximum attempts');
  });

  it('returns 200 with attempt data on success', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const res = await POST(makeRequest({ courseId: COURSE_ID }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.attempt_id ?? body.attemptId).toBeTruthy();
    expect(Array.isArray(body.questions)).toBe(true);
  });

  it('strips is_correct from returned questions', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const res = await POST(makeRequest({ courseId: COURSE_ID }));
    const body = await res.json();
    const questions: Array<{ options: Array<Record<string, unknown>> }> = body.questions ?? body.data?.questions ?? [];

    for (const q of questions) {
      for (const opt of q.options) {
        expect(opt).not.toHaveProperty('is_correct');
      }
    }
  });

  it('returns 403 when premium course and user has no subscription', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({
        course: {
          id: COURSE_ID,
          quiz_attempt_limit: 3,
          exam_attempt_limit: 3,
          cooldown_hours: 24,
          exam_duration_mins: 90,
          quiz_duration_mins: 45,
          pass_mark: 60,
          status: 'published',
          is_premium: true,
        },
      }),
    );

    const res = await POST(makeRequest({ courseId: COURSE_ID }));
    expect(res.status).toBe(403);
    expect((await res.json()).error).toContain('Premium');
  });

  it('returns 500 when attempt insert fails', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ insertAttemptError: { message: 'DB error' } }),
    );

    const res = await POST(makeRequest({ courseId: COURSE_ID }));
    expect(res.status).toBe(500);
  });
});
