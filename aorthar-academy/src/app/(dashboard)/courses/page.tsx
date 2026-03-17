import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { formatYearLabel, formatSemesterLabel } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Lock, BookOpen, BookMarked, Layers, GraduationCap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const YEAR_ICONS: Record<number, LucideIcon> = {
  100: BookOpen,
  200: BookMarked,
  300: Layers,
  400: GraduationCap,
};
import CourseCard from '@/components/courses/CourseCard';
import { getDemoStudentSnapshot } from '@/lib/demo/studentSnapshot';
import { isDemoMode, isExplicitLiveMode } from '@/lib/demo/mode';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function CoursesPage() {
  const { user } = await requireAuth();
  const supabase = await createClient();
  const forcedDemo = await isDemoMode();
  const explicitLive = await isExplicitLiveMode();

  const [{ data: yearsData }, { data: passedCourseIds }, { data: semesterProgressData }] =
    await Promise.all([
      supabase
        .from('years')
        .select('*, semesters(*, courses(*))')
        .order('level'),
      supabase
        .from('course_grades')
        .select('course_id')
        .eq('user_id', user.id)
        .eq('passed', true),
      supabase
        .from('semester_progress')
        .select('semester_id, is_unlocked')
        .eq('user_id', user.id),
    ]);

  const demo = getDemoStudentSnapshot();
  const shouldUseDemo = forcedDemo || (!explicitLive && (yearsData?.length ?? 0) === 0);
  const years = shouldUseDemo ? demo.years : yearsData;

  const passed = shouldUseDemo
    ? demo.passedCourseIds
    : new Set((passedCourseIds ?? []).map((g) => g.course_id));
  const unlocked = shouldUseDemo
    ? demo.unlockedSemesterIds
    : new Set(
        (semesterProgressData ?? [])
          .filter((sp) => sp.is_unlocked)
          .map((sp) => sp.semester_id),
      );

  // Year 1 Sem 1 is always unlocked
  const firstYear = years?.[0];
  const firstSem = firstYear?.semesters?.[0];
  if (firstSem) unlocked.add(firstSem.id);
  const defaultTab = years?.[0]?.level ? `year-${years[0].level}` : 'year-100';

  return (
    <div className="space-y-8">
      <div>
        {shouldUseDemo && (
          <Badge variant="outline" className="mb-3 bg-amber-50 text-amber-700 border-amber-200">
            Demo Mode: showing curriculum preview
          </Badge>
        )}
        <h1 className="text-3xl font-bold">Curriculum</h1>
        <p className="text-muted-foreground mt-1">Your 4-year structured learning path.</p>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-5">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl border border-border bg-card p-1.5">
          {(years ?? []).map((year) => {
            const Icon = YEAR_ICONS[year.level] ?? BookOpen;
            return (
              <TabsTrigger
                key={year.id}
                value={`year-${year.level}`}
                className="min-w-[120px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-3.5 w-3.5" />
                {formatYearLabel(year.level)}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(years ?? []).map((year) => (
          <TabsContent key={year.id} value={`year-${year.level}`} className="space-y-6 rounded-2xl border border-border bg-card/95 p-4 md:p-5 shadow-[0_8px_24px_rgba(24,25,26,0.04)]">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-2xl font-semibold">{formatYearLabel(year.level)}</h2>
              <Badge variant="outline" className="border-primary/25 text-primary bg-accent/25">
                {year.semesters?.flatMap((s: { courses: unknown[] }) => s.courses ?? []).length ?? 0} Courses
              </Badge>
            </div>

            {(year.semesters ?? []).map((semester: { id: string; number: number; courses: { id: string; name: string; code: string; is_premium: boolean }[] }) => {
              const isUnlocked = unlocked.has(semester.id);

              return (
                <div key={semester.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium">{formatSemesterLabel(semester.number)}</h3>
                    {!isUnlocked && (
                      <Badge variant="outline" className="text-muted-foreground gap-1">
                        <Lock className="h-3 w-3" /> Locked
                      </Badge>
                    )}
                  </div>

                  <div className={`grid gap-3 md:grid-cols-2 lg:grid-cols-3 ${!isUnlocked ? 'opacity-50 pointer-events-none' : ''}`}>
                    {(semester.courses ?? []).map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        isPassed={passed.has(course.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>

    </div>
  );
}
