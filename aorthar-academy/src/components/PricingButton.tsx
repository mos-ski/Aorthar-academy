'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PricingButtonProps {
  planId?: string;
  planType: string;
  label: string;
  /** 'cta' = normal pay CTA | 'login' = redirect to login first | 'active' = already subscribed | 'current' = free/current plan */
  state?: 'cta' | 'login' | 'active' | 'current';
  href?: string;
}

export default function PricingButton({ planId, planType, label, state = 'cta', href }: PricingButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Static states — no interaction needed
  if (state === 'active') {
    return (
      <Button className="w-full" variant="outline" disabled>
        {label}
      </Button>
    );
  }

  if (state === 'current') {
    return (
      <Button className="w-full" variant="secondary" disabled>
        {label}
      </Button>
    );
  }

  if (state === 'login') {
    return (
      <Button className="w-full" asChild>
        <Link href={`/login?return=/pricing`}>{label}</Link>
      </Button>
    );
  }

  // state === 'cta'
  if (href) {
    return (
      <Button className="w-full" asChild>
        <Link href={href}>{label}</Link>
      </Button>
    );
  }

  async function handleClick() {
    if (planType === 'free') {
      router.push('/register');
      return;
    }

    if (!planId) return;

    setLoading(true);
    const res = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: planId }),
    });

    const data = await res.json() as { data?: { authorization_url: string }; error?: string };
    setLoading(false);

    if (!res.ok) {
      if (res.status === 401) {
        router.push('/login?return=/pricing');
        return;
      }
      toast.error(data.error ?? 'Failed to initiate payment. Please try again.');
      return;
    }

    if (data.data?.authorization_url) {
      window.location.href = data.data.authorization_url;
    }
  }

  return (
    <Button className="w-full" onClick={handleClick} disabled={loading}>
      {loading ? 'Redirecting to payment...' : label}
    </Button>
  );
}
