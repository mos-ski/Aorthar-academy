'use client';

import { useState } from 'react';

interface Props {
  slug: string;
  priceNgn: number;
  communityEnabled: boolean;
}

type RegistrationResponse = {
  ok?: boolean;
  registered?: boolean;
  alreadyRegistered?: boolean;
  payment_url?: string;
  whatsapp_url?: string | null;
  error?: string;
};

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export default function RegisterButton({ slug, priceNgn, communityEnabled }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [wantsCommunity, setWantsCommunity] = useState(communityEnabled);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          first_name: firstName,
          last_name: lastName,
          email,
          whatsapp_number: whatsappNumber,
          wants_whatsapp_community: wantsCommunity,
        }),
      });
      const data = await res.json() as RegistrationResponse;

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      if (data.payment_url) {
        window.location.href = data.payment_url;
        return;
      }

      const community = data.whatsapp_url ? '?community=1' : '';
      window.location.href = `/events/${encodeURIComponent(slug)}/success${community}`;
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="webinar-first-name">First name</label>
          <input
            id="webinar-first-name"
            className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="webinar-last-name">Last name</label>
          <input
            id="webinar-last-name"
            className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="webinar-email">Email address</label>
        <input
          id="webinar-email"
          type="email"
          className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="webinar-whatsapp">WhatsApp number</label>
        <input
          id="webinar-whatsapp"
          type="tel"
          className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
          value={whatsappNumber}
          onChange={(event) => setWhatsappNumber(event.target.value)}
          placeholder="+234..."
          required
        />
      </div>

      {communityEnabled && (
        <label className="flex items-start gap-3 rounded-md border bg-muted/30 p-3 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={wantsCommunity}
            onChange={(event) => setWantsCommunity(event.target.checked)}
          />
          <span>
            <span className="font-medium">Add me to the WhatsApp community</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">We&apos;ll open the community invite after registration.</span>
          </span>
        </label>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-center text-sm font-semibold leading-snug text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? 'Registering...' : priceNgn > 0 ? `Continue to payment - ${naira(priceNgn)}` : 'Register for free'}
      </button>
    </form>
  );
}
