export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';
import { hasAdminPermission, normalizeAdminLevel } from '@/lib/admin/permissions';
import ContractDetailClient from './ContractDetailClient';

type Props = { params: Promise<{ id: string }> };

export default async function ContractDetailPage({ params }: Props) {
  const { profile } = await requireRole('admin');
  const adminLevel = normalizeAdminLevel((profile as { admin_level?: string | null }).admin_level);
  if (!hasAdminPermission(adminLevel, 'finance')) redirect('/unauthorized');

  const { id } = await params;
  const admin = createAdminClient();
  const { data: contract } = await admin
    .from('contracts')
    .select('*, contract_field_values(*), contract_signing_tokens(*), contract_signatures(*), contract_payments(*)')
    .eq('id', id)
    .single();

  if (!contract) notFound();
  return <ContractDetailClient contract={contract} />;
}
