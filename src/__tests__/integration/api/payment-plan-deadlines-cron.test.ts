import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }));
vi.mock('@/lib/email', () => ({ sendEmail: vi.fn().mockResolvedValue({}) }));

import { createAdminClient } from '@/lib/supabase/admin';
import { GET } from '@/app/api/cron/payment-plan-deadlines/route';

const PLAN_OVERDUE = {
  id: 'plan-overdue',
  user_id: 'user-1',
  course_id: 'course-1',
  balance_ngn: 8000,
  deadline_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  reminder_7d_sent_at: null,
  reminder_1d_sent_at: null,
};

const PLAN_DUE_SOON = {
  id: 'plan-due-soon',
  user_id: 'user-2',
  course_id: 'course-2',
  balance_ngn: 5000,
  deadline_at: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
  reminder_7d_sent_at: null,
  reminder_1d_sent_at: null,
};

const PLAN_NOT_DUE = {
  id: 'plan-not-due',
  user_id: 'user-3',
  course_id: 'course-3',
  balance_ngn: 3000,
  deadline_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  reminder_7d_sent_at: null,
  reminder_1d_sent_at: null,
};

function setupAdminClient(plans: Record<string, unknown>[]) {
  const calls: { table: string; method: string; args: unknown[] }[] = [];

  (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
    from: vi.fn((table: string) => {
      const builder: Record<string, unknown> = {};
      builder.select = vi.fn().mockReturnThis();
      builder.eq = vi.fn().mockReturnThis();
      builder.single = vi.fn().mockResolvedValue({ data: { title: 'Intro to Testing' } });
      builder.maybeSingle = vi.fn().mockResolvedValue({ data: { full_name: 'Ada Lovelace' } });
      builder.delete = vi.fn(() => {
        calls.push({ table, method: 'delete', args: [] });
        return builder;
      });
      builder.update = vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'update', args });
        return builder;
      });
      builder.then = (resolve: (v: { data: unknown }) => unknown) =>
        Promise.resolve({ data: table === 'course_payment_plans' ? plans : [] }).then(resolve);
      return builder;
    }),
    auth: { admin: { getUserById: vi.fn().mockResolvedValue({ data: { user: { email: 'ada@example.com' } } }) } },
  });

  return calls;
}

function makeRequest() {
  return new Request('http://localhost/api/cron/payment-plan-deadlines', {
    headers: { authorization: 'Bearer test-cron-secret' },
  });
}

describe('GET /api/cron/payment-plan-deadlines', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'test-cron-secret';
  });

  it('returns 401 without the correct bearer token', async () => {
    setupAdminClient([]);
    const res = await GET(new Request('http://localhost/api/cron/payment-plan-deadlines'));
    expect(res.status).toBe(401);
  });

  it('forfeits an overdue plan: revokes access and marks it forfeited', async () => {
    const calls = setupAdminClient([PLAN_OVERDUE]);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.forfeited).toBe(1);

    const purchaseDelete = calls.find((c) => c.table === 'standalone_purchases' && c.method === 'delete');
    expect(purchaseDelete).toBeDefined();

    const planUpdate = calls.find((c) => c.table === 'course_payment_plans' && c.method === 'update');
    expect(planUpdate!.args[0]).toMatchObject({ status: 'forfeited' });
  });

  it('sends and stamps a 1-day reminder for a plan due soon', async () => {
    const calls = setupAdminClient([PLAN_DUE_SOON]);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.remindersSent).toBe(1);

    const planUpdate = calls.find((c) => c.table === 'course_payment_plans' && c.method === 'update');
    expect(planUpdate!.args[0]).toMatchObject({ reminder_1d_sent_at: expect.any(String) });
  });

  it('does nothing for a plan that is not due soon', async () => {
    const calls = setupAdminClient([PLAN_NOT_DUE]);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.forfeited).toBe(0);
    expect(body.remindersSent).toBe(0);
    expect(calls.length).toBe(0);
  });
});
