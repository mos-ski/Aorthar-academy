export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updatePaymentPlanSettings } from './actions';
import PaymentPlansAdmin from './PaymentPlansAdmin';

type Props = { searchParams: Promise<{ saved?: string }> };

export default async function PaymentPlansPage({ searchParams }: Props) {
  const supabase = await createClient();

  const [{ data: settingsRows }, { data: plans }] = await Promise.all([
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['payment_plan_min_percent', 'payment_plan_deadline_days']),
    supabase
      .from('course_payment_plans')
      .select('*')
      .order('created_at', { ascending: false }),
  ]);

  const settings = Object.fromEntries((settingsRows ?? []).map((r) => [r.key, r.value ?? '']));

  const courseIds = [...new Set((plans ?? []).map((p) => p.course_id))];
  const userIds = [...new Set((plans ?? []).map((p) => p.user_id))];

  const [{ data: courses }, { data: profiles }] = await Promise.all([
    courseIds.length
      ? supabase.from('standalone_courses').select('id, title').in('id', courseIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    userIds.length
      ? supabase.from('profiles').select('user_id, full_name').in('user_id', userIds)
      : Promise.resolve({ data: [] as { user_id: string; full_name: string | null }[] }),
  ]);

  const courseTitleById = Object.fromEntries((courses ?? []).map((c) => [c.id, c.title]));
  const fullNameByUserId = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.full_name]));

  const rows = (plans ?? []).map((p) => ({
    id: p.id as string,
    status: p.status as string,
    total_price_ngn: p.total_price_ngn as number,
    first_payment_ngn: p.first_payment_ngn as number,
    balance_ngn: p.balance_ngn as number,
    deadline_at: p.deadline_at as string,
    courseTitle: courseTitleById[p.course_id] ?? 'Unknown course',
    userName: fullNameByUserId[p.user_id] ?? (p.user_id as string),
  }));

  const params = await searchParams;
  const saved = params.saved === '1';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Payment Plans</h2>
        <p className="text-sm text-muted-foreground">
          Manage installment payment plans for standalone courses
        </p>
      </div>

      {saved && (
        <div className="rounded-md border border-green-600/30 bg-green-600/10 px-4 py-3 text-sm text-green-400">
          Settings saved successfully.
        </div>
      )}

      <form action={updatePaymentPlanSettings} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Global Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field
              name="payment_plan_min_percent"
              label="Minimum first payment (%)"
              hint="Smallest percent a student can pay upfront"
              defaultValue={settings.payment_plan_min_percent}
            />
            <Field
              name="payment_plan_deadline_days"
              label="Days to pay remaining balance"
              hint="How long after the first payment the balance is due"
              defaultValue={settings.payment_plan_deadline_days}
            />
          </CardContent>
        </Card>
        <button
          type="submit"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Save Settings
        </button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active &amp; Past Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentPlansAdmin plans={rows} />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  name,
  label,
  hint,
  defaultValue,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <input
        id={name}
        name={name}
        type="number"
        defaultValue={defaultValue}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </div>
  );
}
