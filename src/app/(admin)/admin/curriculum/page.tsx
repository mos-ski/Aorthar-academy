export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

type CourseItem = {
  id: string;
  code: string;
  name: string;
  is_premium: boolean;
};

type YearData = {
  sem1: CourseItem[];
  sem2: CourseItem[];
};

// Extract department prefix from course code
function getDeptPrefix(code: string): string {
  return code.match(/^([A-Z]+)/)?.[1] ?? 'OTHER';
}

const DEPT_LABELS: Record<string, string> = {
  PM: 'Product Management',
  DES: 'Product Design',
  FE: 'Frontend Engineering',
  BE: 'Backend Engineering',
  QA: 'Quality Analytics',
  SO: 'Scrum & Agile Ops',
  DA: 'Data & Analytics',
  GO: 'Growth & Marketing',
  GM: 'Growth & Marketing',
  OP: 'Operations',
  OPS: 'DevOps & Operations',
};

const YEAR_THEMES: Record<number, { label: string; color: string }> = {
  100: { label: 'Foundation', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  200: { label: 'Application', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  300: { label: 'Mastery', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  400: { label: 'Industry', color: 'bg-green-100 text-green-800 border-green-200' },
};

export default async function CurriculumPage() {
  const admin = createAdminClient();

  const { data: courses } = await admin
    .from('courses')
    .select('id, code, name, is_premium, years(level), semesters(number)')
    .eq('status', 'published')
    .order('code', { ascending: true });

  // Group courses by department prefix → year level → semester
  const deptMap = new Map<string, Map<number, YearData>>();

  for (const course of (courses ?? [])) {
    const prefix = getDeptPrefix(course.code);
    const year = course.years as unknown as { level: number } | null;
    const sem = course.semesters as unknown as { number: number } | null;
    if (!year || !sem) continue;

    if (!deptMap.has(prefix)) deptMap.set(prefix, new Map());
    const yearMap = deptMap.get(prefix)!;
    if (!yearMap.has(year.level)) {
      yearMap.set(year.level, { sem1: [], sem2: [] });
    }
    const yearData = yearMap.get(year.level)!;
    const item: CourseItem = { id: course.id, code: course.code, name: course.name, is_premium: course.is_premium };
    if (sem.number === 1) yearData.sem1.push(item);
    else if (sem.number === 2) yearData.sem2.push(item);
  }

  const departments = Array.from(deptMap.entries()).sort((a, b) =>
    (DEPT_LABELS[a[0]] ?? a[0]).localeCompare(DEPT_LABELS[b[0]] ?? b[0]),
  );

  if (departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="font-medium text-sm">No curriculum data yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Seed the curriculum first, then the roadmap will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Curriculum Roadmap</h2>
        <p className="text-sm text-muted-foreground">
          {departments.length} departments · 4 years · 2 semesters each
        </p>
      </div>

      {departments.map(([prefix, yearMap]) => {
        const deptName = DEPT_LABELS[prefix] ?? prefix;
        const totalCourses = Array.from(yearMap.values()).reduce(
          (s, y) => s + y.sem1.length + y.sem2.length,
          0,
        );

        return (
          <div key={prefix} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center text-xs font-bold font-mono">
                {prefix}
              </div>
              <div>
                <h3 className="font-semibold text-base">{deptName}</h3>
                <p className="text-xs text-muted-foreground">{totalCourses} courses</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[100, 200, 300, 400].map((level) => {
                const yearData = yearMap.get(level);
                const theme = YEAR_THEMES[level];
                const allCourses = [...(yearData?.sem1 ?? []), ...(yearData?.sem2 ?? [])];
                const premiumCount = allCourses.filter((c) => c.is_premium).length;

                return (
                  <Card key={level} className={`relative overflow-hidden ${!yearData ? 'opacity-40' : ''}`}>
                    <div className={`h-1 w-full ${
                      level === 100 ? 'bg-blue-400' :
                      level === 200 ? 'bg-purple-400' :
                      level === 300 ? 'bg-amber-400' :
                      'bg-green-400'
                    }`} />
                    <CardHeader className="pb-2 pt-3 px-3">
                      <div className="flex items-start justify-between gap-1">
                        <CardTitle className="text-sm font-semibold">Year {level}</CardTitle>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${theme?.color ?? ''}`}>
                          {theme?.label}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 space-y-2">
                      {yearData ? (
                        <>
                          {([1, 2] as const).map((semNum) => {
                            const semCourses = semNum === 1 ? yearData.sem1 : yearData.sem2;
                            return (
                              <div key={semNum}>
                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                                  Semester {semNum}
                                </p>
                                <div className="space-y-0.5">
                                  {semCourses.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">No courses</p>
                                  ) : (
                                    semCourses.slice(0, 5).map((c) => (
                                      <p key={c.id} className="text-xs text-foreground/80 leading-snug truncate">
                                        <span className="font-mono text-[10px] text-muted-foreground mr-1">{c.code}</span>
                                        {c.name}
                                      </p>
                                    ))
                                  )}
                                  {semCourses.length > 5 && (
                                    <p className="text-[10px] text-muted-foreground">+{semCourses.length - 5} more</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          <div className="flex items-center gap-1.5 pt-1 border-t">
                            <span className="text-[10px] text-muted-foreground">{allCourses.length} courses</span>
                            {premiumCount > 0 && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1">
                                {premiumCount} premium
                              </Badge>
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Not yet seeded</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
