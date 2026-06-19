import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/auth', () => ({ requireApiAuthNotSuspended: vi.fn() }));
vi.mock('@/lib/paystack', () => ({
  generateReference: vi.fn().mockReturnValue('aa-550e8400-1234567890-abcdef'),
  initiatePayment: vi.fn().mockResolvedValue({
    status: true,
    message: 'Authorization URL created',
    data: {
      authorization_url: 'https://checkout.paystack.com/test-auth',
      access_code: 'test-access',
      reference: 'aa-550e8400-1234567890-abcdef',
    },
  }),
}));

import { createClient } from '@/lib/supabase/server';
import { requireApiAuthNotSuspended } from '@/lib/auth';
import { initiatePayment } from '@/lib/paystack';
import { POST } from '@/app/api/standalone/checkout-plan/route';

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const COURSE_ID = 'course-001';

const makeCourse = (overrides = {}) => ({
  id: COURSE_ID,
  title: 'Intro to Testing',
  price_ngn: 20000,
  status: 'published',
  allow_payment_plan: true,
  ...overrides,
});

function tableBuilder(result: { data: unknown; error?: unknown }) {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn().mockReturnThis();
  builder.eq = vi.fn().mockReturnThis();
  builder.in = vi.fn().mockResolvedValue(result);
  builder.single = vi.fn().mockResolvedValue(result);
  builder.maybeSingle = vi.fn().mockResolvedValue(result);
  return builder;
}

function makeSupabase({
  user = { id: USER_ID, email: 'ada@example.com' } as { id: string; email: string } | null,
  course = makeCourse(),
  existingPurchase = null as { id: string } | null,
  settings = [
    { key: 'payment_plan_min_percent', value: '50' },
    { key: 'payment_plan_deadline_days', value: '30' },
  ],
}: {
  user?: { id: string; email: string } | null;
  course?: ReturnType<typeof makeCourse> | null;
  existingPurchase?: { id: string } | null;
  settings?: { key: string; value: string }[];
} = {}) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn((table: string) => {
      if (table === 'standalone_courses') {
        return tableBuilder({ data: course, error: course ? null : { message: 'Not found' } });
      }
      if (table === 'standalone_purchases') {
        return tableBuilder({ data: existingPurchase });
      }
      if (table === 'site_settings') {
        return tableBuilder({ data: settings });
      }
      if (table === 'profiles') {
        return tableBuilder({ data: { full_name: 'Ada Lovelace' } });
      }
      throw new Error(`Unexpected table in test: ${table}`);
    }),
  };
}

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/standalone/checkout-plan', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/standalone/checkout-plan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (requireApiAuthNotSuspended as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: USER_ID });
  });

  it('returns 401 when unauthenticated', async () => {
    (requireApiAuthNotSuspended as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('UNAUTHORIZED'));
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const res = await POST(makeRequest({ slug: 'intro-to-testing', percent: 50, terms_accepted: true }));
    expect(res.status).toBe(401);
  });

  it('returns 404 when course is not found', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase({ course: null }));

    const res = await POST(makeRequest({ slug: 'nope', percent: 50, terms_accepted: true }));
    expect(res.status).toBe(404);
  });

  it('returns 400 when the course does not allow payment plans', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ course: makeCourse({ allow_payment_plan: false }) }),
    );

    const res = await POST(makeRequest({ slug: 'intro-to-testing', percent: 50, terms_accepted: true }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/not available/i);
  });

  it('returns 409 when the user already has access to the course', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ existingPurchase: { id: 'purchase-1' } }),
    );

    const res = await POST(makeRequest({ slug: 'intro-to-testing', percent: 50, terms_accepted: true }));
    expect(res.status).toBe(409);
  });

  it('returns 400 when the percent is below the configured minimum', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const res = await POST(makeRequest({ slug: 'intro-to-testing', percent: 40, terms_accepted: true }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/percent/i);
  });

  it('returns 400 when terms are not accepted', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const res = await POST(makeRequest({ slug: 'intro-to-testing', percent: 50, terms_accepted: false }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/terms/i);
  });

  it('initiates payment for the first installment with payment_plan_first metadata', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const res = await POST(makeRequest({ slug: 'intro-to-testing', percent: 60, terms_accepted: true }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.payment_url).toBe('https://checkout.paystack.com/test-auth');
    expect(body.first_payment_ngn).toBe(12000);
    expect(body.balance_ngn).toBe(8000);

    expect(initiatePayment).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'ada@example.com',
        amount_kobo: 1200000,
        metadata: expect.objectContaining({
          type: 'payment_plan_first',
          course_id: COURSE_ID,
          user_id: USER_ID,
          percent: '60',
          total_price_ngn: '20000',
          first_payment_ngn: '12000',
          deadline_days: '30',
        }),
      }),
    );
  });
});
