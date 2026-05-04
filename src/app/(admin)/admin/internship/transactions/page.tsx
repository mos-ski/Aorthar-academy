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
    .select('*, cohort:internship_cohorts(name)')
    .order('created_at', { ascending: false });

  const transactions = (applications ?? []).map((app: Record<string, unknown>) => ({
    id: app.id as string,
    full_name: app.full_name as string | null,
    email: app.email as string | null,
    track: app.track as string | null,
    payment_status: app.payment_status as string,
    amount_paid_ngn: app.amount_paid_ngn as number | null,
    paid_at: app.paid_at as string | null,
    form_submitted_at: app.form_submitted_at as string | null,
    app_status: app.app_status as string,
    created_at: app.created_at as string,
    cohort_name: (app.cohort as { name: string } | null)?.name ?? null,
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
