'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PricingButtonProps {
  planId?: string;
  planType: string;
  label: string;
}

export default function PricingButton({ planId, planType, label }: PricingButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      toast.error('Failed to initiate payment');
      return;
    }

    window.location.href = data.data.authorization_url;
  }

  return (
    <Button className="w-full" onClick={handleClick} disabled={loading}>
      {loading ? 'Redirecting...' : label}
    </Button>
  );
}
