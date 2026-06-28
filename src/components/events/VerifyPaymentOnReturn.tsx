'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyPaymentOnReturn({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  useEffect(() => {
    if (!reference) return;
    (async () => {
      try {
        const res = await fetch(`/api/events/verify-payment?reference=${encodeURIComponent(reference)}`);
        const data = await res.json() as { whatsapp_url?: string | null };
        const community = data.whatsapp_url ? '?community=1' : '';
        router.replace(`/events/${encodeURIComponent(slug)}/success${community}`);
      } finally {
        router.refresh();
      }
    })();
  }, [reference, router, slug]);

  return null;
}
