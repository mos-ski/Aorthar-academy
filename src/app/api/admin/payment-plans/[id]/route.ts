import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { writeAuditLog } from '@/lib/admin/audit';
import { calculateDeadline } from '@/lib/paymentPlans';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { userId: performedBy } = await requireAdminApi('finance');
    const { id } = await params;
    const body = await req.json() as { action?: 'extend' | 'mark_paid' | 'forfeit'; days?: number };

    const admin = createAdminClient();

    const { data: plan } = await admin
      .from('course_payment_plans')
      .select('id, user_id, course_id, total_price_ngn, deadline_at, status')
      .eq('id', id)
      .single();

    if (!plan) {
      return NextResponse.json({ error: 'Payment plan not found' }, { status: 404 });
    }

    if (body.action === 'extend') {
      const days = Number(body.days);
      if (!Number.isFinite(days) || days <= 0) {
        return NextResponse.json({ error: 'days must be a positive number' }, { status: 400 });
      }

      const newDeadline = calculateDeadline(new Date(plan.deadline_at), days).toISOString();
      await admin.from('course_payment_plans').update({ deadline_at: newDeadline }).eq('id', id);

      await writeAuditLog({
        action: 'payment_plan.extend',
        performedBy,
        targetUser: plan.user_id,
        entityType: 'course_payment_plan',
        entityId: id,
        metadata: { days, newDeadline },
        req,
      }, admin);

      return NextResponse.json({ success: true, deadline_at: newDeadline });
    }

    if (body.action === 'mark_paid') {
      await admin
        .from('course_payment_plans')
        .update({
          status: 'completed',
          balance_paid_at: new Date().toISOString(),
          balance_paystack_reference: `ADMIN_MARKED_PAID_${Date.now()}`,
        })
        .eq('id', id);

      await admin
        .from('standalone_purchases')
        .update({ amount_paid_ngn: plan.total_price_ngn })
        .eq('user_id', plan.user_id)
        .eq('course_id', plan.course_id);

      await writeAuditLog({
        action: 'payment_plan.mark_paid',
        performedBy,
        targetUser: plan.user_id,
        entityType: 'course_payment_plan',
        entityId: id,
        req,
      }, admin);

      return NextResponse.json({ success: true });
    }

    if (body.action === 'forfeit') {
      await admin
        .from('standalone_purchases')
        .delete()
        .eq('user_id', plan.user_id)
        .eq('course_id', plan.course_id);

      await admin
        .from('course_payment_plans')
        .update({ status: 'forfeited', forfeited_at: new Date().toISOString() })
        .eq('id', id);

      await writeAuditLog({
        action: 'payment_plan.forfeit',
        performedBy,
        targetUser: plan.user_id,
        entityType: 'course_payment_plan',
        entityId: id,
        req,
      }, admin);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
