'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import ThemeToggle from '@/components/theme-toggle';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { Role } from '@/types';

interface NavbarProps {
  user: { name: string; email: string; role: Role };
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

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

  const PAGE_TITLES: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/courses': 'Courses',
    '/progress': 'Progress',
    '/gpa': 'GPA & Transcript',
    '/capstone': 'Capstone',
    '/suggest': 'Suggest Content',
    '/settings': 'Settings',
    '/admin': 'Overview',
    '/admin/ops': 'Admin Ops Hub',
    '/admin/curriculum': 'Curriculum',
    '/admin/courses': 'University Courses',
    '/admin/pricing': 'Pricing Configuration',
    '/admin/questions': 'University Quiz & Questions',
    '/admin/users': 'University Students',
    '/admin/departments': 'Departments',
    '/admin/suggestions': 'University Suggestions',
    '/admin/admin-access': 'Admin Access',
    '/admin/audit-logs': 'Audit Logs',
    '/admin/payments': 'Transactions',
    '/admin/standalone-courses': 'Bootcamps',
    '/admin/settings': 'Settings',
  };
  const pageTitle = PAGE_TITLES[pathname] ?? PAGE_TITLES[Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k + '/')) ?? ''] ?? '';

  return (
    <header className="h-14 border-b px-4 md:px-6 flex items-center justify-between bg-background">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="md:hidden">
          <Image src="/Aorthar Logo long complete.svg" alt="Aorthar" width={99} height={43} className="brightness-0 dark:brightness-100" unoptimized />
        </Link>
        <p className="hidden md:block text-sm font-medium text-foreground/80">
          {pageTitle}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />

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
