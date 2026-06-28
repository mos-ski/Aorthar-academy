export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';
import { hasAdminPermission, normalizeAdminLevel } from '@/lib/admin/permissions';
import ContractsAdminClient from './ContractsAdminClient';

export const metadata = { title: 'Contracts — Admin' };

export default async function ContractsAdminPage() {
  const { profile } = await requireRole('admin');
  const adminLevel = normalizeAdminLevel((profile as { admin_level?: string | null }).admin_level);
  if (!hasAdminPermission(adminLevel, 'finance')) redirect('/unauthorized');

  const admin = createAdminClient();
  const { data: contracts } = await admin
    .from('contracts')
    .select('id, title, mode, recipient_name, recipient_email, status, payment_status, payment_amount_ngn, sent_at, signed_at, created_at')
    .order('created_at', { ascending: false });

  return <ContractsAdminClient contracts={contracts ?? []} />;
}
