export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import PlanEditorClient from './PlanEditorClient';

type Props = { params: Promise<{ planId: string }> };

export default async function AdminPricingPlanPage({ params }: Props) {
  await requireRole('admin');
  const { planId } = await params;
  const supabase = createAdminClient();

  const [{ data: plan }, { data: universityCourses }, { data: externalCourses }] = await Promise.all([
    supabase
      .from('plans')
      .select('id, name, description, price, currency, billing_type, plan_type, is_active, access_scope')
      .eq('id', planId)
      .maybeSingle(),
    supabase
      .from('courses')
      .select('id, code, name, status, is_premium')
      .order('code', { ascending: true }),
    supabase
      .from('standalone_courses')
      .select('id, slug, title, status')
      .order('title', { ascending: true }),
  ]);

  if (!plan) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link href="/admin/pricing" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to Pricing
      </Link>
      <PlanEditorClient
        plan={plan}
        universityCourses={universityCourses ?? []}
        externalCourses={externalCourses ?? []}
      />
    </div>
  );
}
