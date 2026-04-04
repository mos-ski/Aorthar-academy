'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Award,
  GraduationCap,
  Lightbulb,
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Crown,
  CreditCard,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const studentNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/gpa', label: 'GPA & Grades', icon: Award },
  { href: '/capstone', label: 'Capstone', icon: GraduationCap },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/suggest', label: 'Suggest Content', icon: Lightbulb },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface MiniCourse {
  id: string;
  code: string;
  name: string;
  progress: number;
}

interface SidebarProps {
  role: string;
  department: string | null;
  courses?: MiniCourse[];
}

export default function UniversitySidebar({
  role,
  department,
  courses = [],
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on navigation
  const handleNavClick = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-md md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col bg-white border-r border-gray-200 transition-all duration-300 md:static md:z-auto',
          mobileOpen ? 'w-72 translate-x-0' : '-translate-x-full md:translate-x-0',
          collapsed ? 'md:w-16' : 'md:w-72'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-gray-900">
                Aorthar<span className="text-emerald-600">.</span>
              </span>
            )}
          </Link>
          <div className="flex items-center gap-1">
            {/* Collapse toggle (desktop only) */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:flex"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {/* Mobile close */}
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Department badge */}
        {!collapsed && department && (
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Your Track</p>
            <p className="text-sm font-semibold text-emerald-700 mt-0.5">{department}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {studentNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-emerald-600' : 'text-gray-400')} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Your Courses section */}
        {!collapsed && courses.length > 0 && (
          <div className="px-4 py-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Your Courses
            </p>
            <div className="space-y-2">
              {courses.slice(0, 5).map((course) => (
                <Link
                  key={course.id}
                  href={`/course/${course.id}`}
                  className="block group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-semibold text-gray-500 group-hover:text-emerald-600 transition-colors">
                      {course.code}
                    </span>
                    <span className="text-xs text-gray-400">{course.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Premium badge */}
        {!collapsed && (
          <div className="px-4 py-4 border-t border-gray-100">
            <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 px-3 py-2.5">
              <Crown className="h-4 w-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-amber-800">Unlock Year 400</p>
                <p className="text-xs text-amber-600 truncate">Upgrade to Premium</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
