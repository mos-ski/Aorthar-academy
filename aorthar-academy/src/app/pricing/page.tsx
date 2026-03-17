import { createClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/demo/mode';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PricingCards from '@/components/PricingCards';
import type { Transaction } from '@/types';

// Shown when the `plans` table is empty (e.g. pre-migration dev setup).
// Prices are display-only; checkout will fail gracefully until plans are seeded.
const FALLBACK_PLANS = [
  { id: '', name: 'Standard', price: 20000, currency: 'NGN', plan_type: 'standard', billing_type: 'one_time' },
  { id: '', name: 'Mentorship', price: 30000, currency: 'NGN', plan_type: 'mentorship', billing_type: 'one_time' },
];

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'demo-tx-1',
    user_id: 'demo',
    paystack_reference: 'AORTHAR_STD_20260115_DEMO',
    amount: 2000000,
    currency: 'NGN',
    plan_type: 'standard',
    status: 'success',
    raw_payload: {},
    created_at: '2026-01-15T09:22:00Z',
  },
  {
    id: 'demo-tx-2',
    user_id: 'demo',
    paystack_reference: 'AORTHAR_STD_20251203_DEMO',
    amount: 2000000,
    currency: 'NGN',
    plan_type: 'standard',
    status: 'failed',
    raw_payload: {},
    created_at: '2025-12-03T14:05:00Z',
  },
  {
    id: 'demo-tx-3',
    user_id: 'demo',
    paystack_reference: 'AORTHAR_STD_20251204_DEMO',
    amount: 2000000,
    currency: 'NGN',
    plan_type: 'standard',
    status: 'pending',
    raw_payload: {},
    created_at: '2025-12-04T08:30:00Z',
  },
];

export default async function PricingPage() {
  const supabase = await createClient();
  const demo = await isDemoMode();

  // Auth is optional — page is public
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);

  const [{ data: plans }, { data: subscription }, { data: transactions }] = await Promise.all([
    supabase.from('plans').select('*').order('price'),
    user
      ? supabase
          .from('subscriptions')
          .select('id, plan_id, status, plans(name, plan_type)')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from('transactions')
          .select('id, paystack_reference, amount, currency, plan_type, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)
      : Promise.resolve({ data: null }),
  ]);

  const activePlanType = (subscription?.plans as unknown as { plan_type: string } | null)?.plan_type ?? null;

  // Use fallback plans when the table is empty (e.g. pre-migration dev)
  const resolvedPlans = (plans && plans.length > 0)
    ? (plans as { id: string; name: string; price: number; currency: string; plan_type: string; billing_type: string }[])
    : FALLBACK_PLANS;

  // In demo mode, show sample payment history so the UI can be previewed
  const resolvedTransactions: Transaction[] = demo && isLoggedIn
    ? DEMO_TRANSACTIONS
    : ((transactions ?? []) as Transaction[]);

  return (
    <div className="min-h-screen bg-background py-16 px-[15%]">
      <div className="space-y-12">

        {/* Header */}
        <div className="relative text-center space-y-3">
          {isLoggedIn && (
            <Link
              href="/dashboard"
              className="absolute left-0 top-1 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          )}
          <Badge variant="outline">Pricing</Badge>
          <h1 className="text-4xl font-bold">Unlock your full potential</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Free for Year 100. One payment to unlock Years 200–400.
          </p>
          {isLoggedIn && activePlanType && (
            <Badge className="bg-green-500/10 text-green-700 border-green-200 dark:text-green-400 border">
              You are on an active paid plan
            </Badge>
          )}
        </div>

        {/* Plan cards + mentorship add-on */}
        <PricingCards
          plans={resolvedPlans}
          isLoggedIn={isLoggedIn}
          activePlanType={activePlanType}
        />

        {/* Payment History — logged-in users only */}
        {isLoggedIn && (
          <div className="space-y-4">
            <Separator />
            <div>
              <h2 className="text-xl font-semibold">Payment History</h2>
              <p className="text-sm text-muted-foreground mt-1">Your past transactions with Aorthar Academy.</p>
            </div>

            {resolvedTransactions.length > 0 ? (
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Reference</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resolvedTransactions.map((tx) => (
                      <tr key={tx.id} className="border-t">
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(tx.created_at)}</td>
                        <td className="px-4 py-3 capitalize">{tx.plan_type}</td>
                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                          {formatCurrency(tx.amount / 100, tx.currency)}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">
                          {tx.paystack_reference}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              tx.status === 'success'
                                ? 'default'
                                : tx.status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                            }
                            className="capitalize"
                          >
                            {tx.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">No payment history yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
