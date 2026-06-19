import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CheckoutClient from './CheckoutClient';

type Props = { params: Promise<{ slug: string }> };

export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from('standalone_courses')
    .select('price_ngn, allow_payment_plan')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!course) notFound();

  const { data: settingsRows } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['payment_plan_min_percent', 'payment_plan_deadline_days']);

  const settings = Object.fromEntries((settingsRows ?? []).map((row) => [row.key, row.value]));
  const minPercent = Number(settings.payment_plan_min_percent ?? 50);
  const deadlineDays = Number(settings.payment_plan_deadline_days ?? 30);

  return (
    <CheckoutClient
      slug={slug}
      priceNgn={course.price_ngn}
      allowPaymentPlan={course.allow_payment_plan}
      minPercent={minPercent}
      deadlineDays={deadlineDays}
    />
  );
}
