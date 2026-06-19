import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/paystack', () => ({
  verifyWebhookSignature: vi.fn().mockReturnValue(true),
}));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }));
vi.mock('@/lib/email', () => ({ sendEmail: vi.fn().mockResolvedValue({}) }));

import { createAdminClient } from '@/lib/supabase/admin';
import { POST } from '@/app/api/webhooks/paystack/route';

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const COURSE_ID = 'course-001';
const PLAN_ID = 'plan-001';

function makeRequest(event: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/webhooks/paystack', {
    method: 'POST',
    body: JSON.stringify(event),
    headers: { 'Content-Type': 'application/json', 'x-paystack-signature': 'sig' },
  });
}

describe('webhook: payment_plan_first', () => {
  let calls: { table: string; method: string; args: unknown[] }[];

  beforeEach(() => {
    vi.clearAllMocks();
    calls = [];

    (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn((table: string) => {
        const builder: Record<string, unknown> = {};
        builder.upsert = vi.fn((...args: unknown[]) => {
          calls.push({ table, method: 'upsert', args });
          return Promise.resolve({ error: null });
        });
        builder.update = vi.fn((...args: unknown[]) => {
          calls.push({ table, method: 'update', args });
          return builder;
        });
        builder.eq = vi.fn().mockReturnThis();
        builder.select = vi.fn().mockReturnThis();
        builder.single = vi.fn().mockResolvedValue({ data: { title: 'Intro to Testing' } });
        builder.maybeSingle = vi.fn().mockResolvedValue({ data: { full_name: 'Ada Lovelace' } });
        return builder;
      }),
      auth: { admin: { getUserById: vi.fn().mockResolvedValue({ data: { user: { email: 'ada@example.com' } } }) } },
    });
  });

  it('upserts a course_payment_plans row and grants access via standalone_purchases', async () => {
    const res = await POST(makeRequest({
      event: 'charge.success',
      data: {
        reference: 'ref-1',
        status: 'success',
        metadata: {
          type: 'payment_plan_first',
          course_id: COURSE_ID,
          user_id: USER_ID,
          percent: '60',
          total_price_ngn: '20000',
          first_payment_ngn: '12000',
          deadline_days: '30',
          terms_accepted_at: '2026-06-19T00:00:00.000Z',
        },
      },
    }));

    expect(res.status).toBe(200);
    expect((await res.json()).type).toBe('payment_plan_first');

    const planUpsert = calls.find((c) => c.table === 'course_payment_plans' && c.method === 'upsert');
    expect(planUpsert).toBeDefined();
    expect(planUpsert!.args[0]).toMatchObject({
      user_id: USER_ID,
      course_id: COURSE_ID,
      total_price_ngn: 20000,
      first_payment_ngn: 12000,
      balance_ngn: 8000,
      first_paystack_reference: 'ref-1',
      status: 'awaiting_balance',
    });

    const purchaseUpsert = calls.find((c) => c.table === 'standalone_purchases' && c.method === 'upsert');
    expect(purchaseUpsert).toBeDefined();
    expect(purchaseUpsert!.args[0]).toMatchObject({
      user_id: USER_ID,
      course_id: COURSE_ID,
      paystack_reference: 'ref-1',
      amount_paid_ngn: 12000,
    });
  });

  it('returns 400 when required metadata is missing', async () => {
    const res = await POST(makeRequest({
      event: 'charge.success',
      data: { reference: 'ref-2', status: 'success', metadata: { type: 'payment_plan_first' } },
    }));
    expect(res.status).toBe(400);
  });

  it('skips non-success statuses', async () => {
    const res = await POST(makeRequest({
      event: 'charge.success',
      data: { reference: 'ref-3', status: 'failed', metadata: { type: 'payment_plan_first' } },
    }));
    expect(res.status).toBe(200);
    expect((await res.json()).skipped).toBeDefined();
  });
});

describe('webhook: payment_plan_balance', () => {
  let calls: { table: string; method: string; args: unknown[] }[];

  function setupAdminClient(plan: Record<string, unknown> | null) {
    calls = [];
    (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn((table: string) => {
        const builder: Record<string, unknown> = {};
        builder.select = vi.fn().mockReturnThis();
        builder.eq = vi.fn().mockReturnThis();
        builder.single = vi.fn().mockResolvedValue({ data: table === 'course_payment_plans' ? plan : { title: 'Intro to Testing' } });
        builder.maybeSingle = vi.fn().mockResolvedValue({ data: { full_name: 'Ada Lovelace' } });
        builder.update = vi.fn((...args: unknown[]) => {
          calls.push({ table, method: 'update', args });
          return builder;
        });
        return builder;
      }),
      auth: { admin: { getUserById: vi.fn().mockResolvedValue({ data: { user: { email: 'ada@example.com' } } }) } },
    });
  }

  beforeEach(() => vi.clearAllMocks());

  it('marks the plan completed and trues-up standalone_purchases to the full price', async () => {
    setupAdminClient({ id: PLAN_ID, user_id: USER_ID, course_id: COURSE_ID, total_price_ngn: 20000, status: 'awaiting_balance' });

    const res = await POST(makeRequest({
      event: 'charge.success',
      data: { reference: 'ref-balance-1', status: 'success', metadata: { type: 'payment_plan_balance', plan_id: PLAN_ID } },
    }));

    expect(res.status).toBe(200);
    expect((await res.json()).type).toBe('payment_plan_balance');

    const planUpdate = calls.find((c) => c.table === 'course_payment_plans' && c.method === 'update');
    expect(planUpdate!.args[0]).toMatchObject({ status: 'completed', balance_paystack_reference: 'ref-balance-1' });

    const purchaseUpdate = calls.find((c) => c.table === 'standalone_purchases' && c.method === 'update');
    expect(purchaseUpdate!.args[0]).toMatchObject({ amount_paid_ngn: 20000 });
  });

  it('is a no-op when the plan is already resolved (idempotent)', async () => {
    setupAdminClient({ id: PLAN_ID, user_id: USER_ID, course_id: COURSE_ID, total_price_ngn: 20000, status: 'completed' });

    const res = await POST(makeRequest({
      event: 'charge.success',
      data: { reference: 'ref-balance-2', status: 'success', metadata: { type: 'payment_plan_balance', plan_id: PLAN_ID } },
    }));

    expect(res.status).toBe(200);
    expect(calls.find((c) => c.method === 'update')).toBeUndefined();
  });

  it('returns 400 when plan_id is missing', async () => {
    setupAdminClient(null);
    const res = await POST(makeRequest({
      event: 'charge.success',
      data: { reference: 'ref-balance-3', status: 'success', metadata: { type: 'payment_plan_balance' } },
    }));
    expect(res.status).toBe(400);
  });
});
