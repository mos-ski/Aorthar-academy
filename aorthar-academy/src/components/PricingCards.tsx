'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/formatters';
import PricingButton from '@/components/PricingButton';

const FREE_FEATURES = [
  'Year 100 access (both semesters)',
  'All free courses',
  'Basic GPA tracking',
  'Suggest content',
];

const STANDARD_FEATURES = [
  'Everything in Free',
  'Years 200–400 full access',
  'Full GPA & transcript history',
  'Capstone submission eligibility',
  'Certificate of completion',
];

const MENTORSHIP_FEATURES = [
  'Dedicated mentor',
  'Weekly check-ins & accountability sessions',
  'Priority support',
];

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  plan_type: string;
  billing_type: string;
}

interface PricingCardsProps {
  plans: Plan[];
  isLoggedIn: boolean;
  /** 'standard' | 'mentorship' | null */
  activePlanType: string | null;
}

export default function PricingCards({ plans, isLoggedIn, activePlanType }: PricingCardsProps) {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [mentorshipSelected, setMentorshipSelected] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const isStandardActive = activePlanType === 'standard' || activePlanType === 'mentorship';
  const isMentorshipActive = activePlanType === 'mentorship';

  const standardPlan = plans.find((p) => p.plan_type === 'standard');
  const mentorshipPlan = plans.find((p) => p.plan_type === 'mentorship');

  async function initiateCheckout(planId: string) {
    if (!planId) {
      toast.error('Payment is not yet configured. Please seed the plans table.');
      return;
    }
    setCheckoutLoading(true);
    const res = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: planId }),
    });
    const data = await res.json() as { data?: { authorization_url: string }; error?: string };
    setCheckoutLoading(false);
    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = '/login?return=/pricing';
        return;
      }
      toast.error(data.error ?? 'Failed to initiate payment. Please try again.');
      return;
    }
    if (data.data?.authorization_url) {
      window.location.href = data.data.authorization_url;
    }
  }

  const standardPrice = standardPlan
    ? formatCurrency(standardPlan.price, standardPlan.currency)
    : '₦20,000';

  const mentorshipPrice = mentorshipPlan
    ? formatCurrency(mentorshipPlan.price, mentorshipPlan.currency)
    : '₦30,000';

  const bundlePrice = (standardPlan && mentorshipPlan)
    ? formatCurrency(standardPlan.price + mentorshipPlan.price, standardPlan.currency)
    : '₦50,000';

  return (
    <>
      {/* 2-card grid */}
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

        {/* Free */}
        <Card className={isLoggedIn && !activePlanType ? 'ring-1 ring-primary' : ''}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>Free</CardTitle>
              {isLoggedIn && !activePlanType && <Badge variant="secondary">Current Plan</Badge>}
            </div>
            <CardDescription>Everything you need to start</CardDescription>
            <p className="text-3xl font-bold">₦0</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <PricingButton
              planType="free"
              label={isLoggedIn ? 'Your current plan' : 'Get Started Free'}
              state={isLoggedIn ? 'current' : 'cta'}
              href={isLoggedIn ? undefined : '/register'}
            />
          </CardFooter>
        </Card>

        {/* Standard */}
        <Card
          className={[
            'border-primary shadow-md',
            isStandardActive ? 'ring-1 ring-green-500' : '',
          ].filter(Boolean).join(' ')}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>{standardPlan?.name ?? 'Standard'}</CardTitle>
              <div className="flex gap-1.5">
                {!isStandardActive && <Badge>Most Popular</Badge>}
                {isStandardActive && (
                  <Badge className="bg-green-500/10 text-green-700 border-green-200 border dark:text-green-400">
                    Active
                  </Badge>
                )}
              </div>
            </div>
            <CardDescription>One-time payment · Years 200–400</CardDescription>
            <p className="text-3xl font-bold">{standardPrice}</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {STANDARD_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {isStandardActive ? (
              <Button className="w-full" variant="outline" disabled>Active</Button>
            ) : !isLoggedIn ? (
              <Button className="w-full" asChild>
                <Link href="/login?return=/pricing">Pay {standardPrice}</Link>
              </Button>
            ) : (
              <Button className="w-full" onClick={() => setUpgradeModalOpen(true)}>
                Upgrade Now
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Mentorship add-on row — Standard students only */}
      {isLoggedIn && isStandardActive && (
        <div className="max-w-3xl mx-auto">
          {isMentorshipActive ? (
            <div className="flex items-center justify-between rounded-lg border px-4 py-3 bg-green-500/5 border-green-200 dark:border-green-900">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Mentorship</p>
                  <p className="text-xs text-muted-foreground">
                    Dedicated mentor · Weekly check-ins · Priority support
                  </p>
                </div>
              </div>
              <Badge className="bg-green-500/10 text-green-700 border-green-200 border dark:text-green-400 shrink-0">
                Active
              </Badge>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border px-4 py-3 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <GraduationCap className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    Mentorship add-on
                    <span className="ml-2 font-bold">{mentorshipPrice}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Dedicated mentor · Weekly check-ins · Priority support
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => initiateCheckout(mentorshipPlan?.id ?? '')}
                disabled={checkoutLoading}
                className="shrink-0"
              >
                {checkoutLoading ? 'Redirecting...' : 'Add →'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Upgrade to Standard — modal with Mentorship upsell */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to Standard</DialogTitle>
            <DialogDescription>
              {mentorshipSelected && mentorshipPlan
                ? `${standardPrice} for Standard + ${mentorshipPrice} for Mentorship — paid as two separate transactions.`
                : `One-time payment of ${standardPrice} — access yours forever.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <ul className="space-y-1.5">
              {STANDARD_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {/* Mentorship upsell toggle */}
            {mentorshipPlan && (
              <button
                type="button"
                onClick={() => setMentorshipSelected((v) => !v)}
                className={[
                  'w-full text-left rounded-lg border p-3 transition-colors',
                  mentorshipSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <span
                      className={[
                        'inline-flex items-center justify-center w-4 h-4 rounded border shrink-0 mt-0.5',
                        mentorshipSelected
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground bg-background',
                      ].join(' ')}
                    >
                      {mentorshipSelected && (
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 12 12">
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Also add Mentorship</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {MENTORSHIP_FEATURES.join(' · ')}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold shrink-0">{mentorshipPrice}</span>
                </div>
                {mentorshipSelected && (
                  <p className="text-xs text-muted-foreground mt-2 ml-6">
                    Mentorship is a separate {mentorshipPrice} payment. You&apos;ll see it on the pricing page right after upgrading.
                  </p>
                )}
              </button>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setUpgradeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setUpgradeModalOpen(false);
                initiateCheckout(standardPlan?.id ?? '');
              }}
              disabled={checkoutLoading}
              className="flex-1"
            >
              {checkoutLoading
                ? 'Redirecting...'
                : `Pay ${mentorshipSelected && mentorshipPlan ? bundlePrice : standardPrice}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
