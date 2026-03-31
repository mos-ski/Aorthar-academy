import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth';
import StandaloneCoursesAdmin from './StandaloneCoursesAdmin';

export const metadata = { title: 'Ext. Courses — Admin' };

export default async function StandaloneCoursesPage() {
  await requireRole('admin');

  const supabase = await createClient();

  const { data: courses } = await supabase
    .from('standalone_courses')
    .select('id, slug, title, price_ngn, status, created_at')
    .order('created_at', { ascending: false });

  // Purchase counts per course
  const courseIds = (courses ?? []).map((c) => c.id);
  const { data: purchases } = await supabase
    .from('standalone_purchases')
    .select('course_id')
    .in('course_id', courseIds.length ? courseIds : ['00000000-0000-0000-0000-000000000000']);

  const purchaseMap: Record<string, number> = {};
  (purchases ?? []).forEach((p) => {
    purchaseMap[p.course_id] = (purchaseMap[p.course_id] ?? 0) + 1;
  });

  return (
    <StandaloneCoursesAdmin
      courses={(courses ?? []).map((c) => ({ ...c, purchaseCount: purchaseMap[c.id] ?? 0 }))}
    />
  );
}
