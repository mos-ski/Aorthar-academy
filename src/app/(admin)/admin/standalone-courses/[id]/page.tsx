export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import StandaloneCourseEditor from './StandaloneCourseEditor';

type Props = { params: Promise<{ id: string }> };
type Instructor = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: 'admin' | 'student' | 'contributor';
};

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

  const [{ data: lessons }, { data: instructors }] = await Promise.all([
    supabase
      .from('standalone_lessons')
      .select('*')
      .eq('course_id', id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('profiles')
      .select('user_id, full_name, email, avatar_url, role')
      .eq('role', 'admin')
      .order('full_name', { ascending: true }),
  ]);

  return (
    <StandaloneCourseEditor
      course={course}
      instructors={(instructors ?? []) as Instructor[]}
      lessons={lessons ?? []}
    />
  );
}
