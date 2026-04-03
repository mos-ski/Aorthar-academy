'use client';

import { useState } from 'react';

interface Props {
  slug: string;
  label: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function BuyButton({ slug, label, className, style }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/standalone/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Already purchased → go to learn page
        if (res.status === 409) {
          window.location.href = `/courses-app/learn/${slug}`;
          return;
        }
        setError(data.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else if (data.redirect) {
        window.location.href = data.redirect;
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={handleBuy}
        disabled={loading}
        className={className}
        style={style}
      >
        {loading ? 'Please wait...' : label}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
