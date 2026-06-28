'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

type Props = {
  eventTitle: string;
  eventUrl: string;
  communityUrl: string | null;
  shouldRedirectToCommunity: boolean;
};

export default function EventSuccessClient({
  eventTitle,
  eventUrl,
  communityUrl,
  shouldRedirectToCommunity,
}: Props) {
  const [countdown, setCountdown] = useState(3);
  const canRedirect = shouldRedirectToCommunity && Boolean(communityUrl);

  useEffect(() => {
    if (!canRedirect) return;

    const interval = window.setInterval(() => {
      setCountdown((current) => Math.max(0, current - 1));
    }, 1000);

    const timeout = window.setTimeout(() => {
      window.location.href = communityUrl as string;
    }, 3200);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [canRedirect, communityUrl]);

  async function copyEventLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(eventUrl);
      toast.success('Event link copied');
    } catch {
      toast.error('Could not copy link');
    }
  }

  async function shareEvent(): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
          text: `Join me for ${eventTitle}`,
          url: eventUrl,
        });
        return;
      } catch {
        return;
      }
    }

    await copyEventLink();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
        </svg>
      </div>

      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Registration confirmed</p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Thanks for registering.</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
        We&apos;ve sent an email with your event link and calendar invite. You can also share this event with friends who should join.
      </p>

      {canRedirect && (
        <div className="mt-6 rounded-lg border bg-card px-5 py-4 text-sm">
          <p className="font-medium">Redirecting you to the WhatsApp community</p>
          <p className="mt-1 text-muted-foreground">Opening in {countdown}...</p>
        </div>
      )}

      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <button
          type="button"
          onClick={() => void shareEvent()}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Share event
        </button>
        <button
          type="button"
          onClick={() => void copyEventLink()}
          className="inline-flex min-h-11 items-center justify-center rounded-md border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
        >
          Copy link
        </button>
      </div>

      <Link href={eventUrl} className="mt-6 text-sm font-medium text-muted-foreground hover:text-foreground">
        Back to event
      </Link>
    </div>
  );
}
