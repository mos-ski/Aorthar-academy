import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth';
import StandaloneCourseEditor from './StandaloneCourseEditor';

type Props = { params: Promise<{ id: string }> };

export default async function StandaloneCourseEditPage({ params }: Props) {
  const { id } = await params;
  await requireRole('admin');

  const supabase = await createClient();

  const { data: course } = await supabase
    .from('standalone_courses')
    .select('*')
    .eq('id', id)
    .single();

  if (!course) notFound();

  const { data: lessons } = await supabase
    .from('standalone_lessons')
    .select('*')
    .eq('course_id', id)
    .order('sort_order', { ascending: true });

  return <StandaloneCourseEditor course={course} lessons={lessons ?? []} />;
}
