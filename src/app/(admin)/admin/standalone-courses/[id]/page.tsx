export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import StandaloneCourseEditor from './StandaloneCourseEditor';

type Props = { params: Promise<{ id: string }> };
type Instructor = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
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

  const [{ data: lessons }, instructorsResponse] = await Promise.all([
    supabase
      .from('standalone_lessons')
      .select('*')
      .eq('course_id', id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('bootcamp_instructors')
      .select('id, full_name, email, avatar_url')
      .eq('is_active', true)
      .order('full_name', { ascending: true }),
  ]);

  let instructors = instructorsResponse.data as Instructor[] | null;
  if (instructorsResponse.error) {
    const { data: adminProfiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, email, avatar_url')
      .eq('role', 'admin')
      .order('full_name', { ascending: true });

    instructors = (adminProfiles ?? []).map((profile) => ({
      id: profile.user_id,
      full_name: profile.full_name,
      email: profile.email,
      avatar_url: profile.avatar_url,
    }));
  }

  return (
    <StandaloneCourseEditor
      course={course}
      instructors={instructors ?? []}
      lessons={lessons ?? []}
    />
  );
}
