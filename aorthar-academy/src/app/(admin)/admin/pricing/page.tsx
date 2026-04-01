import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';
import PricingConfigClient, { type AdminPlanRow } from './PricingConfigClient';

export default async function AdminPricingPage() {
  await requireRole('admin');
  const supabase = createAdminClient();

  const { data: currentPlans } = await supabase
    .from('plans')
    .select('id, name, plan_type')
    .order('price', { ascending: true });

  const hasFreePlan = (currentPlans ?? []).some(
    (plan) =>
      String((plan as { plan_type?: string }).plan_type ?? '').toLowerCase() === 'free'
      || String((plan as { name?: string }).name ?? '').toLowerCase() === 'free',
  );

  if (!hasFreePlan) {
    await supabase.from('plans').insert({
      name: 'Free',
      description: 'Default free access plan.',
      price: 0,
      currency: 'NGN',
      billing_type: 'one_time',
      plan_type: 'free',
      access_scope: [],
      is_active: true,
    });
  }

  const { data: plans } = await supabase
    .from('plans')
    .select('id, name, description, price, currency, billing_type, plan_type, is_active, access_scope')
    .order('price', { ascending: true });

  return <PricingConfigClient initialPlans={(plans ?? []) as AdminPlanRow[]} />;
}
