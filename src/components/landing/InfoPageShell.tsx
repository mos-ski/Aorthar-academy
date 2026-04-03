import Link from 'next/link';
import type { ReactNode } from 'react';

type InfoPageShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function InfoPageShell({ eyebrow, title, subtitle, children }: InfoPageShellProps) {
  return (
    <main className="min-h-screen bg-[#0b0d0f] text-white">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-white/20 px-4 py-1.5 text-sm text-white/80 transition hover:border-[#a7d252] hover:text-[#a7d252]"
        >
          Back to home
        </Link>

        <div className="mt-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a7d252]">{eyebrow}</p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{title}</h1>
          <p className="max-w-3xl text-sm text-white/70 sm:text-base">{subtitle}</p>
        </div>

        <section className="mt-10 space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          {children}
        </section>
      </div>
    </main>
  );
}
