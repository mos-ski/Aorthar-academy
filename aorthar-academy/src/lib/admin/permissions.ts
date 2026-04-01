export type AdminLevel = 'super_admin' | 'content_admin' | 'finance_admin';
export type AdminPermission = 'admin_management' | 'audit' | 'content' | 'finance';

export function normalizeAdminLevel(value: string | null | undefined): AdminLevel {
  if (value === 'content_admin' || value === 'finance_admin' || value === 'super_admin') {
    return value;
  }
  return 'super_admin';
}

export function hasAdminPermission(level: AdminLevel, permission: AdminPermission): boolean {
  if (level === 'super_admin') return true;
  if (level === 'content_admin') {
    return permission === 'content';
  }
  if (level === 'finance_admin') {
    return permission === 'finance' || permission === 'audit';
  }
  return false;
}

export function getPermissionForPath(pathname: string): AdminPermission | null {
  if (pathname.startsWith('/admin/admin-access') || pathname.startsWith('/api/admin/admin-access')) {
    return 'admin_management';
  }

  if (pathname.startsWith('/admin/audit-logs')) {
    return 'audit';
  }

  if (
    pathname.startsWith('/admin/pricing')
    || pathname.startsWith('/admin/payments')
    || pathname.startsWith('/api/admin/pricing')
    || pathname.startsWith('/api/admin/transactions')
  ) {
    return 'finance';
  }

  if (
    pathname.startsWith('/admin/courses')
    || pathname.startsWith('/admin/curriculum')
    || pathname.startsWith('/admin/questions')
    || pathname.startsWith('/admin/departments')
    || pathname.startsWith('/admin/suggestions')
    || pathname.startsWith('/admin/standalone-courses')
    || pathname.startsWith('/api/admin/courses')
    || pathname.startsWith('/api/admin/curriculum')
    || pathname.startsWith('/api/admin/questions')
    || pathname.startsWith('/api/admin/years')
    || pathname.startsWith('/api/admin/semesters')
    || pathname.startsWith('/api/admin/standalone-courses')
    || pathname.startsWith('/api/admin/lessons')
    || pathname.startsWith('/api/admin/resources')
    || pathname.startsWith('/api/admin/suggestions')
    || pathname.startsWith('/api/admin/capstone')
  ) {
    return 'content';
  }

  if (
    pathname.startsWith('/admin/users')
    || pathname.startsWith('/api/admin/users')
    || pathname.startsWith('/api/admin/students')
  ) {
    return 'admin_management';
  }

  return null;
}
