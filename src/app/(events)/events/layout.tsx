import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Live Classes — Aorthar Academy',
  description: 'Register for live webinars and classes hosted by Aorthar Academy.',
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/events" className="font-bold text-lg">
            Aorthar Live
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            aorthar.com
          </Link>
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
