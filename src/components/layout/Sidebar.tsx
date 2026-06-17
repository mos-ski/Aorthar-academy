'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  BriefcaseBusiness,
  ChevronLeft,
  ClipboardList,
  ChevronRight,
  CircleUser,
  CreditCard,
  GraduationCap,
  Layers,
  Lightbulb,
  LayoutDashboard,
  LucideIcon,
  ShieldCheck,
  Settings,
  ScrollText,
  ShoppingBag,
  Tag,
  Users,
  TrendingUp,
  Award,
  Building2,
  Inbox,
  Megaphone,
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
  { href: '/admin/questions', label: 'Exam System', icon: GraduationCap },
  { href: '/admin/curriculum', label: 'Curriculum', icon: Layers },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/suggestions', label: 'Suggestions', icon: Lightbulb },
];

const adminExternalNav: NavItem[] = [
  { href: '/admin/standalone-courses', label: 'Catalog', icon: BookOpen },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/instructors', label: 'Instructors', icon: Users },
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

const adminInternshipNav: NavItem[] = [
  { href: '/admin/internship', label: 'Applicants', icon: Users },
  { href: '/admin/internship/transactions', label: 'Transactions', icon: ClipboardList },
  { href: '/admin/internship/questions', label: 'Exam Questions', icon: GraduationCap },
];

const adminMarketplaceNav: NavItem[] = [
  { href: '/admin/marketplace', label: 'Products', icon: ShoppingBag },
  { href: '/admin/marketplace/transactions', label: 'Transactions', icon: ClipboardList },
];

const adminBusinessNav: NavItem[] = [
  { href: '/admin/business', label: 'Inquiries', icon: Inbox },
  { href: '/admin/business/settings', label: 'Settings', icon: Settings },
];

const adminPrimaryModules: Array<{
  key: 'overview' | 'university' | 'courses' | 'internship' | 'marketplace' | 'business' | 'admin_access' | 'audit_logs' | 'profile';
  label: string;
  icon: LucideIcon;
  href: string;
}> = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/admin' },
  { key: 'university', label: 'University', icon: Building2, href: '/admin/courses' },
  { key: 'courses', label: 'Bootcamps', icon: BookOpen, href: '/admin/standalone-courses' },
  { key: 'internship', label: 'Internship', icon: BriefcaseBusiness, href: '/admin/internship' },
  { key: 'marketplace', label: 'Marketplace', icon: ShoppingBag, href: '/admin/marketplace' },
  { key: 'business', label: 'Business', icon: Megaphone, href: '/admin/business' },
  { key: 'admin_access', label: 'Admin Access', icon: ShieldCheck, href: '/admin/admin-access' },
  { key: 'audit_logs', label: 'Audit Logs', icon: ScrollText, href: '/admin/audit-logs' },
  { key: 'profile', label: 'Profile Settings', icon: CircleUser, href: '/admin/profile' },
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
  const [adminMenuCollapsed, setAdminMenuCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('aorthar:admin-menu-collapsed') === '1';
  });
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
    || pathname.startsWith('/admin/coupons')
    || pathname.startsWith('/admin/instructors')
    || (
      (pathname.startsWith('/admin/users')
        || pathname.startsWith('/admin/pricing')
        || pathname.startsWith('/admin/payments'))
      && moduleParam === 'courses'
    )
    || (pathname === '/admin/ops'
      && (tab === 'transactions' || tab === 'students' || courseTab === 'external')
      && moduleParam !== 'university');
  const inProfilePath = pathname.startsWith('/admin/profile') || pathname.startsWith('/settings');

  const inAdminAccessPath = pathname.startsWith('/admin/admin-access');
  const inAuditLogsPath = pathname.startsWith('/admin/audit-logs');
  const inInternshipPath = pathname.startsWith('/admin/internship');
  const inMarketplacePath = pathname.startsWith('/admin/marketplace');
  const inBusinessPath = pathname.startsWith('/admin/business');

  const activeModule: 'overview' | 'university' | 'courses' | 'internship' | 'marketplace' | 'business' | 'admin_access' | 'audit_logs' | 'profile' = inProfilePath
    ? 'profile'
    : inAdminAccessPath
    ? 'admin_access'
    : inAuditLogsPath
    ? 'audit_logs'
    : inBusinessPath
    ? 'business'
    : inMarketplacePath
    ? 'marketplace'
    : inInternshipPath
    ? 'internship'
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
      : activeModule === 'internship'
      ? adminInternshipNav
      : activeModule === 'marketplace'
      ? adminMarketplaceNav
      : activeModule === 'business'
      ? adminBusinessNav
      : activeModule === 'admin_access'
      ? [{ href: '/admin/admin-access', label: 'Admin Access', icon: ShieldCheck }]
      : activeModule === 'audit_logs'
      ? [{ href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText }]
      : activeModule === 'profile'
      ? [{ href: '/admin/profile', label: 'Account & Profile', icon: Settings }]
      : adminOverviewNav;

  const secondaryTitle =
    activeModule === 'university'
      ? 'University'
    : activeModule === 'courses'
      ? 'Bootcamps'
      : activeModule === 'internship'
      ? 'Internship'
      : activeModule === 'marketplace'
      ? 'Marketplace'
      : activeModule === 'business'
      ? 'Business'
      : activeModule === 'admin_access'
      ? 'Admin Access'
      : activeModule === 'audit_logs'
      ? 'Audit Logs'
      : activeModule === 'profile'
      ? 'Profile Settings'
      : 'Admin';
  const showSecondaryPane = activeModule === 'university' || activeModule === 'courses' || activeModule === 'internship' || activeModule === 'marketplace' || activeModule === 'business';
  const visiblePrimaryModules = adminPrimaryModules.filter((module) => {
    if (module.key === 'admin_access') return hasAdminPermission(adminLevel, 'admin_management');
    if (module.key === 'audit_logs') return hasAdminPermission(adminLevel, 'audit');
    if (module.key === 'university' || module.key === 'courses') return hasAdminPermission(adminLevel, 'content') || hasAdminPermission(adminLevel, 'finance');
    if (module.key === 'internship') return hasAdminPermission(adminLevel, 'internship');
    if (module.key === 'marketplace') return hasAdminPermission(adminLevel, 'content');
    return true;
  });

  function toggleAdminMenu(): void {
    setAdminMenuCollapsed((collapsed) => {
      const next = !collapsed;
      window.localStorage.setItem('aorthar:admin-menu-collapsed', next ? '1' : '0');
      return next;
    });
  }

  return (
    <>
      {/* Desktop sidebar */}
      {isAdmin ? (
        <aside
          className={cn(
            'hidden shrink-0 border-r bg-background transition-[width] duration-200 md:flex',
            showSecondaryPane
              ? adminMenuCollapsed ? 'w-[248px]' : 'w-[400px]'
              : adminMenuCollapsed ? 'w-20' : 'w-60',
          )}
        >
          <div className={cn(
            'border-r bg-[#111214] text-white flex flex-col transition-[width] duration-200',
            adminMenuCollapsed ? 'w-20' : 'w-60',
          )}>
            <div className={cn(
              'h-[73px] border-b border-white/10 flex items-center',
              'relative',
              adminMenuCollapsed ? 'justify-center px-3' : 'justify-between px-6',
            )}>
              <Link href="/admin" className="flex items-center justify-center">
                <Image src="/Aorthar Favion.svg" alt="Aorthar" width={30} height={30} className="brightness-0 invert" unoptimized />
              </Link>
              {!adminMenuCollapsed && (
                <button
                  type="button"
                  aria-label="Collapse main menu"
                  className="inline-flex size-8 items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white"
                  onClick={toggleAdminMenu}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              {adminMenuCollapsed && (
                <button
                  type="button"
                  aria-label="Expand main menu"
                  className="absolute left-[52px] top-5 inline-flex size-7 items-center justify-center rounded-full border border-white/10 bg-[#161719] text-white/60 shadow-sm hover:text-white"
                  onClick={toggleAdminMenu}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <nav className={cn('flex-1 space-y-1', adminMenuCollapsed ? 'p-3' : 'p-4')}>
              {!adminMenuCollapsed && (
                <p className="px-3 pb-2 text-[11px] tracking-[0.12em] uppercase text-white/45">Main Menu</p>
              )}
              {visiblePrimaryModules.map(({ key, href, label, icon: Icon }) => {
                const active = activeModule === key;
                return (
                  <Link
                    key={href}
                    href={href}
                    title={adminMenuCollapsed ? label : undefined}
                    className={cn(
                      'flex items-center rounded-lg text-sm font-medium transition-colors',
                      adminMenuCollapsed ? 'justify-center px-0 py-3' : 'justify-between gap-3 px-3 py-2.5',
                      active
                        ? 'bg-white text-black shadow-sm'
                        : 'text-white/70 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <span className={cn('flex items-center', adminMenuCollapsed ? 'justify-center' : 'gap-3')}>
                      <Icon className="h-4 w-4" />
                      {!adminMenuCollapsed && <span>{label}</span>}
                    </span>
                    {!adminMenuCollapsed && (
                      <ChevronRight className={cn('h-4 w-4', active ? 'opacity-100' : 'opacity-30')} />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {showSecondaryPane && (
            <div className="flex-1 bg-muted/30 flex flex-col min-w-0">
              <div className="h-[73px] px-6 flex items-center border-b">
                <h3 className="truncate text-2xl font-semibold text-foreground tracking-tight">{secondaryTitle}</h3>
              </div>
              <nav className="p-4 space-y-1 overflow-y-auto">
                {secondaryNav.map(({ href, label, icon, match }) => {
                  const active = isNavItemActive({ href, label, icon, match });
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'block rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                        active
                          ? 'text-primary'
                          : 'text-foreground/70 hover:bg-background/60 hover:text-foreground',
                      )}
                    >
                      <span className="truncate">{label}</span>
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
              <Image src="/Aorthar Logo long complete.svg" alt="Aorthar" width={118} height={51} className="brightness-0 dark:brightness-100" unoptimized />
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
