import { createClient } from '@/lib/supabase/server';
import {
  type AdminPermission,
  hasAdminPermission,
  normalizeAdminLevel,
} from '@/lib/admin/permissions';

export async function requireAdminApi(
  requiredPermission?: AdminPermission,
): Promise<{ userId: string; adminLevel: 'super_admin' | 'content_admin' | 'finance_admin' }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_suspended, admin_level')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profile?.is_suspended) {
    throw new Error('SUSPENDED');
  }

  if (!profile || profile.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  const adminLevel = normalizeAdminLevel((profile as { admin_level?: string | null }).admin_level);

  if (requiredPermission && !hasAdminPermission(adminLevel, requiredPermission)) {
    throw new Error('FORBIDDEN_PERMISSION');
  }

  return { userId: user.id, adminLevel };
}

export function mapAdminApiError(error: unknown): { status: number; message: string } {
  const message = error instanceof Error ? error.message : 'Internal server error';

  if (message === 'UNAUTHORIZED') return { status: 401, message: 'Unauthorized' };
  if (message === 'SUSPENDED') return { status: 403, message: 'Account suspended' };
  if (message === 'FORBIDDEN') return { status: 403, message: 'Forbidden' };
  if (message === 'FORBIDDEN_PERMISSION') return { status: 403, message: 'Permission denied for this action' };

  return { status: 500, message: 'Internal server error' };
}
