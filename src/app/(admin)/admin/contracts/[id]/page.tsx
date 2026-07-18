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
  const [{ data: contract }, { data: signatures }] = await Promise.all([
    admin
      .from('contracts')
      .select('*, contract_field_values(*), contract_signing_tokens(*), contract_signatures(*), contract_payments(*)')
      .eq('id', id)
      .single(),
    admin
      .from('contract_signatures')
      .select('*')
      .eq('contract_id', id)
      .order('signed_at', { ascending: false })
      .limit(1),
  ]);

  if (!contract) notFound();
  return <ContractDetailClient contract={{ ...contract, contract_signatures: signatures?.length ? signatures : contract.contract_signatures }} />;
}
