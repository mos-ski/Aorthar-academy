export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Users, CreditCard, AlertCircle, Banknote } from 'lucide-react';

export default async function AdminPaymentsPage() {
  const admin = createAdminClient();

  const [
    { data: uniTxns },
    { data: standalonePurchases },
    { count: activeSubscriptions },
    { count: totalUsers },
    { count: premiumUsers },
  ] = await Promise.all([
    // University subscription transactions
    admin
      .from('transactions')
      .select('id, paystack_reference, amount, status, created_at, user_id, profiles!user_id(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(100),
    // Standalone course purchases
    admin
      .from('standalone_purchases')
      .select('id, paystack_reference, amount_paid_ngn, created_at, user_id, course_id, profiles!user_id(full_name, email), standalone_courses!course_id(title)')
      .order('created_at', { ascending: false })
      .limit(100),
    admin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
  ]);

  // Normalise both into one display shape
  type TxRow = {
    id: string;
    paystack_reference: string;
    amount_kobo: number; // university uses kobo, standalone uses NGN
    type: 'subscription' | 'course';
    label: string;
    status: string;
    created_at: string;
    full_name: string | null;
    email: string | null;
  };

  const rows: TxRow[] = [
    ...(uniTxns ?? []).map((t) => {
      const profile = (t.profiles as unknown) as { full_name: string | null; email: string | null } | null;
      return {
        id: t.id,
        paystack_reference: t.paystack_reference ?? '',
        amount_kobo: t.amount ?? 0,
        type: 'subscription' as const,
        label: 'University subscription',
        status: t.status ?? 'unknown',
        created_at: t.created_at,
        full_name: profile?.full_name ?? null,
        email: profile?.email ?? null,
      };
    }),
    ...(standalonePurchases ?? []).map((p) => {
      const profile = (p.profiles as unknown) as { full_name: string | null; email: string | null } | null;
      const course = (p.standalone_courses as unknown) as { title: string | null } | null;
      return {
        id: p.id,
        paystack_reference: p.paystack_reference ?? '',
        amount_kobo: (p.amount_paid_ngn ?? 0) * 100, // convert to kobo for display consistency
        type: 'course' as const,
        label: course?.title ?? 'Course purchase',
        status: 'success',
        created_at: p.created_at,
        full_name: profile?.full_name ?? null,
        email: profile?.email ?? null,
      };
    }),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const successful = rows.filter((t) => t.status === 'success');
  const failed = rows.filter((t) => t.status === 'failed');
  const totalRevenue = successful.reduce((sum, t) => sum + t.amount_kobo, 0);

  const effectiveTotalUsers = totalUsers ?? 0;
  const effectivePremiumUsers = premiumUsers ?? 0;
  const conversionRate = effectiveTotalUsers > 0
    ? ((effectivePremiumUsers / effectiveTotalUsers) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Payments & Revenue</h2>
        <p className="text-sm text-muted-foreground">All transactions — university subscriptions and course purchases</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue / 100)}</p>
            <p className="text-xs text-muted-foreground mt-1">{successful.length} successful payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeSubscriptions ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">premium students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">free → premium</p>
          </CardContent>
        </Card>

        <Card className={failed.length > 0 ? 'border-destructive/40' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Transactions</CardTitle>
            <AlertCircle className={`h-4 w-4 ${failed.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${failed.length > 0 ? 'text-destructive' : ''}`}>{failed.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {failed.length > 0 ? 'needs attention' : 'no failures'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Banknote className="h-4 w-4" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Banknote className="h-8 w-8 opacity-30" />
                      <p className="text-sm font-medium">No transactions yet</p>
                      <p className="text-xs">Payments will appear here once students subscribe or purchase.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {rows.map((t) => (
                <TableRow
                  key={t.id}
                  className={t.status === 'failed' ? 'bg-destructive/5' : ''}
                >
                  <TableCell>
                    <p className="font-medium text-sm">{t.full_name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{t.email ?? '—'}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {t.type === 'course' ? t.label : 'Subscription'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{t.paystack_reference || '—'}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(t.amount_kobo / 100)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.status === 'success'
                          ? 'default'
                          : t.status === 'failed'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTime(t.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
