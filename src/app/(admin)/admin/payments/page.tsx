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
    { data: profileRows },
    { count: activeSubscriptions },
    { count: totalUsers },
    { count: premiumUsers },
  ] = await Promise.all([
    // University subscription transactions — no profile join (user_id FKs to auth.users, not profiles)
    admin
      .from('transactions')
      .select('id, paystack_reference, amount, status, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(100),
    // Standalone course purchases
    admin
      .from('standalone_purchases')
      .select('id, paystack_reference, amount_paid_ngn, purchased_at, user_id, course_id, standalone_courses(title)')
      .order('purchased_at', { ascending: false })
      .limit(100),
    // Profiles fetched separately — user_id here is the FK to auth.users
    admin.from('profiles').select('user_id, full_name, email'),
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

  // Build a profile lookup map keyed by user_id
  const profileMap = new Map(
    (profileRows ?? []).map((p) => [
      p.user_id,
      { full_name: p.full_name as string | null, email: (p as { email?: string | null }).email ?? null },
    ]),
  );

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

  const rows: (TxRow & { user_id?: string })[] = [
    ...(uniTxns ?? []).map((t) => {
      const profile = profileMap.get(t.user_id);
      return {
        id: t.id,
        paystack_reference: t.paystack_reference ?? '',
        amount_kobo: t.amount ?? 0,
        type: 'subscription' as const,
        label: 'University subscription',
        status: t.status ?? 'unknown',
        created_at: t.created_at,
        user_id: t.user_id,
        full_name: profile?.full_name ?? null,
        email: profile?.email ?? null,
      };
    }),
    ...(standalonePurchases ?? []).map((p) => {
      const profile = profileMap.get(p.user_id);
      const course = (p.standalone_courses as unknown) as { title: string | null } | null;
      return {
        id: p.id,
        paystack_reference: p.paystack_reference ?? '',
        amount_kobo: (p.amount_paid_ngn ?? 0) * 100,
        type: 'course' as const,
        label: Array.isArray(p.standalone_courses)
          ? ((p.standalone_courses[0] as { title?: string | null } | undefined)?.title ?? 'Course purchase')
          : (course?.title ?? 'Course purchase'),
        status: 'success',
        created_at: p.purchased_at,
        user_id: p.user_id,
        full_name: profile?.full_name ?? null,
        email: profile?.email ?? null,
      };
    }),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Enrich any rows where profile lookup found nothing — fall back to auth API
  const missingUserIds = [...new Set(
    rows.filter((r) => !r.full_name && !r.email && r.user_id).map((r) => r.user_id!),
  )];

  if (missingUserIds.length > 0) {
    await Promise.all(
      missingUserIds.map(async (uid) => {
        const { data } = await admin.auth.admin.getUserById(uid);
        if (data?.user) {
          profileMap.set(uid, {
            full_name: (data.user.user_metadata?.full_name as string | null) ?? null,
            email: data.user.email ?? null,
          });
        }
      }),
    );
    for (const row of rows) {
      if (!row.full_name && !row.email && row.user_id && profileMap.has(row.user_id)) {
        const info = profileMap.get(row.user_id)!;
        row.full_name = info.full_name;
        row.email = info.email;
      }
    }
  }

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
