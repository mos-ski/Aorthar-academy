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
    '/admin': 'Admin',
    '/admin/courses': 'Courses',
    '/admin/users': 'Users',
    '/admin/departments': 'Departments',
    '/admin/suggestions': 'Suggestions',
    '/admin/capstone': 'Capstone Reviews',
    '/admin/payments': 'Payments',
    '/admin/settings': 'Settings',
  };
  const pageTitle = PAGE_TITLES[pathname] ?? PAGE_TITLES[Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k + '/')) ?? ''] ?? '';

  return (
    <header className="h-14 border-b px-6 flex items-center justify-between bg-background">
      <p className="text-sm font-medium text-foreground/80">
        {pageTitle}
      </p>
      <div className="flex items-center gap-3">
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
