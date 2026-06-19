'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const KEYS = ['payment_plan_min_percent', 'payment_plan_deadline_days'] as const;

export async function updatePaymentPlanSettings(formData: FormData) {
  const supabase = await createClient();

  await Promise.all(
    KEYS.map((key) =>
      supabase
        .from('site_settings')
        .update({ value: String(formData.get(key) ?? '').trim() || null })
        .eq('key', key),
    ),
  );

  revalidatePath('/admin/payment-plans');
  redirect('/admin/payment-plans?saved=1');
}
