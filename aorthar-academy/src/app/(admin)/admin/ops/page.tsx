import { createClient } from '@/lib/supabase/server';
import OpsHubClient, { type ExternalCourseRow, type StudentRow, type UniversityCourseRow } from './ops-hub-client';

type YearRow = {
  level: number;
  semesters: Array<{
    number: number;
    courses: Array<{
      id: string;
      code: string;
      name: string;
      status: string;
      is_premium: boolean;
      pass_mark: number;
      sort_order: number;
      semester_id: string;
    }>;
  }>;
};

export default async function AdminOpsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; courseTab?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const initialTab = params.tab ?? 'students';
  const initialCourseTab = params.courseTab ?? 'university';

  const [
    { data: profiles },
    { data: standalonePurchases },
    { data: standaloneCourses },
    { data: years },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, user_id, full_name, email, role, department, created_at, is_suspended, suspended_at, subscriptions(status)')
      .order('created_at', { ascending: false }),
    supabase
      .from('standalone_purchases')
      .select('user_id, course_id'),
    supabase
      .from('standalone_courses')
      .select('id, slug, title, price_ngn, status, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('years')
      .select('level, semesters(number, courses(id, code, name, status, is_premium, pass_mark, sort_order, semester_id))')
      .order('level', { ascending: true }),
  ]);

  const standaloneByUser = new Map<string, string[]>();
  for (const purchase of standalonePurchases ?? []) {
    const current = standaloneByUser.get(purchase.user_id) ?? [];
    current.push(purchase.course_id);
    standaloneByUser.set(purchase.user_id, current);
  }

  const students: StudentRow[] = (profiles ?? []).map((profile) => {
    const subscriptions = Array.isArray(profile.subscriptions)
      ? (profile.subscriptions as Array<{ status: string }>)
      : [];
    return {
      id: profile.id,
      user_id: profile.user_id,
      full_name: profile.full_name ?? '—',
      email: (profile as { email?: string | null }).email ?? null,
      role: profile.role,
      department: profile.department,
      created_at: profile.created_at,
      is_suspended: Boolean((profile as { is_suspended?: boolean }).is_suspended),
      suspended_at: (profile as { suspended_at?: string | null }).suspended_at ?? null,
      is_premium: subscriptions.some((subscription) => subscription.status === 'active'),
      standalone_course_ids: standaloneByUser.get(profile.user_id) ?? [],
    };
  });

  const universityCourses: UniversityCourseRow[] = [];
  for (const year of (years ?? []) as unknown as YearRow[]) {
    for (const semester of year.semesters ?? []) {
      for (const course of semester.courses ?? []) {
        universityCourses.push({
          ...course,
          year_level: year.level,
          semester_number: semester.number,
        });
      }
    }
  }

  const externalCourses: ExternalCourseRow[] = (standaloneCourses ?? []).map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    price_ngn: course.price_ngn,
    status: course.status,
    created_at: course.created_at,
  }));

  return (
    <OpsHubClient
      initialStudents={students}
      universityCourses={universityCourses}
      externalCourses={externalCourses}
      initialTab={initialTab}
      initialCourseTab={initialCourseTab}
    />
  );
}
