export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { DEMO_YEARS_WITH_COURSES } from '@/lib/demo/adminSnapshot';
import { isDemoMode, isExplicitLiveMode } from '@/lib/demo/mode';
import CoursesView from './_components/CoursesView';

type CourseRow = {
  id: string; code: string; name: string; credit_units: number;
  status: string; is_premium: boolean; pass_mark: number; sort_order: number;
  department: string | null;
};
type SemesterRow = { id: string; number: number; courses?: CourseRow[] };
type YearRow = { id: string; level: number; semesters?: SemesterRow[] };

export default async function AdminCoursesPage() {
  const demo = await isDemoMode();
  const explicitLive = await isExplicitLiveMode();
  let years: YearRow[] | null = null;
  let isDemo = demo;

  if (!demo) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('years')
        .select('*, semesters(*, courses(id, code, name, credit_units, status, is_premium, pass_mark, sort_order, department))')
        .order('level', { ascending: true });
      years = data as YearRow[] | null;
    } catch {
      // Supabase not configured — fall through to demo
    }
  }

  if (!explicitLive && (!years || years.length === 0)) {
    years = DEMO_YEARS_WITH_COURSES as unknown as YearRow[];
    isDemo = true;
  }

  const safeYears = (years ?? []).map((y) => ({
    ...y,
    semesters: (y.semesters ?? []).map((s) => ({
      ...s,
      courses: (s.courses ?? []).sort((a, b) => a.sort_order - b.sort_order),
    })),
  }));

  return <CoursesView years={safeYears} isDemo={isDemo} />;
}
