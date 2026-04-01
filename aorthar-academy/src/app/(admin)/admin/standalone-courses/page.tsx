export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import StandaloneCoursesAdmin from './StandaloneCoursesAdmin';

export const metadata = { title: 'Ext. Courses — Admin' };

export default async function StandaloneCoursesPage() {
  await requireRole('admin');

  const supabase = await createClient();

  const { data: courses } = await supabase
    .from('standalone_courses')
    .select('id, slug, title, price_ngn, status, created_at')
    .order('created_at', { ascending: false });

  const courseIds = (courses ?? []).map((course) => course.id);
  const { data: purchases } = await supabase
    .from('standalone_purchases')
    .select('course_id')
    .in('course_id', courseIds.length ? courseIds : ['00000000-0000-0000-0000-000000000000']);

  const purchaseMap: Record<string, number> = {};
  (purchases ?? []).forEach((purchase) => {
    purchaseMap[purchase.course_id] = (purchaseMap[purchase.course_id] ?? 0) + 1;
  });

  return (
    <StandaloneCoursesAdmin
      courses={(courses ?? []).map((course) => ({ ...course, purchaseCount: purchaseMap[course.id] ?? 0 }))}
    />
  );
}
