'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  LayoutDashboard,
  TrendingUp,
  Award,
  Lightbulb,
  Settings,
  Shield,
  Users,
  FileQuestion,
  CheckSquare,
  CreditCard,
} from 'lucide-react';
import type { Role } from '@/types';

const studentNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/gpa', label: 'GPA & Grades', icon: Award },
  { href: '/capstone', label: 'Capstone', icon: CheckSquare },
  { href: '/suggest', label: 'Suggest Content', icon: Lightbulb },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const adminNav = [
  { href: '/admin', label: 'Admin', icon: Shield },
  { href: '/admin/courses', label: 'Admin Courses', icon: BookOpen },
  { href: '/admin/questions', label: 'Questions', icon: FileQuestion },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/suggestions', label: 'Suggestions', icon: Lightbulb },
  { href: '/admin/capstone', label: 'Capstone Review', icon: CheckSquare },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
];

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const nav = role === 'admin' ? adminNav : studentNav;

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background md:flex md:flex-col">
      <div className="p-6 border-b">
        <Link href="/dashboard" className="text-4xl font-semibold tracking-tight">
          Aorthar.
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
