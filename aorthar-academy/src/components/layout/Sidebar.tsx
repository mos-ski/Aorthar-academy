'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  CircleUser,
  CreditCard,
  FileQuestion,
  Layers,
  Lightbulb,
  CheckSquare,
  LayoutDashboard,
  LucideIcon,
  Settings,
  Users,
  TrendingUp,
  Award,
  Building2,
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
  { href: '/university/courses', label: 'Courses', icon: BookOpen },
  { href: '/university/student', label: 'Students', icon: Users },
  { href: '/university/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/university/transaction', label: 'Transactions', icon: CreditCard },
  { href: '/admin/questions', label: 'Quiz & Questions', icon: FileQuestion },
  { href: '/admin/curriculum', label: 'Curriculum', icon: Layers },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/suggestions', label: 'Suggestions', icon: Lightbulb },
  { href: '/admin/capstone', label: 'Capstone', icon: CheckSquare },
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
  { href: '/admin', label: 'Dashboard Metrics', icon: LayoutDashboard },
  { href: '/admin/ops', label: 'Ops Hub (Quick CTAs)', icon: BriefcaseBusiness },
];

const adminPrimaryModules: Array<{
  key: 'overview' | 'university' | 'courses' | 'profile';
  label: string;
  icon: LucideIcon;
  href: string;
}> = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/admin' },
  { key: 'university', label: 'University', icon: Building2, href: '/university/courses' },
  { key: 'courses', label: 'Courses', icon: BookOpen, href: '/admin/standalone-courses' },
  { key: 'profile', label: 'Profile Settings', icon: CircleUser, href: '/settings' },
];

const mobileStudentNav = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/gpa', label: 'GPA', icon: Award },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const mobileAdminNav = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/university/courses', label: 'University', icon: Building2 },
  { href: '/admin/standalone-courses', label: 'Courses', icon: BookOpen },
  { href: '/settings', label: 'Profile', icon: CircleUser },
];

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const mobileNav = role === 'admin' ? mobileAdminNav : mobileStudentNav;
  const isAdmin = role === 'admin';
  const nav = studentNav;

  function isActivePath(href: string): boolean {
    return pathname === href || pathname.startsWith(href + '/');
  }

  function isNavItemActive(item: NavItem): boolean {
    if (item.match) return item.match(pathname, null, null);
    const [pathOnly] = item.href.split('?');
    return isActivePath(pathOnly);
  }

  const inUniversityPath = pathname.startsWith('/university/') || adminUniversityNav.some((item) => isNavItemActive(item));
  const inCoursesPath = pathname.startsWith('/admin/standalone-courses');
  const inProfilePath = pathname.startsWith('/settings');

  const activeModule: 'overview' | 'university' | 'courses' | 'profile' = inProfilePath
    ? 'profile'
    : inCoursesPath
    ? 'courses'
    : inUniversityPath
    ? 'university'
    : 'overview';

  const secondaryNav: NavItem[] =
    activeModule === 'university'
      ? adminUniversityNav
      : activeModule === 'courses'
      ? adminExternalNav
      : activeModule === 'profile'
      ? [{ href: '/settings', label: 'Account & Profile', icon: Settings }]
      : adminOverviewNav;

  const secondaryTitle =
    activeModule === 'university'
      ? 'University'
      : activeModule === 'courses'
      ? 'Courses'
      : activeModule === 'profile'
      ? 'Profile Settings'
      : 'Admin';
  const showSecondaryPane = activeModule === 'university' || activeModule === 'courses';

  return (
    <>
      {/* Desktop sidebar */}
      {isAdmin ? (
        <aside
          className={cn(
            'hidden shrink-0 border-r bg-background md:flex',
            showSecondaryPane ? 'w-[400px]' : 'w-60',
          )}
        >
          <div className="w-60 border-r bg-[#111214] text-white flex flex-col">
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
                      'flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-white text-black shadow-sm'
                        : 'text-white/70 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </span>
                    <ChevronRight className={cn('h-4 w-4', active ? 'opacity-100' : 'opacity-30')} />
                  </Link>
                );
              })}
            </nav>
          </div>

          {showSecondaryPane && (
            <div className="flex-1 bg-muted/30 flex flex-col">
              <div className="h-[73px] px-6 flex items-center border-b">
                <h3 className="text-2xl font-semibold text-foreground tracking-tight">{secondaryTitle}</h3>
              </div>
              <nav className="p-4 space-y-1 overflow-y-auto">
                {secondaryNav.map(({ href, label, icon: Icon }) => {
                  const active = isNavItemActive({ href, label, icon: Icon });
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors border',
                        active
                          ? 'bg-background text-foreground shadow-sm border-border'
                          : 'text-foreground/75 border-transparent hover:bg-background/70 hover:text-foreground',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
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
