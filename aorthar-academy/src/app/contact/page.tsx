'use client';

import { FormEvent, useMemo, useState } from 'react';
import InfoPageShell from '@/components/landing/InfoPageShell';

function buildMailto(subject: string, body: string): string {
  const query = new URLSearchParams({ subject, body });
  return `mailto:hello@aorthar.com?${query.toString()}`;
}

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const mailtoUrl = useMemo(() => {
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    return buildMailto('Aorthar Contact Request', body);
  }, [name, email, message]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSubmitted(true);
    window.location.href = mailtoUrl;
  }

  return (
    <InfoPageShell
      eyebrow="Contact"
      title="Get in touch"
      subtitle="Reach the Aorthar team directly. Form details are sent to hello@aorthar.com."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Your name" className="w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#a7d252] focus:outline-none" />
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" className="w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#a7d252] focus:outline-none" />
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} required rows={6} placeholder="Tell us what you need..." className="w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#a7d252] focus:outline-none" />
        <button type="submit" className="rounded-md bg-[#a7d252] px-5 py-2.5 text-sm font-semibold text-black transition hover:opacity-90">Send to hello@aorthar.com</button>
      </form>
      {submitted ? <p className="text-sm text-white/70">If your email app did not open, send your message manually to <a href="mailto:hello@aorthar.com" className="text-[#a7d252] underline">hello@aorthar.com</a>.</p> : null}
    </InfoPageShell>
  );
}
