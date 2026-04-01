import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';
import { hasAdminPermission, normalizeAdminLevel } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import AdminAccessClient from './AdminAccessClient';

export const dynamic = 'force-dynamic';

export default async function AdminAccessPage() {
  const { profile } = await requireAuth();
  if (profile?.role !== 'admin') redirect('/unauthorized');
  const adminLevel = normalizeAdminLevel((profile as { admin_level?: string | null }).admin_level ?? null);
  if (!hasAdminPermission(adminLevel, 'admin_management')) redirect('/unauthorized');

  const admin = createAdminClient();

  const { data: admins } = await admin
    .from('profiles')
    .select('user_id, full_name, email, created_at, admin_level')
    .eq('role', 'admin')
    .order('created_at', { ascending: false });

  return <AdminAccessClient admins={admins ?? []} />;
}
