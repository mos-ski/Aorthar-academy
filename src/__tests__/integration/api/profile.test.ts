import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Supabase mock factory ────────────────────────────────────────────────────
const makeSupabase = (overrides: Record<string, unknown> = {}) => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null,
    }),
  },
  from: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { full_name: 'Ada Okafor' }, error: null }),
    ...overrides,
  }),
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { PATCH } from '@/app/api/profile/route';

describe('PATCH /api/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') }),
      },
    });

    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ full_name: 'Ada' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await PATCH(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 400 for invalid payload (name too short)', async () => {
    const supabase = makeSupabase();
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(supabase);

    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ full_name: 'A' }), // too short
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing body', async () => {
    const supabase = makeSupabase();
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(supabase);

    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PATCH',
      body: 'not-json',
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 for a valid update', async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        update: mockUpdate,
      }),
    };
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(supabase);

    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ full_name: 'Ada Okafor', bio: 'Designer' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('returns 500 when database update fails', async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: { message: 'DB error' } }),
    });
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({ update: mockUpdate }),
    };
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(supabase);

    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ full_name: 'Ada Okafor' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await PATCH(req);
    expect(res.status).toBe(500);
  });
});
