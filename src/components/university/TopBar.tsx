'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  BookOpen,
  LayoutDashboard,
} from 'lucide-react';

interface TopBarProps {
  userName: string;
  userEmail: string;
  role: string;
  isDemoMode: boolean;
  appEnv: string;
}

export default function UniversityTopBar({
  userName,
  userEmail,
  role,
  isDemoMode,
  appEnv,
}: TopBarProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  // Keyboard shortcut for search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const firstName = userName.split(' ')[0];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      {/* Left: Breadcrumb / Page title area */}
      <div className="flex items-center gap-3 md:hidden">
        {/* Mobile: just the hamburger is handled in sidebar */}
        <div className="w-10" />
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 hover:border-gray-300 hover:bg-white transition-colors"
        >
          <Search className="h-4 w-4" />
          <span>Search courses, lessons...</span>
          <kbd className="ml-auto hidden rounded bg-gray-200 px-1.5 py-0.5 text-xs font-mono text-gray-500 md:inline-flex">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Env badge */}
        {appEnv !== 'production' && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold uppercase',
              appEnv === 'development'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-amber-100 text-amber-700'
            )}
          >
            {appEnv}
          </span>
        )}

        {/* Demo badge */}
        {isDemoMode && (
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
            Demo
          </span>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {/* Notification dot */}
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  No new notifications
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden text-sm font-medium text-gray-700 md:inline-flex">
              {firstName}
            </span>
            <ChevronDown className="hidden h-4 w-4 text-gray-400 md:inline-flex" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4 text-gray-400" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, lessons, materials..."
                className="flex-1 text-sm outline-none placeholder:text-gray-400"
                autoFocus
              />
              <kbd
                className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-500"
                onClick={() => setSearchOpen(false)}
              >
                ESC
              </kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              <p className="px-2 py-2 text-xs font-medium text-gray-400 uppercase">
                Quick Links
              </p>
              <Link
                href="/courses"
                onClick={() => setSearchOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <BookOpen className="h-4 w-4 text-gray-400" />
                Browse Courses
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setSearchOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <LayoutDashboard className="h-4 w-4 text-gray-400" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
