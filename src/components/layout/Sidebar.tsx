'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  BriefcaseBusiness,
  ClipboardList,
  ChevronRight,
  CircleUser,
  CreditCard,
  FileQuestion,
  Layers,
  Lightbulb,
  LayoutDashboard,
  LucideIcon,
  ShieldCheck,
  Settings,
  ScrollText,
  Users,
  TrendingUp,
  Award,
  Building2,
} from 'lucide-react';
import type { Role } from '@/types';
import { hasAdminPermission, type AdminLevel } from '@/lib/admin/permissions';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: (
    pathname: string,
    tab: string | null,
    courseTab: string | null,
    moduleParam: string | null,
  ) => boolean;
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
  {
    href: '/admin/courses',
    label: 'Courses',
    icon: BookOpen,
  },
  {
    href: '/admin/users?module=university',
    label: 'Students',
    icon: Users,
    match: (pathname, _tab, _courseTab, moduleParam) =>
      pathname === '/admin/users' && moduleParam === 'university',
  },
  {
    href: '/admin/pricing?module=university',
    label: 'Plans',
    icon: ScrollText,
    match: (pathname, _tab, _courseTab, moduleParam) =>
      pathname === '/admin/pricing' && moduleParam === 'university',
  },
  {
    href: '/admin/payments?module=university',
    label: 'Transactions',
    icon: ClipboardList,
    match: (pathname, _tab, _courseTab, moduleParam) =>
      pathname === '/admin/payments' && moduleParam === 'university',
  },
  { href: '/admin/questions', label: 'Quiz & Questions', icon: FileQuestion },
  { href: '/admin/curriculum', label: 'Curriculum', icon: Layers },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/suggestions', label: 'Suggestions', icon: Lightbulb },
];

const adminExternalNav: NavItem[] = [
  { href: '/admin/standalone-courses', label: 'Catalog', icon: BookOpen },
  {
    href: '/admin/users?module=courses',
    label: 'Students',
    icon: Users,
    match: (pathname, _tab, _courseTab, moduleParam) =>
      pathname === '/admin/users' && moduleParam === 'courses',
  },
  {
    href: '/admin/payments?module=courses',
    label: 'Transactions',
    icon: ClipboardList,
    match: (pathname, _tab, _courseTab, moduleParam) =>
      pathname === '/admin/payments' && moduleParam === 'courses',
  },
];

const adminOverviewNav: NavItem[] = [
  { href: '/admin', label: 'Dashboard Metrics', icon: LayoutDashboard },
  { href: '/admin/ops', label: 'Ops Hub (Quick CTAs)', icon: BriefcaseBusiness },
];

const adminPrimaryModules: Array<{
  key: 'overview' | 'university' | 'courses' | 'admin_access' | 'audit_logs' | 'profile';
  label: string;
  icon: LucideIcon;
  href: string;
}> = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/admin' },
  { key: 'university', label: 'University', icon: Building2, href: '/admin/courses' },
  { key: 'courses', label: 'Bootcamps', icon: BookOpen, href: '/admin/standalone-courses' },
  { key: 'admin_access', label: 'Admin Access', icon: ShieldCheck, href: '/admin/admin-access' },
  { key: 'audit_logs', label: 'Audit Logs', icon: ScrollText, href: '/admin/audit-logs' },
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
  { href: '/admin/courses', label: 'University', icon: Building2 },
  { href: '/admin/standalone-courses', label: 'External', icon: BookOpen },
  { href: '/settings', label: 'Profile', icon: CircleUser },
];

export default function Sidebar({
  role,
  adminLevel = 'super_admin',
}: {
  role: Role;
  adminLevel?: AdminLevel;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const courseTab = searchParams.get('courseTab');
  const moduleParam = searchParams.get('module');
  const mobileNav = role === 'admin' ? mobileAdminNav : mobileStudentNav;
  const isAdmin = role === 'admin';
  const nav = studentNav;

  function isActivePath(href: string): boolean {
    return pathname === href || pathname.startsWith(href + '/');
  }

  function isNavItemActive(item: NavItem): boolean {
    if (item.match) return item.match(pathname, tab, courseTab, moduleParam);
    const [pathOnly] = item.href.split('?');
    return isActivePath(pathOnly);
  }

  const inUniversityPath =
    moduleParam === 'university'
    || (
      (pathname.startsWith('/admin/users')
        || pathname.startsWith('/admin/pricing')
        || pathname.startsWith('/admin/payments'))
      && moduleParam !== 'courses'
    )
    || pathname.startsWith('/admin/courses')
    || pathname.startsWith('/admin/questions')
    || pathname.startsWith('/admin/curriculum')
    || pathname.startsWith('/admin/departments')
    || pathname.startsWith('/admin/suggestions')
    || pathname.startsWith('/admin/admin-access')
    || pathname.startsWith('/admin/audit-logs')
    || adminUniversityNav.some((item) => isNavItemActive(item))
    || (pathname === '/admin/ops' && tab === 'courses' && courseTab !== 'external');
  const inCoursesPath =
    moduleParam === 'courses'
    || pathname.startsWith('/admin/standalone-courses')
    || (
      (pathname.startsWith('/admin/users')
        || pathname.startsWith('/admin/pricing')
        || pathname.startsWith('/admin/payments'))
      && moduleParam === 'courses'
    )
    || (pathname === '/admin/ops'
      && (tab === 'transactions' || tab === 'students' || courseTab === 'external')
      && moduleParam !== 'university');
  const inProfilePath = pathname.startsWith('/settings');

  const inAdminAccessPath = pathname.startsWith('/admin/admin-access');
  const inAuditLogsPath = pathname.startsWith('/admin/audit-logs');

  const activeModule: 'overview' | 'university' | 'courses' | 'admin_access' | 'audit_logs' | 'profile' = inProfilePath
    ? 'profile'
    : inAdminAccessPath
    ? 'admin_access'
    : inAuditLogsPath
    ? 'audit_logs'
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
      : activeModule === 'admin_access'
      ? [{ href: '/admin/admin-access', label: 'Admin Access', icon: ShieldCheck }]
      : activeModule === 'audit_logs'
      ? [{ href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText }]
      : activeModule === 'profile'
      ? [{ href: '/settings', label: 'Account & Profile', icon: Settings }]
      : adminOverviewNav;

  const secondaryTitle =
    activeModule === 'university'
      ? 'University'
    : activeModule === 'courses'
      ? 'Bootcamps'
      : activeModule === 'admin_access'
      ? 'Admin Access'
      : activeModule === 'audit_logs'
      ? 'Audit Logs'
      : activeModule === 'profile'
      ? 'Profile Settings'
      : 'Admin';
  const showSecondaryPane = activeModule === 'university' || activeModule === 'courses';
  const visiblePrimaryModules = adminPrimaryModules.filter((module) => {
    if (module.key === 'admin_access') return hasAdminPermission(adminLevel, 'admin_management');
    if (module.key === 'audit_logs') return hasAdminPermission(adminLevel, 'audit');
    if (module.key === 'university' || module.key === 'courses') return hasAdminPermission(adminLevel, 'content') || hasAdminPermission(adminLevel, 'finance');
    return true;
  });

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
              {visiblePrimaryModules.map(({ key, href, label, icon: Icon }) => {
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
                {secondaryNav.map(({ href, label, icon: Icon, match }) => {
                  const active = isNavItemActive({ href, label, icon: Icon, match });
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
