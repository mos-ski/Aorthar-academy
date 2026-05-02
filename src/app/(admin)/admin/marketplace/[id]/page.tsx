import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import MarketplaceProductEditor from './MarketplaceProductEditor';

export const metadata = { title: 'Edit Product — Marketplace Admin' };

export default async function AdminMarketplaceProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole('admin');
  if (!session) redirect('/login');

  const { id } = await params;
  const admin = createAdminClient();

  const { data: product } = await admin
    .from('marketplace_products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) notFound();

  const { data: recentPurchases } = await admin
    .from('marketplace_purchases')
    .select('id, email, amount_paid_ngn, paid_at, download_count')
    .eq('product_id', id)
    .eq('payment_status', 'paid')
    .order('paid_at', { ascending: false })
    .limit(20);

  const { count: purchaseCount } = await admin
    .from('marketplace_purchases')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id)
    .eq('payment_status', 'paid');

  return (
    <MarketplaceProductEditor
      product={product}
      purchaseCount={purchaseCount ?? 0}
      recentPurchases={recentPurchases ?? []}
    />
  );
}
