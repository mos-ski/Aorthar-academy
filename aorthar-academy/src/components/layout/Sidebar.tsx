'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CheckSquare,
  CreditCard,
  FileQuestion,
  LayoutDashboard,
  Layers,
  Lightbulb,
  LucideIcon,
  Shield,
  Users,
  TrendingUp,
  Award,
  Settings,
} from 'lucide-react';
import type { Role } from '@/types';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: (pathname: string, tab: string | null, courseTab: string | null) => boolean;
};

const studentNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/gpa', label: 'GPA & Grades', icon: Award },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/suggest', label: 'Suggest Content', icon: Lightbulb },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const adminUniversityNav: NavItem[] = [
  { href: '/admin/curriculum', label: 'Curriculum', icon: Layers },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/questions', label: 'Quiz & Questions', icon: FileQuestion },
  { href: '/admin/users', label: 'Students', icon: Users },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/suggestions', label: 'Suggestions', icon: Lightbulb },
  { href: '/admin/capstone', label: 'Capstone', icon: CheckSquare },
  { href: '/admin/payments', label: 'Pricing & Transactions', icon: CreditCard },
];

const adminExternalNav: NavItem[] = [
  { href: '/admin/standalone-courses', label: 'Catalog', icon: BookOpen },
  {
    href: '/admin/ops?tab=students',
    label: 'Students',
    icon: Users,
    match: (pathname, tab) => pathname === '/admin/ops' && tab === 'students',
  },
  {
    href: '/admin/ops?tab=transactions',
    label: 'Transactions',
    icon: CreditCard,
    match: (pathname, tab) => pathname === '/admin/ops' && tab === 'transactions',
  },
  {
    href: '/admin/ops?tab=courses&courseTab=external',
    label: 'Course Manager',
    icon: BriefcaseBusiness,
    match: (pathname, tab, courseTab) =>
      pathname === '/admin/ops' && tab === 'courses' && courseTab === 'external',
  },
];

const adminOverviewNav: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: Shield },
  {
    href: '/admin/ops',
    label: 'Ops Hub',
    icon: BriefcaseBusiness,
    match: (pathname) => pathname === '/admin/ops',
  },
];

const adminPrimaryModules: Array<{
  key: 'overview' | 'university' | 'external';
  label: string;
  icon: LucideIcon;
  href: string;
}> = [
  { key: 'overview', label: 'Overview', icon: Shield, href: '/admin' },
  { key: 'university', label: 'University', icon: Building2, href: '/admin/courses' },
  { key: 'external', label: 'External Course', icon: BookOpen, href: '/admin/standalone-courses' },
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
  { href: '/admin/ops', label: 'Ops', icon: BriefcaseBusiness },
  { href: '/admin/courses', label: 'University', icon: Building2 },
  { href: '/admin/standalone-courses', label: 'External', icon: BookOpen },
];

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const courseTab = searchParams.get('courseTab');
  const mobileNav = role === 'admin' ? mobileAdminNav : mobileStudentNav;
  const isAdmin = role === 'admin';
  const nav = studentNav;

  function isActivePath(href: string): boolean {
    return pathname === href || pathname.startsWith(href + '/');
  }

  function isNavItemActive(item: NavItem): boolean {
    if (item.match) return item.match(pathname, tab, courseTab);
    const [pathOnly] = item.href.split('?');
    return isActivePath(pathOnly);
  }

  const inUniversityPath = adminUniversityNav.some((item) => isNavItemActive(item));
  const inExternalPath = pathname.startsWith('/admin/standalone-courses') || courseTab === 'external';

  const activeModule: 'overview' | 'university' | 'external' = inExternalPath
    ? 'external'
    : inUniversityPath
    ? 'university'
    : 'overview';

  const secondaryNav: NavItem[] =
    activeModule === 'university'
      ? adminUniversityNav
      : activeModule === 'external'
      ? adminExternalNav
      : adminOverviewNav;

  const secondaryTitle =
    activeModule === 'university'
      ? 'University'
      : activeModule === 'external'
      ? 'External Course'
      : 'Admin';

  return (
    <>
      {/* Desktop sidebar */}
      {isAdmin ? (
        <aside className="hidden w-[420px] shrink-0 border-r bg-background md:flex">
          <div className="w-64 border-r bg-[#111214] text-white flex flex-col">
            <div className="p-6 border-b border-white/10">
              <Link href="/admin" className="flex items-center gap-2">
                <img src="/Aorthar Logo long complete.svg" alt="Aorthar" width={118} height={51} className="brightness-0 invert" />
              </Link>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              <p className="px-3 pb-2 text-[11px] tracking-[0.12em] uppercase text-white/45">Main Menu</p>
              {adminPrimaryModules.map(({ key, href, label, icon: Icon }) => {
                const active = activeModule === key;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-white/12 text-white'
                        : 'text-white/70 hover:bg-white/8 hover:text-white',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex-1 bg-muted/30 flex flex-col">
            <div className="h-[73px] px-6 flex items-center border-b">
              <h3 className="text-3xl font-semibold text-foreground tracking-tight">{secondaryTitle}</h3>
            </div>
            <nav className="p-4 space-y-1 overflow-y-auto">
              {secondaryNav.map(({ href, label, icon: Icon }) => {
                const active = isNavItemActive({ href, label, icon: Icon });
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-background text-foreground shadow-sm border'
                        : 'text-foreground/75 hover:bg-background/70 hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
      ) : (
        <aside className="hidden w-64 shrink-0 border-r bg-background md:flex md:flex-col">
          <div className="p-6 border-b">
            <Link href="/dashboard">
              <img src="/Aorthar Logo long complete.svg" alt="Aorthar" width={118} height={51} className="brightness-0 dark:brightness-100" />
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = isActivePath(href);
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
      )}

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
