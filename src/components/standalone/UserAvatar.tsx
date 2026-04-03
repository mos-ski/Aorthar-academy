'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}

function getInitials(name?: string | null, email?: string) {
  if (name && name.trim()) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  return email ? email[0].toUpperCase() : '?';
}

export default function UserAvatar({ email, fullName, avatarUrl }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleLogout() {
    await createClient().auth.signOut();
    window.location.href = '/courses-app';
  }

  const initials = getInitials(fullName, email);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        aria-label="Account menu"
      >
        {/* Avatar circle */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName ?? email}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ backgroundColor: '#08694a', color: '#fff' }}
          >
            {initials}
          </div>
        )}
        {/* Name / email */}
        <span className="hidden sm:block text-sm text-white/60 max-w-[140px] truncate">
          {fullName ?? email}
        </span>
        <svg className="w-3 h-3 text-white/30 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-xl z-50 overflow-hidden"
          style={{ backgroundColor: '#1e1f20', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {fullName && <p className="text-sm font-medium text-white truncate">{fullName}</p>}
            <p className="text-xs text-white/40 truncate">{email}</p>
          </div>
          <div className="p-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors text-left"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
