'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PricingCheckoutPage() {
  const params = useParams<{ planId: string }>();
  const router = useRouter();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [autoStart, setAutoStart] = useState(false);

  const planId = params.planId;
  const checkoutKey = `aorthar_pricing_checkout_started_${planId}`;

  async function startCheckout(): Promise<void> {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      });
      const data = await res.json() as { data?: { authorization_url: string }; error?: string };

      if (!res.ok) {
        if (res.status === 401) {
          router.replace(`/login?return=${encodeURIComponent(`/pricing/checkout/${planId}`)}`);
          return;
        }

        setError(data.error ?? 'Failed to initiate payment. Please try again.');
        setLoading(false);
        return;
      }

      if (!data.data?.authorization_url) {
        setError('No payment link was returned. Please try again.');
        setLoading(false);
        return;
      }

      window.location.href = data.data.authorization_url;
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
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-md">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Redirecting to payment…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-destructive text-sm">{error}</p>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => void startCheckout()}
                className="text-sm font-medium text-primary-foreground px-4 py-2 rounded-md bg-primary transition-opacity hover:opacity-90"
              >
                Try payment again
              </button>
              <button
                onClick={() => router.replace('/pricing')}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Back to pricing
              </button>
              <button
                onClick={() => router.replace('/dashboard')}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Go to dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-foreground text-sm">Payment window was closed.</p>
            <p className="text-muted-foreground text-xs">
              Choose what to do next. Checkout will not auto-restart here.
            </p>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => void startCheckout()}
                className="text-sm font-medium text-primary-foreground px-4 py-2 rounded-md bg-primary transition-opacity hover:opacity-90"
              >
                Continue payment
              </button>
              <button
                onClick={() => router.replace('/pricing')}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Back to pricing
              </button>
              <button
                onClick={() => router.replace('/dashboard')}
                className="text-sm text-muted-foreground hover:text-foreground underline"
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
