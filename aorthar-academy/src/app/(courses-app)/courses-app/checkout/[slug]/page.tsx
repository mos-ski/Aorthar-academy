'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function CheckoutPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    async function initCheckout() {
      try {
        const res = await fetch('/api/standalone/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: params.slug }),
        });
        const data = await res.json();
        if (!res.ok) {
          // Already purchased — go to learn
          if (res.status === 409) {
            router.replace(`/courses-app/learn/${params.slug}`);
            return;
          }
          setError(data.error ?? 'Something went wrong. Please try again.');
          return;
        }
        // Redirect to Paystack
        window.location.href = data.payment_url;
      } catch {
        setError('Network error. Please try again.');
      }
    }
    initCheckout();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#18191a' }}>
      <div className="text-center">
        {error ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => router.back()}
              className="text-sm text-white/60 hover:text-white underline"
            >
              Go back
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#a7d252] border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60 text-sm">Redirecting to payment…</p>
          </div>
        )}
      </div>
    </div>
  );
}
