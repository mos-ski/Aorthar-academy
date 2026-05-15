export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import CouponAdmin from './CouponAdmin';

export const metadata = { title: 'Coupons — Admin' };

export default async function CouponsPage() {
  await requireRole('admin');

  const supabase = await createClient();

  const [couponsRes, coursesRes] = await Promise.all([
    supabase
      .from('coupon_codes')
      .select('*, standalone_courses(title, slug)')
      .order('created_at', { ascending: false }),
    supabase
      .from('standalone_courses')
      .select('id, title, slug')
      .order('title', { ascending: true }),
  ]);

  return (
    <CouponAdmin
      coupons={couponsRes.data ?? []}
      courses={coursesRes.data ?? []}
    />
  );
}