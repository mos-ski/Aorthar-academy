import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import PlanEditorClient from './PlanEditorClient';

type Props = { params: Promise<{ planId: string }> };

export default async function AdminPricingPlanPage({ params }: Props) {
  await requireRole('admin');
  const { planId } = await params;
  const supabase = await createClient();

  const { data: plan } = await supabase
    .from('plans')
    .select('id, name, description, price, currency, billing_type, plan_type, is_active')
    .eq('id', planId)
    .maybeSingle();

  if (!plan) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link href="/admin/pricing" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to Pricing
      </Link>
      <PlanEditorClient plan={plan} />
    </div>
  );
}
