'use client';

import { useState } from 'react';

const CATEGORY_LABELS: Record<string, string> = {
  pdf: 'PDF',
  template: 'Template',
  guide: 'Guide',
  toolkit: 'Toolkit',
  other: 'Resource',
};

export default function CheckoutForm({
  slug,
  productName,
  priceNgn,
  category,
}: {
  slug: string;
  productName: string;
  priceNgn: number;
  category: string;
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/marketplace/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), slug }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      if (data.already_purchased && data.download_token) {
        // Already paid — send them straight to download
        window.location.href = `/api/marketplace/download?token=${data.download_token}`;
        return;
      }

      if (data.payment_url) {
        window.location.href = data.payment_url;
        return;
      }

      setError('Unexpected response. Please try again.');
      setLoading(false);
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  }

  const priceLabel = priceNgn === 0 ? 'Free' : `₦${priceNgn.toLocaleString('en-NG')}`;
  const categoryLabel = CATEGORY_LABELS[category] ?? 'Resource';

  return (
    <div
      className="p-6 rounded-xl"
      style={{ backgroundColor: '#1c1c1c', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: '#a7d252' }}>
        {categoryLabel}
      </p>
      <p className="text-[28px] font-semibold mb-1 leading-tight" style={{ letterSpacing: '-0.02em' }}>
        {priceLabel}
      </p>
      <p className="text-[14px] mb-6" style={{ color: '#b1b1b1' }}>
        One-time payment — instant download link
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-white">Your email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@email.com"
            className="w-full px-4 py-3 text-[15px] text-white placeholder-white/30 outline-none transition-colors"
            style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.12)' }}
          />
        </div>

        {error && (
          <p className="text-[13px]" style={{ color: '#f87171' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#08694a', color: '#ffffff' }}
        >
          {loading ? 'Redirecting to payment…' : `Buy ${productName} — ${priceLabel} →`}
        </button>
      </form>

      <p className="text-[12px] mt-4 text-center" style={{ color: '#6b7280' }}>
        Secured by Paystack · Download link sent to your email
      </p>
    </div>
  );
}
