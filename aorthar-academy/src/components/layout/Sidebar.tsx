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
  Building2,
  Layers,
} from 'lucide-react';
import type { Role } from '@/types';

const studentNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/gpa', label: 'GPA & Grades', icon: Award },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/suggest', label: 'Suggest Content', icon: Lightbulb },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const adminNav = [
  { href: '/admin', label: 'Overview', icon: Shield },
  { href: '/admin/curriculum', label: 'Curriculum', icon: Layers },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/questions', label: 'Questions', icon: FileQuestion },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/suggestions', label: 'Suggestions', icon: Lightbulb },
  { href: '/admin/capstone', label: 'Capstone', icon: CheckSquare },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
];

const mobileStudentNav = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/gpa', label: 'GPA', icon: Award },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const mobileAdminNav = [
  { href: '/admin', label: 'Overview', icon: Shield },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/questions', label: 'Questions', icon: FileQuestion },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/curriculum', label: 'Curriculum', icon: Layers },
];

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const nav = role === 'admin' ? adminNav : studentNav;
  const mobileNav = role === 'admin' ? mobileAdminNav : mobileStudentNav;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-background md:flex md:flex-col">
        <div className="p-6 border-b">
          <Link href="/dashboard">
            <img src="/Aorthar Logo long complete.svg" alt="Aorthar" width={118} height={51} className="brightness-0 dark:brightness-100" />
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

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background md:hidden">
        {mobileNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && href !== '/dashboard' && pathname.startsWith(href + '/'));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition-colors',
                active ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'text-foreground')} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
