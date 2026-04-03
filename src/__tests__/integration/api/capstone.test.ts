import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

import { createClient } from '@/lib/supabase/server';
import { POST } from '@/app/api/capstone/submit/route';

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

const VALID_BODY = {
  github_url: 'https://github.com/ada/capstone-project',
  live_url: 'https://capstone.vercel.app',
  description: 'A'.repeat(100),
  tech_stack: ['React', 'TypeScript', 'Supabase'],
};

const makeSupabase = ({
  user = { id: USER_ID, email: 'ada@example.com' } as { id: string; email: string } | null,
  hasPremium = true,
  gpa = 3.8,
  upsertError = null,
  upsertData = { id: 'cap-1', status: 'pending' } as unknown,
}: {
  user?: { id: string; email: string } | null;
  hasPremium?: boolean;
  gpa?: number | null;
  upsertError?: unknown;
  upsertData?: unknown;
} = {}) => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user } }),
  },
  from: vi.fn().mockImplementation((table: string) => {
    if (table === 'subscriptions') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: hasPremium ? { id: 'sub-1' } : null,
        }),
      };
    }
    if (table === 'cumulative_gpas') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: gpa !== null ? { cumulative_gpa: gpa } : null,
        }),
      };
    }
    if (table === 'capstone_submissions') {
      return {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: upsertData, error: upsertError }),
      };
    }
    return {};
  }),
});

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/capstone/submit', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/capstone/submit', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase({ user: null }));

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('Unauthorized');
  });

  it('returns 403 when user has no premium subscription', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase({ hasPremium: false }));

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(403);
    expect((await res.json()).error).toContain('Premium');
  });

  it('returns 400 for invalid payload (github_url not GitHub)', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const res = await POST(makeRequest({ ...VALID_BODY, github_url: 'https://gitlab.com/ada/project' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when description is too short', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const res = await POST(makeRequest({ ...VALID_BODY, description: 'Too short' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when cumulative GPA is below 3.5', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase({ gpa: 3.2 }));

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain('3.5');
  });

  it('returns 400 when GPA record is missing', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase({ gpa: null }));

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(400);
  });

  it('returns 200 with submission data on success', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data).toBeDefined();
    expect(body.data.status).toBe('pending');
  });

  it('returns 500 when upsert fails', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ upsertError: { message: 'DB constraint violation' }, upsertData: null }),
    );

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(500);
  });
});
