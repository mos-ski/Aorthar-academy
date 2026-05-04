'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Users, Clock, ClipboardList } from 'lucide-react';

interface Transaction {
  id: string;
  full_name: string | null;
  email: string | null;
  track: string | null;
  payment_status: string;
  amount_paid_ngn: number | null;
  paid_at: string | null;
  form_submitted_at: string | null;
  app_status: string;
  created_at: string;
  cohort_name: string | null;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatNgn(amount: number | null) {
  if (amount == null) return '—';
  return `₦${amount.toLocaleString('en-NG')}`;
}

export default function InternshipTransactions({
  transactions,
  totalRevenue,
  totalPaid,
  pendingCount,
  formSubmitted,
}: {
  transactions: Transaction[];
  totalRevenue: number;
  totalPaid: number;
  pendingCount: number;
  formSubmitted: number;
}) {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered =
    statusFilter === 'all'
      ? transactions
      : transactions.filter((t) => t.payment_status === statusFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Internship Transactions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All payments made through internship application forms
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Paid', value: totalPaid, Icon: CreditCard, color: 'text-blue-500' },
          { label: 'Total Revenue', value: formatNgn(totalRevenue), Icon: CreditCard, color: 'text-green-500' },
          { label: 'Form Submitted', value: formSubmitted, Icon: ClipboardList, color: 'text-purple-500' },
          { label: 'Pending', value: pendingCount, Icon: Clock, color: 'text-yellow-500' },
        ].map(({ label, value, Icon, color }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Status:</span>
        {['all', 'paid', 'pending', 'failed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              statusFilter === status
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Transactions table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Payment Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No transactions found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cohort</TableHead>
                    <TableHead>Track</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium max-w-[140px] truncate">
                        {t.full_name ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[170px] truncate">
                        {t.email ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {t.cohort_name ?? '—'}
                      </TableCell>
                      <TableCell>
                        {t.track ? (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: 'rgba(167,210,82,0.1)',
                              color: '#5a7a1a',
                              border: '1px solid rgba(167,210,82,0.25)',
                            }}
                          >
                            {t.track}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatNgn(t.amount_paid_ngn)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            t.payment_status === 'paid'
                              ? 'bg-green-500/15 text-green-600 border-green-500/20 hover:bg-green-500/15'
                              : t.payment_status === 'pending'
                                ? 'bg-yellow-500/15 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/15'
                                : 'bg-red-500/15 text-red-600 border-red-500/20 hover:bg-red-500/15'
                          }
                        >
                          {t.payment_status.charAt(0).toUpperCase() + t.payment_status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {t.form_submitted_at ? (
                          <Badge variant="secondary">Submitted</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap text-right">
                        {formatDate(t.paid_at ?? t.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {transactions.length} total transaction(s)
      </p>
    </div>
  );
}
