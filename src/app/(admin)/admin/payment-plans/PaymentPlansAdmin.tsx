'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PlanRow {
  id: string;
  status: string;
  total_price_ngn: number;
  first_payment_ngn: number;
  balance_ngn: number;
  deadline_at: string;
  courseTitle: string;
  userName: string;
}

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

const statusStyles: Record<string, string> = {
  awaiting_balance: 'bg-yellow-500/10 text-yellow-600',
  completed: 'bg-green-500/10 text-green-600',
  forfeited: 'bg-red-500/10 text-red-600',
};

export default function PaymentPlansAdmin({ plans }: { plans: PlanRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function runAction(planId: string, action: 'extend' | 'mark_paid' | 'forfeit', days?: number): Promise<void> {
    setBusyId(planId);
    try {
      const res = await fetch(`/api/admin/payment-plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, days }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Action failed');
        return;
      }
      toast.success('Done');
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  function extend(planId: string): void {
    const input = prompt('Extend the deadline by how many days?', '7');
    if (!input) return;
    const days = Number(input);
    if (!Number.isFinite(days) || days <= 0) {
      toast.error('Enter a positive number of days');
      return;
    }
    void runAction(planId, 'extend', days);
  }

  if (plans.length === 0) {
    return <p className="text-sm text-muted-foreground">No payment plans yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-2 pr-4">Student</th>
            <th className="py-2 pr-4">Course</th>
            <th className="py-2 pr-4">Paid</th>
            <th className="py-2 pr-4">Balance</th>
            <th className="py-2 pr-4">Deadline</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan.id} className="border-b last:border-0">
              <td className="py-2 pr-4">{plan.userName}</td>
              <td className="py-2 pr-4">{plan.courseTitle}</td>
              <td className="py-2 pr-4">{naira(plan.first_payment_ngn)}</td>
              <td className="py-2 pr-4">{naira(plan.balance_ngn)}</td>
              <td className="py-2 pr-4">{new Date(plan.deadline_at).toLocaleDateString('en-NG')}</td>
              <td className="py-2 pr-4">
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${statusStyles[plan.status] ?? ''}`}>
                  {plan.status.replace('_', ' ')}
                </span>
              </td>
              <td className="py-2 pr-4">
                {plan.status === 'awaiting_balance' && (
                  <div className="flex gap-2">
                    <button
                      disabled={busyId === plan.id}
                      onClick={() => extend(plan.id)}
                      className="rounded border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
                    >
                      Extend
                    </button>
                    <button
                      disabled={busyId === plan.id}
                      onClick={() => void runAction(plan.id, 'mark_paid')}
                      className="rounded border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
                    >
                      Mark paid
                    </button>
                    <button
                      disabled={busyId === plan.id}
                      onClick={() => {
                        if (confirm('Forfeit this plan now? This revokes the student\'s course access immediately.')) {
                          void runAction(plan.id, 'forfeit');
                        }
                      }}
                      className="rounded border border-red-500/30 px-2 py-1 text-xs text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      Forfeit
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
