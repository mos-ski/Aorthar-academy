import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import MarketplaceAdmin from './MarketplaceAdmin';

export const metadata = { title: 'Marketplace — Admin' };

export default async function AdminMarketplacePage() {
  const session = await requireRole('admin');
  if (!session) redirect('/login');

  const admin = createAdminClient();

  const { data: products } = await admin
    .from('marketplace_products')
    .select('id, slug, name, category, price_ngn, is_active, sort_order, created_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  const { data: counts } = await admin
    .from('marketplace_purchases')
    .select('product_id')
    .eq('payment_status', 'paid');

  const countMap = new Map<string, number>();
  for (const row of counts ?? []) {
    countMap.set(row.product_id, (countMap.get(row.product_id) ?? 0) + 1);
  }

  const enriched = (products ?? []).map((p) => ({
    ...p,
    purchaseCount: countMap.get(p.id) ?? 0,
  }));

  return <MarketplaceAdmin products={enriched} />;
}
