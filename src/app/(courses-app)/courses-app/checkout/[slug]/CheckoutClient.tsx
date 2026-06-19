'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCouponCodeFromSearch } from '@/utils/couponLink';
import { calculateSplit, calculateDeadline, isValidPlanPercent } from '@/lib/paymentPlans';

type Props = {
  slug: string;
  priceNgn: number;
  allowPaymentPlan: boolean;
  minPercent: number;
  deadlineDays: number;
};

const naira = (amount: number) => `₦${amount.toLocaleString('en-NG')}`;

export default function CheckoutClient({ slug, priceNgn, allowPaymentPlan, minPercent, deadlineDays }: Props) {
  const router = useRouter();
  const checkoutKey = `aorthar_standalone_checkout_started_${slug}`;
  const dashboardPath =
    typeof window !== 'undefined' && window.location.hostname.startsWith('courses.')
      ? '/courses-app/learn'
      : '/dashboard';

  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponChecked, setCouponChecked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [autoStart, setAutoStart] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [percent, setPercent] = useState(minPercent);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [planSubmitting, setPlanSubmitting] = useState(false);

  const skipChoiceScreen = !allowPaymentPlan || !!couponCode;

  useEffect(() => {
    setCouponCode(getCouponCodeFromSearch(window.location.search));
    setCouponChecked(true);
  }, []);

  async function startCheckout(): Promise<void> {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/standalone/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponCode ? { slug, coupon_code: couponCode } : { slug }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          sessionStorage.removeItem(checkoutKey);
          router.replace(`/courses-app/learn/${slug}`);
          return;
        }
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

  async function startPlanCheckout(): Promise<void> {
    setPlanSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/standalone/checkout-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, percent, terms_accepted: termsAccepted }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          router.replace(`/courses-app/learn/${slug}`);
          return;
        }
        setError(data.error ?? 'Something went wrong. Please try again.');
        setPlanSubmitting(false);
        return;
      }

      window.location.href = data.payment_url;
    } catch {
      setError('Network error. Please try again.');
      setPlanSubmitting(false);
    }
  }

  useEffect(() => {
    if (!couponChecked) return;
    if (!skipChoiceScreen) {
      setLoading(false);
      return;
    }

    const alreadyStarted = sessionStorage.getItem(checkoutKey) === '1';
    if (alreadyStarted) {
      setLoading(false);
      return;
    }

    sessionStorage.setItem(checkoutKey, '1');
    setAutoStart(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponChecked, skipChoiceScreen]);

  useEffect(() => {
    if (!autoStart) return;
    void startCheckout();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  const split = useMemo(() => calculateSplit(priceNgn, percent), [priceNgn, percent]);
  const deadlineLabel = useMemo(
    () => calculateDeadline(new Date(), deadlineDays).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    [deadlineDays],
  );
  const percentValid = isValidPlanPercent(percent, minPercent);

  if (!couponChecked || (loading && skipChoiceScreen)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#18191a' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#a7d252] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Redirecting to payment…</p>
        </div>
      </div>
    );
  }

  if (skipChoiceScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#18191a' }}>
        <div className="text-center">
          {error ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-red-400 text-sm">{error}</p>
              <div className="flex flex-col items-center gap-2">
                <button onClick={() => void startCheckout()} className="text-sm font-medium text-black px-4 py-2 rounded-md transition-opacity hover:opacity-90" style={{ backgroundColor: '#a7d252' }}>
                  Try payment again
                </button>
                <button onClick={() => router.replace(`/courses-app/${slug}`)} className="text-sm text-white/60 hover:text-white underline">
                  Back to course
                </button>
                <button onClick={() => router.replace(dashboardPath)} className="text-sm text-white/60 hover:text-white underline">
                  Go to dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-white/80 text-sm">Payment window was closed.</p>
              <p className="text-white/50 text-xs">Choose what to do next. Checkout will not auto-restart here.</p>
              <div className="flex flex-col items-center gap-2">
                <button onClick={() => void startCheckout()} className="text-sm font-medium text-black px-4 py-2 rounded-md transition-opacity hover:opacity-90" style={{ backgroundColor: '#a7d252' }}>
                  Continue payment
                </button>
                <button onClick={() => router.replace(`/courses-app/${slug}`)} className="text-sm text-white/60 hover:text-white underline">
                  Back to course
                </button>
                <button onClick={() => router.replace(dashboardPath)} className="text-sm text-white/60 hover:text-white underline">
                  Go to dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#18191a' }}>
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 p-6 text-white">
        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        {!showPlanForm ? (
          <div className="flex flex-col gap-3">
            <h1 className="text-lg font-semibold">How would you like to pay?</h1>
            <button
              onClick={() => void startCheckout()}
              className="rounded-md px-4 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#a7d252' }}
            >
              Pay in full — {naira(priceNgn)}
            </button>
            <button
              onClick={() => setShowPlanForm(true)}
              className="rounded-md border border-white/20 px-4 py-3 text-sm font-medium hover:bg-white/10"
            >
              Set up a payment plan
            </button>
            <button onClick={() => router.replace(`/courses-app/${slug}`)} className="text-sm text-white/60 hover:text-white underline">
              Back to course
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h1 className="text-lg font-semibold">Set up your payment plan</h1>
            <label className="text-sm text-white/80">
              Pay now (%)
              <input
                type="number"
                min={minPercent}
                max={99}
                value={percent}
                onChange={(e) => setPercent(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-white"
              />
            </label>
            {!percentValid && (
              <p className="text-xs text-red-400">Percent must be at least {minPercent} and less than 100.</p>
            )}
            <div className="rounded-md bg-white/5 p-3 text-sm text-white/80">
              <p>Pay now: <strong className="text-white">{naira(split.firstPaymentNgn)}</strong></p>
              <p>Remaining: <strong className="text-white">{naira(split.balanceNgn)}</strong> due by <strong className="text-white">{deadlineLabel}</strong></p>
            </div>
            <label className="flex items-start gap-2 text-xs text-white/70">
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5" />
              I understand that if I don&apos;t pay the remaining {naira(split.balanceNgn)} by {deadlineLabel}, I forfeit the {naira(split.firstPaymentNgn)} I&apos;m paying now and lose access to this course.
            </label>
            <button
              onClick={() => void startPlanCheckout()}
              disabled={!percentValid || !termsAccepted || planSubmitting}
              className="rounded-md px-4 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#a7d252' }}
            >
              {planSubmitting ? 'Starting…' : 'Continue to payment'}
            </button>
            <button onClick={() => setShowPlanForm(false)} className="text-sm text-white/60 hover:text-white underline">
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
