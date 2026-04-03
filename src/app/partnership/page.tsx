'use client';

import { FormEvent, useMemo, useState } from 'react';
import InfoPageShell from '@/components/landing/InfoPageShell';

function buildMailto(subject: string, body: string): string {
  const query = new URLSearchParams({ subject, body });
  return `mailto:hello@aorthar.com?${query.toString()}`;
}

export default function PartnershipPage() {
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [need, setNeed] = useState('');

  const mailtoUrl = useMemo(() => {
    const body = `Company: ${company}\nContact Name: ${name}\nEmail: ${email}\n\nPartnership Need:\n${need}`;
    return buildMailto('Aorthar Partnership Request', body);
  }, [company, name, email, need]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    window.location.href = mailtoUrl;
  }

  return (
    <InfoPageShell
      eyebrow="Social"
      title="Partnership"
      subtitle="Tell us what you want to build together. Submitted details are sent to hello@aorthar.com."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={company} onChange={(event) => setCompany(event.target.value)} required placeholder="Company or organization" className="w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#a7d252] focus:outline-none" />
        <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Contact name" className="w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#a7d252] focus:outline-none" />
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="work-email@company.com" className="w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#a7d252] focus:outline-none" />
        <textarea value={need} onChange={(event) => setNeed(event.target.value)} required rows={6} placeholder="Talent hiring, internship sponsorship, curriculum collaboration, events..." className="w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#a7d252] focus:outline-none" />
        <button type="submit" className="rounded-md bg-[#a7d252] px-5 py-2.5 text-sm font-semibold text-black transition hover:opacity-90">Send Partnership Request</button>
      </form>
    </InfoPageShell>
  );
}
