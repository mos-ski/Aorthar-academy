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
      authorization_url: 'https://checkout.paystack.com/test-auth-balance',
      access_code: 'test-access',
      reference: 'aa-550e8400-1234567890-abcdef',
    },
  }),
}));

import { createClient } from '@/lib/supabase/server';
import { requireApiAuthNotSuspended } from '@/lib/auth';
import { initiatePayment } from '@/lib/paystack';
import { POST } from '@/app/api/standalone/checkout-plan-balance/route';

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const OTHER_USER_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const PLAN_ID = 'plan-001';
const COURSE_ID = 'course-001';

const makePlan = (overrides = {}) => ({
  id: PLAN_ID,
  user_id: USER_ID,
  course_id: COURSE_ID,
  balance_ngn: 8000,
  status: 'awaiting_balance',
  ...overrides,
});

function tableBuilder(result: { data: unknown; error?: unknown }) {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn().mockReturnThis();
  builder.eq = vi.fn().mockReturnThis();
  builder.single = vi.fn().mockResolvedValue(result);
  builder.maybeSingle = vi.fn().mockResolvedValue(result);
  return builder;
}

function makeSupabase({
  user = { id: USER_ID, email: 'ada@example.com' } as { id: string; email: string } | null,
  plan = makePlan(),
  course = { slug: 'intro-to-testing' } as { slug: string } | null,
}: {
  user?: { id: string; email: string } | null;
  plan?: ReturnType<typeof makePlan> | null;
  course?: { slug: string } | null;
} = {}) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn((table: string) => {
      if (table === 'course_payment_plans') {
        return tableBuilder({ data: plan, error: plan ? null : { message: 'Not found' } });
      }
      if (table === 'standalone_courses') {
        return tableBuilder({ data: course });
      }
      throw new Error(`Unexpected table in test: ${table}`);
    }),
  };
}

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/standalone/checkout-plan-balance', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/standalone/checkout-plan-balance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (requireApiAuthNotSuspended as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: USER_ID });
  });

  it('returns 401 when unauthenticated', async () => {
    (requireApiAuthNotSuspended as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('UNAUTHORIZED'));
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const res = await POST(makeRequest({ plan_id: PLAN_ID }));
    expect(res.status).toBe(401);
  });

  it('returns 404 when the plan does not exist', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase({ plan: null }));

    const res = await POST(makeRequest({ plan_id: 'nope' }));
    expect(res.status).toBe(404);
  });

  it('returns 403 when the plan belongs to a different user', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ plan: makePlan({ user_id: OTHER_USER_ID }) }),
    );

    const res = await POST(makeRequest({ plan_id: PLAN_ID }));
    expect(res.status).toBe(403);
  });

  it('returns 400 when the plan is not awaiting a balance payment', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ plan: makePlan({ status: 'completed' }) }),
    );

    const res = await POST(makeRequest({ plan_id: PLAN_ID }));
    expect(res.status).toBe(400);
  });

  it('initiates payment for the balance with payment_plan_balance metadata', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const res = await POST(makeRequest({ plan_id: PLAN_ID }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.payment_url).toBe('https://checkout.paystack.com/test-auth-balance');

    expect(initiatePayment).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'ada@example.com',
        amount_kobo: 800000,
        metadata: expect.objectContaining({
          type: 'payment_plan_balance',
          plan_id: PLAN_ID,
          course_id: COURSE_ID,
          user_id: USER_ID,
        }),
        callback_url: expect.stringContaining('/courses-app/learn/intro-to-testing'),
      }),
    );
  });
});
