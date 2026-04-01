import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';
import AdminAccessClient from './AdminAccessClient';

export default async function AdminAccessPage() {
  await requireRole('admin');
  const admin = createAdminClient();

  const { data: admins } = await admin
    .from('profiles')
    .select('user_id, full_name, email, created_at')
    .eq('role', 'admin')
    .order('created_at', { ascending: false });

  return <AdminAccessClient admins={admins ?? []} />;
}
