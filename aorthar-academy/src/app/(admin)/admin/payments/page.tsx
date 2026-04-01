export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Users, CreditCard, AlertCircle, Banknote } from 'lucide-react';
import { DEMO_TRANSACTIONS } from '@/lib/demo/adminSnapshot';
import { isDemoMode, isExplicitLiveMode } from '@/lib/demo/mode';

export default async function AdminPaymentsPage() {
  const supabase = await createClient();
  const demo = await isDemoMode();
  const explicitLive = await isExplicitLiveMode();

  const [
    { data: transactions },
    { count: activeSubscriptions },
    { count: totalUsers },
    { count: premiumUsers },
  ] = await Promise.all([
    supabase
      .from('transactions')
      .select('*, profiles!user_id(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
  ]);

  const rawTxns = transactions ?? [];
  const txns = (explicitLive || (!demo && rawTxns.length > 0)) ? rawTxns : DEMO_TRANSACTIONS;
  const successful = txns.filter((t) => t.status === 'success');
  const failed = txns.filter((t) => t.status === 'failed');
  const totalRevenue = successful.reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const isLive = explicitLive || (!demo && (totalUsers ?? 0) > 0);
  const effectiveActiveSubscriptions = isLive ? (activeSubscriptions ?? 0) : 3;
  const effectiveTotalUsers = isLive ? (totalUsers ?? 0) : 8;
  const effectivePremiumUsers = isLive ? (premiumUsers ?? 0) : 3;
  const conversionRate = effectiveTotalUsers > 0
    ? ((effectivePremiumUsers / effectiveTotalUsers) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Payments & Revenue</h2>
        <p className="text-sm text-muted-foreground">Paystack transaction history and subscription metrics</p>
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
            <p className="text-2xl font-bold">{effectiveActiveSubscriptions}</p>
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
                <TableHead>Reference</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Banknote className="h-8 w-8 opacity-30" />
                      <p className="text-sm font-medium">No transactions yet</p>
                      <p className="text-xs">Payments will appear here once students subscribe.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {txns.map((t) => {
                const profile = t.profiles as { full_name: string; email: string } | null;
                return (
                  <TableRow
                    key={t.id}
                    className={t.status === 'failed' ? 'bg-destructive/5' : ''}
                  >
                    <TableCell>
                      <p className="font-medium text-sm">{profile?.full_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{profile?.email ?? '—'}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{t.paystack_reference}</TableCell>
                    <TableCell className="font-medium">{formatCurrency((t.amount ?? 0) / 100)}</TableCell>
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
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
