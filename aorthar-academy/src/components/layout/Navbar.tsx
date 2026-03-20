'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Role } from '@/types';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState } from 'react';

interface NavbarProps {
  user: { name: string; email: string; role: Role };
  isDemoMode?: boolean;
  appEnv?: string;
}

const ENV_STYLES: Record<string, string> = {
  development: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  staging: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
  production: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30',
};

const ENV_LABELS: Record<string, string> = {
  development: 'DEV',
  staging: 'STAGING',
  production: 'PROD',
};

export default function Navbar({ user, isDemoMode = false, appEnv = 'development' }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [toggling, setToggling] = useState(false);

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  async function handleDemoToggle() {
    setToggling(true);
    try {
      await fetch('/api/demo-mode', { method: 'POST' });
      router.refresh();
    } finally {
      setToggling(false);
    }
  }

  const PAGE_TITLES: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/courses': 'Courses',
    '/progress': 'Progress',
    '/gpa': 'GPA & Transcript',
    '/capstone': 'Capstone',
    '/suggest': 'Suggest Content',
    '/settings': 'Settings',
    '/admin': 'Overview',
    '/admin/curriculum': 'Curriculum',
    '/admin/courses': 'Courses',
    '/admin/questions': 'Questions',
    '/admin/users': 'Users',
    '/admin/departments': 'Departments',
    '/admin/suggestions': 'Suggestions',
    '/admin/capstone': 'Capstone Reviews',
    '/admin/payments': 'Payments',
    '/admin/settings': 'Settings',
  };
  const pageTitle = PAGE_TITLES[pathname] ?? PAGE_TITLES[Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k + '/')) ?? ''] ?? '';

  const envStyle = ENV_STYLES[appEnv] ?? ENV_STYLES.development;
  const envLabel = ENV_LABELS[appEnv] ?? appEnv.toUpperCase();
  const showToggle = appEnv !== 'production';

  return (
    <header className="h-14 border-b px-4 md:px-6 flex items-center justify-between bg-background">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-xl font-semibold tracking-tight md:hidden">
          Aorthar.
        </Link>
        <p className="hidden md:block text-sm font-medium text-foreground/80">
          {pageTitle}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {/* Environment badge */}
        <Badge
          variant="outline"
          className={`text-[10px] font-bold tracking-wider px-1.5 py-0.5 ${envStyle}`}
        >
          {envLabel}
        </Badge>

        {/* Demo / Live toggle — hidden in production */}
        {showToggle && (
          <button
            onClick={handleDemoToggle}
            disabled={toggling}
            role="switch"
            aria-checked={!isDemoMode}
            title={isDemoMode ? 'Switch to live data' : 'Switch to demo data'}
            className="flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
                isDemoMode ? 'bg-orange-400' : 'bg-green-500'
              }`}
            >
              <span
                className={`absolute h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  isDemoMode ? 'translate-x-0.5' : 'translate-x-[18px]'
                }`}
              />
            </span>
            <span className={`text-xs font-medium ${isDemoMode ? 'text-orange-600 dark:text-orange-400' : 'text-foreground/70'}`}>
              {isDemoMode ? 'Demo' : 'Live'}
            </span>
          </button>
        )}

        <Badge variant="secondary" className="capitalize">
          {user.role}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
