'use client';

import { useState } from 'react';

interface Transaction {
  id: string;
  product_id: string;
  email: string;
  paystack_reference: string;
  payment_status: string;
  amount_paid_ngn: number | null;
  paid_at: string | null;
  download_count: number;
  created_at: string;
  product_name: string;
}

export default function MarketplaceTransactions({
  transactions,
  totalRevenue,
  totalSales,
  pendingCount,
}: {
  transactions: Transaction[];
  totalRevenue: number;
  totalSales: number;
  pendingCount: number;
}) {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = statusFilter === 'all'
    ? transactions
    : transactions.filter((t) => t.payment_status === statusFilter);

  return (
    <div className="w-full max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Marketplace Transactions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record of all purchases made on the marketplace
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-lg border bg-card">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Sales</p>
          <p className="text-2xl font-bold mt-1">{totalSales}</p>
        </div>
        <div className="p-5 rounded-lg border bg-card">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-bold mt-1">₦{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-lg border bg-card">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold mt-1">{pendingCount}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <p className="text-sm text-muted-foreground">Status:</p>
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

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm py-10 text-center">No transactions found.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Downloads</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{t.product_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.email}</td>
                  <td className="px-4 py-3 text-right">
                    {t.amount_paid_ngn != null ? `₦${t.amount_paid_ngn.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        t.payment_status === 'paid'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : t.payment_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {t.payment_status.charAt(0).toUpperCase() + t.payment_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {t.paid_at
                      ? new Date(t.paid_at).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : new Date(t.created_at).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{t.download_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4">
        Showing {filtered.length} of {transactions.length} total transaction(s)
      </p>
    </div>
  );
}
