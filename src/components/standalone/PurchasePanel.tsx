'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { calculateSplit, calculateDeadline, isValidPlanPercent } from '@/lib/paymentPlans';

type Coupon = { code: string; discount_type: string; discount_value: number };

interface Props {
  slug: string;
  priceNgn: number;
  thumbnailUrl: string | null;
  courseTitle?: string;
  courseDescription?: string;
  lessonsCount: number;
  allowPaymentPlan: boolean;
  minPercent: number;
  deadlineDays: number;
  isLoggedIn: boolean;
  showCoupon?: boolean;
  // Controlled coupon state — owned by the caller so other CTAs on the page
  // (e.g. a preview paywall) can stay in sync with the applied discount.
  couponInput?: string;
  onCouponInputChange?: (value: string) => void;
  appliedCoupon?: Coupon | null;
  couponLoading?: boolean;
  couponError?: string;
  autoApplied?: boolean;
  urlCouponNotice?: string;
  onApplyCoupon?: () => void;
  onRemoveCoupon?: () => void;
}

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export default function PurchasePanel({
  slug,
  priceNgn,
  thumbnailUrl,
  courseTitle,
  courseDescription,
  lessonsCount,
  allowPaymentPlan,
  minPercent,
  deadlineDays,
  isLoggedIn,
  showCoupon = true,
  couponInput = '',
  onCouponInputChange,
  appliedCoupon = null,
  couponLoading = false,
  couponError = '',
  autoApplied = false,
  urlCouponNotice = '',
  onApplyCoupon,
  onRemoveCoupon,
}: Props) {
  const [method, setMethod] = useState<'full' | 'plan'>('full');
  const [percent, setPercent] = useState(minPercent);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const discountedPrice = appliedCoupon
    ? appliedCoupon.discount_type === 'percentage'
      ? Math.max(0, Math.round(priceNgn * (1 - appliedCoupon.discount_value / 100)))
      : Math.max(0, appliedCoupon.discount_value)
    : priceNgn;

  const split = calculateSplit(priceNgn, percent);
  const deadlineLabel = calculateDeadline(new Date(), deadlineDays).toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const percentValid = isValidPlanPercent(percent, minPercent);

  const checkoutPath = `/courses-app/checkout/${slug}`;
  const checkoutNext = appliedCoupon ? `${checkoutPath}?coupon=${encodeURIComponent(appliedCoupon.code)}` : checkoutPath;
  const registerHref = `/register?next=${encodeURIComponent(checkoutNext)}`;
  const loginHref = `/login?next=${encodeURIComponent(checkoutNext)}`;

  async function handleSubmit(): Promise<void> {
    setSubmitting(true);
    setSubmitError('');
    try {
      const endpoint = method === 'full' ? '/api/standalone/checkout' : '/api/standalone/checkout-plan';
      const body =
        method === 'full'
          ? (appliedCoupon ? { slug, coupon_code: appliedCoupon.code } : { slug })
          : { slug, percent, terms_accepted: termsAccepted };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          window.location.href = `/courses-app/learn/${slug}`;
          return;
        }
        setSubmitError(data.error ?? 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }

      window.location.href = data.payment_url;
    } catch {
      setSubmitError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  const ctaLabel =
    method === 'full'
      ? isLoggedIn ? 'Buy this course' : 'Sign up & enroll'
      : isLoggedIn ? 'Continue to payment' : 'Sign up to continue';
  const ctaDisabled = method === 'plan' && (!percentValid || !termsAccepted);
  const aboutText = courseDescription?.trim();

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#18191a' }}>
      {(thumbnailUrl || aboutText) && (
        <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {thumbnailUrl && (
            <div className="relative aspect-video w-full">
              <Image src={thumbnailUrl} alt={courseTitle ?? 'Course thumbnail'} fill className="object-cover" unoptimized />
            </div>
          )}

          {aboutText && (
            <div className="px-5 py-4">
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">About this course</h3>
              <p className={`text-xs leading-relaxed text-white/55 whitespace-pre-wrap ${aboutExpanded ? '' : 'line-clamp-3'}`}>
                {aboutText}
              </p>
              <button
                type="button"
                onClick={() => setAboutExpanded((current) => !current)}
                className="mt-2 text-xs font-bold transition-opacity hover:opacity-75"
                style={{ color: '#a7d252' }}
              >
                {aboutExpanded ? 'See less' : 'See more'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="p-5 flex flex-col gap-4">
        {/* Price */}
        <div>
          {method === 'full' && appliedCoupon ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{naira(discountedPrice)}</span>
              <span className="text-sm text-white/30 line-through">{naira(priceNgn)}</span>
            </div>
          ) : method === 'full' ? (
            <span className="text-2xl font-bold text-white">{naira(priceNgn)}</span>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{naira(split.firstPaymentNgn)}</span>
              <span className="text-sm text-white/40">now</span>
            </div>
          )}
          <p className="text-xs text-white/40 mt-1">Lifetime access · {lessonsCount} lessons</p>
        </div>

        {/* Payment method */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-white/85 cursor-pointer">
            <input type="radio" name={`payment-method-${slug}`} checked={method === 'full'} onChange={() => setMethod('full')} />
            Pay in full — {naira(priceNgn)}
          </label>
          {allowPaymentPlan && (
            <label className="flex items-center gap-2 text-sm text-white/85 cursor-pointer">
              <input type="radio" name={`payment-method-${slug}`} checked={method === 'plan'} onChange={() => setMethod('plan')} />
              Payment plan — from {naira(Math.round(priceNgn * (minPercent / 100)))} now
            </label>
          )}
        </div>

        {/* Payment plan details */}
        {method === 'plan' && (
          <div className="flex flex-col gap-3 pl-1 border-l" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <label className="text-xs text-white/60">
              Pay now (%)
              <input
                type="number"
                min={minPercent}
                max={99}
                value={percent}
                onChange={(e) => setPercent(Number(e.target.value))}
                className="mt-1 ml-3 w-20 rounded-md border border-white/20 bg-transparent px-2 py-1 text-sm text-white"
              />
            </label>
            {!percentValid && (
              <p className="text-xs text-red-400">Percent must be at least {minPercent} and less than 100.</p>
            )}
            <p className="text-xs text-white/50">
              Remaining {naira(split.balanceNgn)} due by <strong className="text-white/70">{deadlineLabel}</strong>
            </p>
            <label className="flex items-start gap-2 text-xs text-white/60">
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5" />
              I understand that if I don&apos;t pay the remaining {naira(split.balanceNgn)} by {deadlineLabel}, I forfeit the {naira(split.firstPaymentNgn)} I&apos;m paying now and lose access to this course.
            </label>
          </div>
        )}

        {submitError && <p className="text-xs text-red-400">{submitError}</p>}

        {/* CTA */}
        {isLoggedIn ? (
          <button
            onClick={() => void handleSubmit()}
            disabled={ctaDisabled || submitting}
            className="w-full py-2.5 font-bold text-black text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: '#a7d252' }}
          >
            {submitting ? 'Please wait…' : ctaLabel}
          </button>
        ) : (
          <Link
            href={registerHref}
            className="block w-full py-2.5 font-bold text-black text-sm text-center transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#a7d252' }}
          >
            {ctaLabel}
          </Link>
        )}

        {!isLoggedIn && (
          <Link href={loginHref} className="text-xs text-white/30 hover:text-white/60 text-center transition-colors">
            Already have an account?
          </Link>
        )}

        {/* Coupon */}
        {showCoupon && method === 'full' && (
          <div className="pt-3 border-t flex flex-col gap-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-semibold text-white/50">Apply Coupon</p>

            {appliedCoupon ? (
              <div className={`flex items-center justify-between text-xs ${autoApplied ? 'coupon-pulse' : ''}`} style={{ color: '#a7d252' }}>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono font-bold">{appliedCoupon.code}</span>
                  <span>applied</span>
                  <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(167,210,82,0.15)' }}>
                    -{appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : naira(appliedCoupon.discount_value)}
                  </span>
                </div>
                <button onClick={onRemoveCoupon} className="text-white/40 hover:text-white/60 transition-colors">Remove</button>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => onCouponInputChange?.(e.target.value.toUpperCase())}
                    onKeyDown={(e) => { if (e.key === 'Enter') onApplyCoupon?.(); }}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-1.5 text-sm bg-white/5 border rounded text-white placeholder-white/25"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                  />
                  <button
                    onClick={onApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-3 py-1.5 text-xs font-medium rounded border transition-colors disabled:opacity-40"
                    style={{ borderColor: '#a7d252', color: '#a7d252' }}
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-400">{couponError}</p>}
                {urlCouponNotice && <p className="text-xs text-amber-400">{urlCouponNotice}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
