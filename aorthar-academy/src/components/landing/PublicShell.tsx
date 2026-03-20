'use client';

import Link from 'next/link';
import React from 'react';

interface PublicShellProps {
  children: React.ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#18191a', color: '#ffffff' }}>
      {/* Minimal Nav */}
      <header
        className="flex items-center justify-between px-5 sm:px-10 h-14 border-b shrink-0"
        style={{ backgroundColor: '#18191a', borderColor: 'rgba(255,255,255,0.12)' }}
      >
        <Link href="/" className="flex items-center shrink-0">
          <img
            src="/Aorthar Logo long complete.svg"
            alt="Aorthar"
            width={118}
            height={51}
            className="h-8 w-auto object-contain"
          />
        </Link>
        <Link
          href="/"
          className="text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ color: '#b1b1b1' }}
        >
          ← Back
        </Link>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Minimal Footer */}
      <footer
        className="py-6 text-center text-sm"
        style={{ backgroundColor: '#18191a', color: '#b1b1b1', borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        © 2025 Aorthar. All rights reserved.
      </footer>
    </div>
  );
}
