'use client';

import { useState } from 'react';

interface Props {
  planId: string;
  balanceNgn: number;
  deadlineAt: string;
}

export default function PaymentPlanBanner({ planId, balanceNgn, deadlineAt }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const deadlineLabel = new Date(deadlineAt).toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  async function payNow(): Promise<void> {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/standalone/checkout-plan-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
      window.location.href = data.payment_url;
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2.5 text-sm shrink-0"
      style={{ backgroundColor: 'rgba(167,210,82,0.1)', borderBottom: '1px solid rgba(167,210,82,0.25)', color: '#fff' }}
    >
      <span>
        ₦{balanceNgn.toLocaleString('en-NG')} due by <strong>{deadlineLabel}</strong> — pay the rest to keep your access.
      </span>
      <div className="flex items-center gap-3">
        {error && <span className="text-xs text-red-400">{error}</span>}
        <button
          onClick={() => void payNow()}
          disabled={loading}
          className="rounded-md px-3 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: '#a7d252' }}
        >
          {loading ? 'Redirecting…' : 'Pay now'}
        </button>
      </div>
    </div>
  );
}
