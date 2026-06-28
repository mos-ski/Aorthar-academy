export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';
import { hasAdminPermission, normalizeAdminLevel } from '@/lib/admin/permissions';
import TemplatesClient from './TemplatesClient';

export const metadata = { title: 'Contract Templates — Admin' };

export default async function ContractTemplatesPage() {
  const { profile } = await requireRole('admin');
  const adminLevel = normalizeAdminLevel((profile as { admin_level?: string | null }).admin_level);
  if (!hasAdminPermission(adminLevel, 'finance')) redirect('/unauthorized');

  const admin = createAdminClient();
  const { data: templates } = await admin
    .from('contract_templates')
    .select('*, contract_template_fields(*)')
    .order('created_at', { ascending: false });

  return <TemplatesClient initialTemplates={templates ?? []} />;
}
