import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import MarketplaceTransactions from './MarketplaceTransactions';

export const metadata = { title: 'Transactions — Marketplace Admin' };

export default async function AdminMarketplaceTransactionsPage() {
  const session = await requireRole('admin');
  if (!session) redirect('/login');

  const admin = createAdminClient();

  const { data: purchases } = await admin
    .from('marketplace_purchases')
    .select('id, product_id, email, paystack_reference, payment_status, amount_paid_ngn, paid_at, download_count, created_at')
    .order('created_at', { ascending: false });

  const productIds = [...new Set(purchases?.map((p) => p.product_id) ?? [])];

  const { data: products } = productIds.length > 0
    ? await admin.from('marketplace_products').select('id, name').in('id', productIds)
    : { data: [] };

  const productMap = new Map<string, string>();
  for (const p of products ?? []) {
    productMap.set(p.id, p.name);
  }

  const transactions = (purchases ?? []).map((p) => ({
    ...p,
    product_name: productMap.get(p.product_id) ?? 'Unknown Product',
  }));

  const paid = transactions.filter((t) => t.payment_status === 'paid');
  const totalRevenue = paid.reduce((sum, t) => sum + (t.amount_paid_ngn ?? 0), 0);
  const totalSales = paid.length;
  const pendingCount = transactions.filter((t) => t.payment_status === 'pending').length;

  return (
    <MarketplaceTransactions
      transactions={transactions}
      totalRevenue={totalRevenue}
      totalSales={totalSales}
      pendingCount={pendingCount}
    />
  );
}
