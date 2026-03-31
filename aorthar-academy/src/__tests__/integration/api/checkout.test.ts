import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
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
import { initiatePayment } from '@/lib/paystack';
import { POST } from '@/app/api/payments/checkout/route';

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const PLAN_ID = 'plan-standard-001';

const makePlan = (overrides = {}) => ({
  id: PLAN_ID,
  name: 'Standard',
  price: 15000,
  currency: 'NGN',
  plan_type: 'standard',
  ...overrides,
});

const makeSupabase = ({
  user = { id: USER_ID, email: 'ada@example.com' } as { id: string; email: string } | null,
  plan = makePlan(),
}: {
  user?: { id: string; email: string } | null;
  plan?: ReturnType<typeof makePlan> | null;
} = {}) => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user } }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: plan, error: plan ? null : { message: 'Not found' } }),
  }),
});

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/payments/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/payments/checkout', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase({ user: null }));

    const res = await POST(makeRequest({ plan_id: PLAN_ID }));
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('Unauthorized');
  });

  it('returns 404 when plan is not found', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase({ plan: null }));

    const res = await POST(makeRequest({ plan_id: 'non-existent-plan' }));
    expect(res.status).toBe(404);
    expect((await res.json()).error).toContain('Plan not found');
  });

  it('returns 200 with authorization_url on success', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    const res = await POST(makeRequest({ plan_id: PLAN_ID }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.authorization_url).toBe('https://checkout.paystack.com/test-auth');
  });

  it('calls initiatePayment with correct amount in kobo', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    await POST(makeRequest({ plan_id: PLAN_ID }));

    expect(initiatePayment).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'ada@example.com',
        amount_kobo: 1500000, // 15000 NGN × 100
        metadata: expect.objectContaining({ user_id: USER_ID, plan_type: 'standard' }),
      }),
    );
  });

  it('passes plan metadata including user_id and plan_type', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());

    await POST(makeRequest({ plan_id: PLAN_ID }));

    expect(initiatePayment).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { user_id: USER_ID, plan_type: 'standard' },
      }),
    );
  });
});
