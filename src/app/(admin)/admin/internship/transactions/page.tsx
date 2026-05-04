import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import InternshipTransactions from './InternshipTransactions';

export const metadata = { title: 'Transactions — Internship Admin' };

export default async function AdminInternshipTransactionsPage() {
  const session = await requireRole('admin');
  if (!session) redirect('/login');

  const admin = createAdminClient();

  const { data: applications } = await admin
    .from('internship_applications')
    .select('id, cohort_id, full_name, email, track, payment_status, amount_paid_ngn, paid_at, form_submitted_at, app_status, created_at')
    .order('created_at', { ascending: false });

  const cohortIds = [
    ...new Set(applications?.map((a) => a.cohort_id).filter(Boolean) ?? []),
  ];

  const { data: cohorts } = cohortIds.length > 0
    ? await admin.from('internship_cohorts').select('id, name').in('id', cohortIds)
    : { data: [] };

  const cohortMap = new Map<string, string>();
  for (const c of cohorts ?? []) {
    cohortMap.set(c.id, c.name);
  }

  const transactions = (applications ?? []).map((app) => ({
    id: app.id,
    full_name: app.full_name,
    email: app.email,
    track: app.track,
    payment_status: app.payment_status,
    amount_paid_ngn: app.amount_paid_ngn,
    paid_at: app.paid_at,
    form_submitted_at: app.form_submitted_at,
    app_status: app.app_status,
    created_at: app.created_at,
    cohort_name: app.cohort_id ? (cohortMap.get(app.cohort_id) ?? null) : null,
  }));

  const paidTransactions = transactions.filter((t) => t.payment_status === 'paid');
  const totalRevenue = paidTransactions.reduce((sum, t) => sum + (t.amount_paid_ngn ?? 0), 0);
  const totalPaid = paidTransactions.length;
  const pendingCount = transactions.filter((t) => t.payment_status === 'pending').length;
  const formSubmitted = paidTransactions.filter((t) => t.form_submitted_at).length;

  return (
    <InternshipTransactions
      transactions={transactions}
      totalRevenue={totalRevenue}
      totalPaid={totalPaid}
      pendingCount={pendingCount}
      formSubmitted={formSubmitted}
    />
  );
}
