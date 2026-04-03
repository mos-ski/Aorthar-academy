import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { POST, GET } from '@/app/api/suggestions/route';

const authedUser = { id: 'user-abc', email: 'user@test.com' };

const makeSupabase = ({
  insertError = null,
  insertData = { id: 'sug-1', type: 'course', content: {}, status: 'pending' },
  selectData = [{ id: 'sug-1' }],
  selectError = null,
}: {
  insertError?: unknown;
  insertData?: unknown;
  selectData?: unknown[];
  selectError?: unknown;
} = {}) => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: authedUser } }),
  },
  from: vi.fn().mockImplementation((table: string) => {
    if (table === 'suggestions') {
      return {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: selectData, error: selectError }),
        single: vi.fn().mockResolvedValue({ data: insertData, error: insertError }),
      };
    }
    return {};
  }),
});

describe('POST /api/suggestions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    const req = new NextRequest('http://localhost/api/suggestions', {
      method: 'POST',
      body: JSON.stringify({ type: 'course', title: 'Learn GraphQL', reason: 'Very useful skill for modern devs' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid payload', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const req = new NextRequest('http://localhost/api/suggestions', {
      method: 'POST',
      body: JSON.stringify({ type: 'invalid-type' }), // invalid type
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 201 for a valid suggestion', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const req = new NextRequest('http://localhost/api/suggestions', {
      method: 'POST',
      body: JSON.stringify({
        type: 'course',
        course_code: 'GQL201',
        course_name: 'Introduction to GraphQL',
        description: 'A comprehensive introduction to building and consuming GraphQL APIs in modern applications.',
        credit_units: 3,
        year_level: 200,
        semester: 1,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toBeDefined();
  });

  it('returns 500 when insert fails', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ insertError: { message: 'Constraint violation' }, insertData: null }),
    );

    const req = new NextRequest('http://localhost/api/suggestions', {
      method: 'POST',
      body: JSON.stringify({
        type: 'course',
        course_code: 'RST301',
        course_name: 'Introduction to Rust',
        description: 'Systems programming fundamentals using Rust for safe, concurrent, and performant applications.',
        credit_units: 3,
        year_level: 300,
        semester: 1,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

describe('GET /api/suggestions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns 200 with a list of suggestions', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ selectData: [{ id: 'sug-1', type: 'course' }, { id: 'sug-2', type: 'lesson' }] }),
    );

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(2);
  });

  it('returns 500 when fetch fails', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ selectData: null as unknown as unknown[], selectError: { message: 'DB down' } }),
    );

    const res = await GET();
    expect(res.status).toBe(500);
  });
});
