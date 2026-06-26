'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyPaymentOnReturn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  useEffect(() => {
    if (!reference) return;
    (async () => {
      try {
        await fetch(`/api/events/verify-payment?reference=${encodeURIComponent(reference)}`);
      } finally {
        router.replace(window.location.pathname);
        router.refresh();
      }
    })();
  }, [reference, router]);

  return null;
}
