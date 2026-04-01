'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function CheckoutPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [autoStart, setAutoStart] = useState(false);

  const slug = params.slug;
  const checkoutKey = `aorthar_standalone_checkout_started_${slug}`;
  const dashboardPath =
    typeof window !== 'undefined' && window.location.hostname.startsWith('courses.')
      ? '/courses-app/learn'
      : '/dashboard';

  async function startCheckout(): Promise<void> {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/standalone/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Already purchased — go to learn
        if (res.status === 409) {
          sessionStorage.removeItem(checkoutKey);
          router.replace(`/courses-app/learn/${slug}`);
          return;
        }
        setError(data.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      // Redirect to Paystack
      window.location.href = data.payment_url;
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  useEffect(() => {
    const alreadyStarted = sessionStorage.getItem(checkoutKey) === '1';
    if (alreadyStarted) {
      setLoading(false);
      return;
    }

    sessionStorage.setItem(checkoutKey, '1');
    setAutoStart(true);
  }, [checkoutKey]);

  useEffect(() => {
    if (!autoStart) return;
    void startCheckout();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#18191a' }}>
      <div className="text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#a7d252] border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60 text-sm">Redirecting to payment…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-red-400 text-sm">{error}</p>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => void startCheckout()}
                className="text-sm font-medium text-black px-4 py-2 rounded-md transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#a7d252' }}
              >
                Try payment again
              </button>
              <button
                onClick={() => router.replace(`/courses-app/${slug}`)}
                className="text-sm text-white/60 hover:text-white underline"
              >
                Back to course
              </button>
              <button
                onClick={() => router.replace(dashboardPath)}
                className="text-sm text-white/60 hover:text-white underline"
              >
                Go to dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-white/80 text-sm">Payment window was closed.</p>
            <p className="text-white/50 text-xs">
              Choose what to do next. Checkout will not auto-restart here.
            </p>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => void startCheckout()}
                className="text-sm font-medium text-black px-4 py-2 rounded-md transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#a7d252' }}
              >
                Continue payment
              </button>
              <button
                onClick={() => router.replace(`/courses-app/${slug}`)}
                className="text-sm text-white/60 hover:text-white underline"
              >
                Back to course
              </button>
              <button
                onClick={() => router.replace(dashboardPath)}
                className="text-sm text-white/60 hover:text-white underline"
              >
                Go to dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
