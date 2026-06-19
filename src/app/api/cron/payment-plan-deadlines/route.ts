import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { decidePlanDeadlineAction } from '@/lib/paymentPlans';
import { paymentPlanReminderHtml, paymentPlanReminderSubject } from '@/lib/email/templates/payment-plan-reminder';
import { paymentPlanForfeitedHtml, paymentPlanForfeitedSubject } from '@/lib/email/templates/payment-plan-forfeited';

interface PlanRow {
  id: string;
  user_id: string;
  course_id: string;
  balance_ngn: number;
  deadline_at: string;
  reminder_7d_sent_at: string | null;
  reminder_1d_sent_at: string | null;
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  const expected = process.env.CRON_SECRET;

  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminSupabase = createAdminClient();
  const { data: plans } = await adminSupabase
    .from('course_payment_plans')
    .select('id, user_id, course_id, balance_ngn, deadline_at, reminder_7d_sent_at, reminder_1d_sent_at')
    .eq('status', 'awaiting_balance');

  const now = new Date();
  let forfeited = 0;
  let remindersSent = 0;

  for (const plan of (plans ?? []) as PlanRow[]) {
    const action = decidePlanDeadlineAction(
      {
        deadlineAt: plan.deadline_at,
        reminder7dSentAt: plan.reminder_7d_sent_at,
        reminder1dSentAt: plan.reminder_1d_sent_at,
      },
      now,
    );

    if (action === 'forfeit') {
      await adminSupabase
        .from('standalone_purchases')
        .delete()
        .eq('user_id', plan.user_id)
        .eq('course_id', plan.course_id);

      await adminSupabase
        .from('course_payment_plans')
        .update({ status: 'forfeited', forfeited_at: now.toISOString() })
        .eq('id', plan.id);

      forfeited++;
      void notifyForfeited(adminSupabase, plan);
    } else if (action === 'remind_1d' || action === 'remind_7d') {
      const field = action === 'remind_1d' ? 'reminder_1d_sent_at' : 'reminder_7d_sent_at';
      await adminSupabase
        .from('course_payment_plans')
        .update({ [field]: now.toISOString() })
        .eq('id', plan.id);

      remindersSent++;
      void notifyReminder(adminSupabase, plan, action === 'remind_1d' ? 1 : 7);
    }
  }

  return NextResponse.json({ ok: true, scanned: plans?.length ?? 0, forfeited, remindersSent });
}

async function loadCourseAndContact(adminSupabase: ReturnType<typeof createAdminClient>, plan: PlanRow) {
  const { data: course } = await adminSupabase
    .from('standalone_courses')
    .select('title, slug')
    .eq('id', plan.course_id)
    .single();
  const { data: userRecord } = await adminSupabase.auth.admin.getUserById(plan.user_id);
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', plan.user_id)
    .maybeSingle();

  return {
    courseName: course?.title ?? 'your course',
    courseSlug: course?.slug ?? '',
    email: userRecord?.user?.email,
    firstName: profile?.full_name?.split(' ')[0] ?? 'there',
  };
}

async function notifyReminder(adminSupabase: ReturnType<typeof createAdminClient>, plan: PlanRow, daysLeft: 1 | 7) {
  try {
    const { courseName, courseSlug, email, firstName } = await loadCourseAndContact(adminSupabase, plan);
    if (!email) return;

    await sendEmail({
      to: email,
      subject: paymentPlanReminderSubject(courseName, daysLeft),
      html: paymentPlanReminderHtml({
        firstName,
        courseName,
        balanceNgn: plan.balance_ngn,
        deadline: plan.deadline_at,
        daysLeft,
        payUrl: `https://bootcamp.aorthar.com/courses-app/learn/${courseSlug}`,
      }),
    });
  } catch (err) {
    console.error('[cron/payment-plan-deadlines] reminder email failed:', err);
  }
}

async function notifyForfeited(adminSupabase: ReturnType<typeof createAdminClient>, plan: PlanRow) {
  try {
    const { courseName, courseSlug, email, firstName } = await loadCourseAndContact(adminSupabase, plan);
    if (!email) return;

    const totalPaidNgn = (await adminSupabase
      .from('course_payment_plans')
      .select('first_payment_ngn')
      .eq('id', plan.id)
      .single()).data?.first_payment_ngn ?? 0;

    await sendEmail({
      to: email,
      subject: paymentPlanForfeitedSubject(courseName),
      html: paymentPlanForfeitedHtml({
        firstName,
        courseName,
        forfeitedNgn: totalPaidNgn,
        courseUrl: `https://bootcamp.aorthar.com/courses-app/${courseSlug}`,
      }),
    });
  } catch (err) {
    console.error('[cron/payment-plan-deadlines] forfeited email failed:', err);
  }
}
