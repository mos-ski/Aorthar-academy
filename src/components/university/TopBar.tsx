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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
      {/* Mobile spacer */}
      <div className="flex items-center gap-3 md:hidden">
        <div className="w-10" />
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex w-full items-center gap-2 rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          <Search className="h-4 w-4" />
          <span>Search courses, lessons...</span>
          <kbd className="ml-auto hidden rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground md:inline-flex">
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
            className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-popover shadow-lg">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-popover-foreground">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
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
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden text-sm font-medium text-foreground md:inline-flex">
              {firstName}
            </span>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:inline-flex" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-popover shadow-lg">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-popover-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              </div>
              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
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
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-popover shadow-xl">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses, lessons, materials..."
                className="flex-1 text-sm outline-none placeholder:text-muted-foreground text-popover-foreground"
                autoFocus
              />
              <kbd
                className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground"
                onClick={() => setSearchOpen(false)}
              >
                ESC
              </kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              <p className="px-2 py-2 text-xs font-medium text-muted-foreground uppercase">
                Quick Links
              </p>
              <Link
                href="/courses"
                onClick={() => setSearchOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-popover-foreground hover:bg-muted"
              >
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                Browse Courses
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setSearchOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-popover-foreground hover:bg-muted"
              >
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
