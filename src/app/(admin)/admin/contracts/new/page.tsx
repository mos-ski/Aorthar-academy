export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';
import { hasAdminPermission, normalizeAdminLevel } from '@/lib/admin/permissions';
import ContractComposerClient from '../ContractComposerClient';

export const metadata = { title: 'New Contract — Admin' };

export default async function NewContractPage() {
  const { profile } = await requireRole('admin');
  const adminLevel = normalizeAdminLevel((profile as { admin_level?: string | null }).admin_level);
  if (!hasAdminPermission(adminLevel, 'finance')) redirect('/unauthorized');

  const admin = createAdminClient();
  const { data: templates } = await admin
    .from('contract_templates')
    .select('*, contract_template_fields(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return <ContractComposerClient templates={templates ?? []} />;
}
