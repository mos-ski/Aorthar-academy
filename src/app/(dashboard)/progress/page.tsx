import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { formatYearLabel, formatSemesterLabel } from '@/utils/formatters';
import { getDeptFromCode } from '@/lib/academics/departments';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Lock } from 'lucide-react';
import { getDemoStudentSnapshot } from '@/lib/demo/studentSnapshot';
import { isDemoMode, isExplicitLiveMode } from '@/lib/demo/mode';

export default async function ProgressPage() {
  const { user } = await requireAuth();
  const supabase = await createClient();
  const forcedDemo = await isDemoMode();
  const explicitLive = await isExplicitLiveMode();

  const [{ data: yearsData }, { data: profileData }, { data: progressData }, { data: semProgress }] =
    await Promise.all([
      supabase.from('years').select('*, semesters(*, courses(*))').order('level'),
      supabase
        .from('profiles')
        .select('department')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('user_progress')
        .select('course_id, status')
        .eq('user_id', user.id),
      supabase
        .from('semester_progress')
        .select('semester_id, is_unlocked, is_completed')
        .eq('user_id', user.id),
    ]);

  // Show a course if the student is enrolled in it OR it matches their department.
  // This handles cross-listed courses (e.g. DES101 in PM curriculum) correctly.
  const enrolledCourseIds = new Set((progressData ?? []).map((p) => p.course_id));
  const studentDept = profileData?.department || null;
  if (yearsData && studentDept) {
    for (const year of yearsData) {
      if (year.semesters) {
        for (const semester of year.semesters) {
          if (semester.courses) {
            semester.courses = semester.courses.filter(
              (c: { id: string; department: string | null; code: string }) =>
                enrolledCourseIds.has(c.id) ||
                c.department === studentDept ||
                getDeptFromCode(c.code) === studentDept,
            );
          }
        }
      }
    }
  }

  const demo = getDemoStudentSnapshot();
  const shouldUseDemo = forcedDemo || (!explicitLive && (yearsData?.length ?? 0) === 0);
  const years = shouldUseDemo ? demo.years : yearsData;
  const progressMap = new Map(
    (shouldUseDemo ? demo.progressRows : (progressData ?? [])).map((p) => [p.course_id, p.status]),
  );
  const semMap = new Map(
    (
      shouldUseDemo
        ? Array.from(demo.unlockedSemesterIds).map((semester_id) => ({
            semester_id,
            is_unlocked: true,
            is_completed: demo.completedSemesterIds.has(semester_id),
          }))
        : (semProgress ?? [])
    ).map((sp) => [sp.semester_id, sp]),
  );

  return (
    <div className="space-y-8">
      <div>
        {shouldUseDemo && (
          <Badge variant="outline" className="mb-3 bg-amber-50 text-amber-700 border-amber-200">
            Demo Mode: showing returning-student progress snapshot
          </Badge>
        )}
        <h1 className="text-3xl font-bold">Academic Progress</h1>
        <p className="text-muted-foreground mt-1">Your journey through the 4-year curriculum.</p>
      </div>

      {(years ?? []).map((year) => {
        const allCourses = year.semesters?.flatMap((s: { courses: { id: string }[] }) => s.courses) ?? [];
        const passed = allCourses.filter((c: { id: string }) => progressMap.get(c.id) === 'passed').length;
        const pct = allCourses.length > 0 ? Math.round((passed / allCourses.length) * 100) : 0;

        return (
          <div key={year.id} className="rounded-xl border border-border bg-card p-4 md:p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">{formatYearLabel(year.level)}</h2>
              <span className="text-sm text-muted-foreground">{passed}/{allCourses.length} courses passed</span>
            </div>
            <Progress value={pct} className="mb-4 h-2" />

            <div className="grid gap-4 md:grid-cols-2">
              {(year.semesters ?? []).map((semester: { id: string; number: number; courses: { id: string; name: string; code: string }[] }) => {
                const sp = semMap.get(semester.id);
                const isUnlocked = sp?.is_unlocked ?? (year.level === 100 && semester.number === 1);

                return (
                  <Card key={semester.id} className={`border-border ${!isUnlocked ? 'opacity-60' : ''}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        {isUnlocked ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        {formatSemesterLabel(semester.number)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {(semester.courses ?? []).map((course: { id: string; name: string; code: string }) => {
                        const status = progressMap.get(course.id);
                        return (
                          <div key={course.id} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground truncate">{course.name}</span>
                            <Badge
                              variant={status === 'passed' ? 'default' : status === 'failed' ? 'destructive' : 'outline'}
                              className="ml-2 text-xs shrink-0"
                            >
                              {status?.replace('_', ' ') ?? 'not started'}
                            </Badge>
                          </div>
                        );
                      })}
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
