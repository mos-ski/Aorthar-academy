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
        const res = await fetch(`/api/events/verify-payment?reference=${encodeURIComponent(reference)}`);
        const data = await res.json() as { whatsapp_url?: string | null };
        if (data.whatsapp_url) {
          window.setTimeout(() => {
            window.location.href = data.whatsapp_url as string;
          }, 1200);
        }
      } finally {
        router.replace(window.location.pathname);
        router.refresh();
      }
    })();
  }, [reference, router]);

  return null;
}
