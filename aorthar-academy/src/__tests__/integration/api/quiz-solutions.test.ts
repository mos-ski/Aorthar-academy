import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/demo/quizAttempts', () => ({
  getDemoAttempt: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { getDemoAttempt } from '@/lib/demo/quizAttempts';
import { GET } from '@/app/api/quiz/attempt/[attemptId]/solutions/route';

const USER_ID = 'user-123';
const ATTEMPT_ID = 'att-sol-001';

const COMPLETED_ATTEMPT = {
  id: ATTEMPT_ID,
  user_id: USER_ID,
  completed_at: '2024-01-01T10:30:00.000Z',
  questions_snapshot: [
    {
      id: 'q1',
      question_text: 'What is UX?',
      explanation: 'UX stands for User Experience.',
      options: [
        { id: 'a', text: 'User Experience', is_correct: true },
        { id: 'b', text: 'User Extension', is_correct: false },
      ],
    },
    {
      id: 'q2',
      question_text: 'What does CSS stand for?',
      explanation: null,
      options: [
        { id: 'a', text: 'Cascading Style Sheets', is_correct: true },
        { id: 'b', text: 'Computer Style System', is_correct: false },
      ],
    },
  ],
};

const makeSupabase = ({
  user = { id: USER_ID } as { id: string } | null,
  attempt = COMPLETED_ATTEMPT as unknown,
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
  return new NextRequest(`http://localhost/api/quiz/attempt/${attemptId}/solutions`);
}

function makeParams(attemptId: string) {
  return { params: Promise.resolve({ attemptId }) };
}

describe('GET /api/quiz/attempt/[attemptId]/solutions', () => {
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
  });

  it('returns 400 when attempt is not yet completed', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({
        attempt: { ...COMPLETED_ATTEMPT, completed_at: null },
      }),
    );

    const res = await GET(makeRequest(ATTEMPT_ID), makeParams(ATTEMPT_ID));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain('after submission');
  });

  it('returns 200 with solutions array on success', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const res = await GET(makeRequest(ATTEMPT_ID), makeParams(ATTEMPT_ID));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body.solutions)).toBe(true);
    expect(body.solutions).toHaveLength(2);
  });

  it('includes correct_option_ids in each solution', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const res = await GET(makeRequest(ATTEMPT_ID), makeParams(ATTEMPT_ID));
    const body = await res.json();

    expect(body.solutions[0].correct_option_ids).toEqual(['a']);
    expect(body.solutions[1].correct_option_ids).toEqual(['a']);
  });

  it('includes explanations (or null) in each solution', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const res = await GET(makeRequest(ATTEMPT_ID), makeParams(ATTEMPT_ID));
    const body = await res.json();

    expect(body.solutions[0].explanation).toBe('UX stands for User Experience.');
    expect(body.solutions[1].explanation).toBeNull();
  });

  it('handles demo attempt prefixed with "demo-"', async () => {
    const demoAttemptId = 'demo-solutions-001';
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());
    (getDemoAttempt as ReturnType<typeof vi.fn>).mockReturnValue({
      ...COMPLETED_ATTEMPT,
      id: demoAttemptId,
      user_id: USER_ID,
    });

    const res = await GET(makeRequest(demoAttemptId), makeParams(demoAttemptId));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.solutions).toBeDefined();
    expect(body.solutions[0].correct_option_ids).toEqual(['a']);
  });

  it('returns 404 for demo attempt belonging to a different user', async () => {
    const demoAttemptId = 'demo-solutions-002';
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());
    (getDemoAttempt as ReturnType<typeof vi.fn>).mockReturnValue({
      ...COMPLETED_ATTEMPT,
      id: demoAttemptId,
      user_id: 'other-user',
    });

    const res = await GET(makeRequest(demoAttemptId), makeParams(demoAttemptId));
    expect(res.status).toBe(404);
  });
});
