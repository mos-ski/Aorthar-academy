import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/demo/quizAttempts', () => ({
  getDemoAttempt: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { getDemoAttempt } from '@/lib/demo/quizAttempts';
import { GET } from '@/app/api/quiz/attempt/[attemptId]/route';

const USER_ID = 'user-123';
const ATTEMPT_ID = 'att-abc-001';

const MOCK_ATTEMPT = {
  id: ATTEMPT_ID,
  course_id: 'course-1',
  assessment_type: 'quiz',
  started_at: '2024-01-01T10:00:00.000Z',
  completed_at: '2024-01-01T10:30:00.000Z',
  time_limit_secs: 2700,
  score: 80,
  passed: true,
  questions_snapshot: [
    {
      id: 'q1',
      type: 'multiple_choice',
      question_text: 'What is UX?',
      options: [
        { id: 'a', text: 'User Experience', is_correct: true },
        { id: 'b', text: 'User Extension', is_correct: false },
      ],
      points: 1,
    },
  ],
};

const makeSupabase = ({
  user = { id: USER_ID } as { id: string } | null,
  attempt = MOCK_ATTEMPT as unknown,
  fetchError = null,
}: {
  user?: { id: string } | null;
  attempt?: unknown;
  fetchError?: unknown;
} = {}) => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user } }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: attempt, error: fetchError }),
  }),
});

function makeRequest(attemptId: string) {
  return new NextRequest(`http://localhost/api/quiz/attempt/${attemptId}`);
}

function makeParams(attemptId: string) {
  return { params: Promise.resolve({ attemptId }) };
}

describe('GET /api/quiz/attempt/[attemptId]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase({ user: null }));

    const res = await GET(makeRequest(ATTEMPT_ID), makeParams(ATTEMPT_ID));
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('Unauthorized');
  });

  it('returns 404 when attempt is not found', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ attempt: null, fetchError: { message: 'Not found' } }),
    );

    const res = await GET(makeRequest(ATTEMPT_ID), makeParams(ATTEMPT_ID));
    expect(res.status).toBe(404);
    expect((await res.json()).error).toContain('not found');
  });

  it('returns 200 with attempt data on success', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const res = await GET(makeRequest(ATTEMPT_ID), makeParams(ATTEMPT_ID));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.id).toBe(ATTEMPT_ID);
    expect(body.data.score).toBe(80);
    expect(body.data.passed).toBe(true);
  });

  it('strips is_correct from questions in the response', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const res = await GET(makeRequest(ATTEMPT_ID), makeParams(ATTEMPT_ID));
    const body = await res.json();

    for (const q of body.data.questions_snapshot) {
      for (const opt of q.options) {
        expect(opt).not.toHaveProperty('is_correct');
      }
    }
  });

  it('handles demo attempt prefixed with "demo-"', async () => {
    const demoAttemptId = 'demo-attempt-001';
    const demoAttempt = {
      id: demoAttemptId,
      user_id: USER_ID,
      course_id: 'course-demo',
      assessment_type: 'quiz',
      started_at: '2024-01-01T10:00:00.000Z',
      completed_at: '2024-01-01T10:30:00.000Z',
      time_limit_secs: 2700,
      score: 70,
      passed: true,
      questions_snapshot: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question_text: 'Demo question?',
          options: [{ id: 'a', text: 'Answer A', is_correct: true }],
          points: 1,
        },
      ],
    };

    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());
    (getDemoAttempt as ReturnType<typeof vi.fn>).mockReturnValue(demoAttempt);

    const res = await GET(makeRequest(demoAttemptId), makeParams(demoAttemptId));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.id).toBe(demoAttemptId);
  });

  it('returns 404 for demo attempt belonging to a different user', async () => {
    const demoAttemptId = 'demo-attempt-002';
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());
    (getDemoAttempt as ReturnType<typeof vi.fn>).mockReturnValue({
      id: demoAttemptId,
      user_id: 'different-user',
      questions_snapshot: [],
    });

    const res = await GET(makeRequest(demoAttemptId), makeParams(demoAttemptId));
    expect(res.status).toBe(404);
  });
});
