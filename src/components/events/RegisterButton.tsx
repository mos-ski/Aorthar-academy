'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Props {
  slug: string;
  priceNgn: number;
  isLoggedIn: boolean;
  alreadyRegistered: boolean;
  joinUrl: string;
}

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export default function RegisterButton({ slug, priceNgn, isLoggedIn, alreadyRegistered, joinUrl }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(alreadyRegistered);

  async function handleRegister() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.alreadyRegistered) {
          setRegistered(true);
          return;
        }
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      if (data.payment_url) {
        window.location.href = data.payment_url;
        return;
      }

      setRegistered(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (registered) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-green-700 dark:text-green-400">You&apos;re registered for this class.</p>
        <a
          href={joinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full text-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Join the class →
        </a>
      </div>
    );
  }

  if (!isLoggedIn) {
    const next = `/events/${slug}`;
    return (
      <Link
        href={`/register?next=${encodeURIComponent(next)}`}
        className="block w-full text-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Sign up to register
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        onClick={() => void handleRegister()}
        disabled={submitting}
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? 'Please wait…' : priceNgn > 0 ? `Register — ${naira(priceNgn)}` : 'Register for free'}
      </button>
    </div>
  );
}
