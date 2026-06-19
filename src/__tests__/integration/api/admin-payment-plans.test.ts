import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/admin/apiAuth', () => ({
  requireAdminApi: vi.fn(),
  mapAdminApiError: vi.fn((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') return { status: 401, message: 'Unauthorized' };
    if (message === 'FORBIDDEN_PERMISSION') return { status: 403, message: 'Permission denied for this action' };
    return { status: 500, message: 'Internal server error' };
  }),
}));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }));
vi.mock('@/lib/admin/audit', () => ({ writeAuditLog: vi.fn().mockResolvedValue(undefined) }));

import { requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAuditLog } from '@/lib/admin/audit';
import { PATCH } from '@/app/api/admin/payment-plans/[id]/route';

const PLAN_ID = 'plan-001';
const ADMIN_ID = 'admin-001';

const makePlan = (overrides = {}) => ({
  id: PLAN_ID,
  user_id: 'user-001',
  course_id: 'course-001',
  total_price_ngn: 20000,
  deadline_at: '2026-06-19T00:00:00.000Z',
  status: 'awaiting_balance',
  ...overrides,
});

function setupAdminClient(plan: Record<string, unknown> | null) {
  const calls: { table: string; method: string; args: unknown[] }[] = [];

  (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
    from: vi.fn((table: string) => {
      const builder: Record<string, unknown> = {};
      builder.select = vi.fn().mockReturnThis();
      builder.eq = vi.fn().mockReturnThis();
      builder.single = vi.fn().mockResolvedValue({ data: plan });
      builder.update = vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'update', args });
        return builder;
      });
      builder.delete = vi.fn(() => {
        calls.push({ table, method: 'delete', args: [] });
        return builder;
      });
      return builder;
    }),
  });

  return calls;
}

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/admin/payment-plans/plan-001', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeParams() {
  return { params: Promise.resolve({ id: PLAN_ID }) };
}

describe('PATCH /api/admin/payment-plans/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (requireAdminApi as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: ADMIN_ID, adminLevel: 'finance_admin' });
  });

  it('returns 401 when the caller is not an admin', async () => {
    (requireAdminApi as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('UNAUTHORIZED'));
    setupAdminClient(makePlan());

    const res = await PATCH(makeRequest({ action: 'forfeit' }), makeParams());
    expect(res.status).toBe(401);
  });

  it('returns 404 when the plan does not exist', async () => {
    setupAdminClient(null);

    const res = await PATCH(makeRequest({ action: 'forfeit' }), makeParams());
    expect(res.status).toBe(404);
  });

  it('extends the deadline and writes an audit log', async () => {
    const calls = setupAdminClient(makePlan());

    const res = await PATCH(makeRequest({ action: 'extend', days: 7 }), makeParams());
    expect(res.status).toBe(200);

    const update = calls.find((c) => c.table === 'course_payment_plans' && c.method === 'update');
    expect(update!.args[0]).toMatchObject({ deadline_at: '2026-06-26T00:00:00.000Z' });
    expect(writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'payment_plan.extend', performedBy: ADMIN_ID, entityId: PLAN_ID }),
      expect.anything(),
    );
  });

  it('rejects a non-positive extension', async () => {
    setupAdminClient(makePlan());
    const res = await PATCH(makeRequest({ action: 'extend', days: 0 }), makeParams());
    expect(res.status).toBe(400);
  });

  it('marks the plan fully paid and trues-up access', async () => {
    const calls = setupAdminClient(makePlan());

    const res = await PATCH(makeRequest({ action: 'mark_paid' }), makeParams());
    expect(res.status).toBe(200);

    const planUpdate = calls.find((c) => c.table === 'course_payment_plans' && c.method === 'update');
    expect(planUpdate!.args[0]).toMatchObject({ status: 'completed' });

    const purchaseUpdate = calls.find((c) => c.table === 'standalone_purchases' && c.method === 'update');
    expect(purchaseUpdate!.args[0]).toMatchObject({ amount_paid_ngn: 20000 });
  });

  it('forfeits the plan: revokes access and marks it forfeited', async () => {
    const calls = setupAdminClient(makePlan());

    const res = await PATCH(makeRequest({ action: 'forfeit' }), makeParams());
    expect(res.status).toBe(200);

    expect(calls.find((c) => c.table === 'standalone_purchases' && c.method === 'delete')).toBeDefined();
    const planUpdate = calls.find((c) => c.table === 'course_payment_plans' && c.method === 'update');
    expect(planUpdate!.args[0]).toMatchObject({ status: 'forfeited' });
  });

  it('returns 400 for an unknown action', async () => {
    setupAdminClient(makePlan());
    const res = await PATCH(makeRequest({ action: 'nope' }), makeParams());
    expect(res.status).toBe(400);
  });
});
