import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import PricingConfigClient, { type AdminPlanRow } from './PricingConfigClient';

export default async function AdminPricingPage() {
  await requireRole('admin');
  const supabase = await createClient();

  const { data: plans } = await supabase
    .from('plans')
    .select('id, name, description, price, currency, billing_type, plan_type, is_active')
    .order('price', { ascending: true });

  return <PricingConfigClient initialPlans={(plans ?? []) as AdminPlanRow[]} />;
}
