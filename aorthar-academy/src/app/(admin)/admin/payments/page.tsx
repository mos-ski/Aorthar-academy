import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Users, CreditCard, AlertCircle } from 'lucide-react';

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

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

  const txns = transactions ?? [];
  const successful = txns.filter((t) => t.status === 'success');
  const failed = txns.filter((t) => t.status === 'failed');
  const totalRevenue = successful.reduce((sum, t) => sum + (t.amount ?? 0), 0);
  const conversionRate =
    totalUsers && totalUsers > 0
      ? (((premiumUsers ?? 0) / totalUsers) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Payments & Revenue</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue / 100)}</p>
            <p className="text-xs text-muted-foreground">{successful.length} successful payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeSubscriptions ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground">free → paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{failed.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
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
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No transactions yet.
                  </TableCell>
                </TableRow>
              )}
              {txns.map((t) => {
                const profile = t.profiles as { full_name: string; email: string } | null;
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{profile?.full_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{profile?.email ?? '—'}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{t.paystack_reference}</TableCell>
                    <TableCell>{formatCurrency((t.amount ?? 0) / 100)}</TableCell>
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
                    <TableCell className="text-sm">{formatDateTime(t.created_at)}</TableCell>
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
