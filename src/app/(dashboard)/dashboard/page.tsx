import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { getDeptFromCode } from '@/lib/academics/departments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatYearLabel } from '@/utils/formatters';
import Link from 'next/link';
import { BookOpen, Trophy, TrendingUp, Award, Flame, ArrowRight, Lock } from 'lucide-react';
import { getDemoStudentSnapshot } from '@/lib/demo/studentSnapshot';
import { isDemoMode, isExplicitLiveMode } from '@/lib/demo/mode';

export default async function DashboardPage() {
  const { user, profile } = await requireAuth();
  const supabase = await createClient();
  const forcedDemo = await isDemoMode();
  const explicitLive = await isExplicitLiveMode();

  const [
    { data: gpa },
    { data: initialProgress },
    { data: initialRecentCourses },
    { data: years },
    { data: semesterProgress },
    { data: streakProfile },
  ] = await Promise.all([
    supabase
      .from('cumulative_gpas')
      .select('cumulative_gpa, total_credits_earned')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('user_progress')
      .select('status, courses(name, code, years(level))')
      .eq('user_id', user.id),
    supabase
      .from('user_progress')
      .select('status, courses(id, name, code, department, years(level))')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(12),
    supabase
      .from('years')
      .select('id, level, semesters(id, number, courses(id, status, department))')
      .order('level'),
    supabase
      .from('semester_progress')
      .select('semester_id, is_unlocked')
      .eq('user_id', user.id),
    supabase
      .from('profiles')
      .select('streak_count, last_active_date')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  const demo = getDemoStudentSnapshot();
  const hasCatalog = (years?.length ?? 0) > 0;
  const shouldUseDemo = forcedDemo || (!explicitLive && !hasCatalog);
  const firstName =
    profile?.full_name?.split(' ')[0] ??
    user.email?.split('@')[0] ??
    'Student';

  let progress = shouldUseDemo ? demo.progressRows : initialProgress;
  let recentCourses = shouldUseDemo ? demo.recentCourses : initialRecentCourses;
  const displayGpa = shouldUseDemo ? demo.cumulativeGpa : gpa;

  // Bootstrap first-time students so dashboard is not empty.
  const studentDept = profile?.department || null;

  // Filter recent activity to only show courses from the student's department
  // (stale user_progress records from before department filtering was introduced)
  if (!shouldUseDemo && studentDept && recentCourses) {
    recentCourses = (recentCourses as unknown as { status: string; courses: { id: string; name: string; code: string; department: string | null; years: { level: number } } | null }[])
      .filter((item) => {
        const c = item.courses;
        if (!c) return false;
        return c.department === studentDept || getDeptFromCode(c.code) === studentDept;
      })
      .slice(0, 6) as typeof recentCourses;
  }
  if (!shouldUseDemo && (progress?.length ?? 0) === 0 && (years?.length ?? 0) > 0) {
    const unlocked = new Set(
      (semesterProgress ?? [])
        .filter((sp) => sp.is_unlocked)
        .map((sp) => sp.semester_id),
    );

    const firstYear = years?.[0];
    const firstSem = firstYear?.semesters?.[0];
    if (firstSem) unlocked.add(firstSem.id);

    const starterCourses =
      (years ?? []).flatMap((year) =>
        (year.semesters ?? [])
          .filter((semester: { id: string }) => unlocked.has(semester.id))
          .flatMap((semester: { courses: { id: string; code?: string; status: string; department: string | null }[] }) => semester.courses ?? [])
          .filter((course: { status: string; department: string | null; code?: string }) =>
            course.status === 'published' &&
            (!studentDept || course.department === studentDept || getDeptFromCode(course.code ?? '') === studentDept)
          ),
      );

    if (starterCourses.length > 0) {
      await supabase.from('user_progress').upsert(
        starterCourses.map((course: { id: string }) => ({
          user_id: user.id,
          course_id: course.id,
          status: 'not_started',
          enrolled_at: new Date().toISOString(),
        })),
        { onConflict: 'user_id,course_id' },
      );

      const [{ data: refreshedProgress }, { data: refreshedRecent }] = await Promise.all([
        supabase
          .from('user_progress')
          .select('status, courses(name, code, years(level))')
          .eq('user_id', user.id),
        supabase
          .from('user_progress')
          .select('status, courses(id, name, code, department, years(level))')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(12),
      ]);

      progress = refreshedProgress ?? progress;
      recentCourses = refreshedRecent ?? recentCourses;
    }
  }

  const passedCount = progress?.filter((p) => p.status === 'passed').length ?? 0;
  const inProgressCount = progress?.filter((p) => p.status === 'in_progress').length ?? 0;
  const cumulativeGpaValue = Number(displayGpa?.cumulative_gpa ?? 0);
  const creditsEarnedValue = Number(displayGpa?.total_credits_earned ?? 0);

  // Continue Learning CTA: find the most recent in_progress course, then not_started
  type RecentCourse = { status: string; courses: { id: string; name: string; code: string; years: { level: number } } | null };
  const continueCourse = (recentCourses as unknown as RecentCourse[] | null)?.find(
    (r) => r.courses && r.status === 'in_progress',
  ) ?? (recentCourses as unknown as RecentCourse[] | null)?.find(
    (r) => r.courses && r.status === 'not_started',
  );
  const allPassed = (progress?.length ?? 0) > 0 && passedCount === (progress?.length ?? 0);

  // Unlock nudge: find first locked semester and count remaining courses to unlock it
  const unlockedSemIds = new Set((semesterProgress ?? []).filter((sp) => sp.is_unlocked).map((sp) => sp.semester_id));
  let unlockNudge: { label: string; remaining: number; isPremium?: boolean } | null = null;
  if (!shouldUseDemo) {
    outer: for (const year of (years ?? [])) {
      for (const sem of (year.semesters ?? [])) {
        if (!unlockedSemIds.has(sem.id)) {
          // This semester is locked — count how many courses in the prior semester are not passed
          // The unlock count is courses in the previous semester
          const prevSems = (year.semesters ?? []).filter((s: { id: string }) => s.id !== sem.id);
          const prevCourses = prevSems.flatMap((s: { courses: { id: string; status: string }[] }) => s.courses ?? []);
          const remaining = prevCourses.filter((c: { status: string }) => c.status === 'published').length - passedCount;
          unlockNudge = {
            label: `Semester ${sem.number} · Year ${year.level}`,
            remaining: Math.max(0, remaining),
          };
          break outer;
        }
      }
    }
  }

  const streakCount = (streakProfile as unknown as { streak_count?: number } | null)?.streak_count ?? 0;

  return (
    <div className="space-y-6">
      <div>
        {shouldUseDemo && (
          <Badge variant="outline" className="mb-3 bg-amber-50 text-amber-700 border-amber-200">
            Demo Mode: backend is unreachable, showing returning-student preview
          </Badge>
        )}
        <p className="text-sm text-muted-foreground">Welcome,</p>
        <h1 className="text-5xl font-bold tracking-tight mt-1">Welcome back, {firstName}!</h1>
        <p className="text-muted-foreground mt-2">Track your academic journey at Aorthar Academy.</p>
      </div>

      {/* Continue Learning CTA */}
      {allPassed ? (
        <Card className="border-0 bg-green-500/10 dark:bg-green-500/15">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <p className="font-semibold text-green-700 dark:text-green-400">
              You&apos;re up to date — explore new courses
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/courses">Browse Courses <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      ) : continueCourse?.courses ? (
        <Card className="border-0 bg-foreground text-background">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm opacity-70">Continue Learning</p>
              <p className="font-semibold text-lg">{continueCourse.courses.name}</p>
              <p className="text-sm opacity-60">{continueCourse.courses.code}</p>
            </div>
            <Button asChild variant="secondary" size="sm" className="shrink-0">
              <Link href={`/classroom/${continueCourse.courses.id}`}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 bg-foreground text-background">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <p className="font-semibold">Start your learning journey</p>
            <Button asChild variant="secondary" size="sm">
              <Link href="/courses">Start Learning <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-violet-500/10 dark:bg-violet-500/15">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-violet-700 dark:text-violet-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Cumulative GPA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{cumulativeGpaValue.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">out of 5.0</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-amber-500/10 dark:bg-amber-500/15">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Credits Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{creditsEarnedValue}</p>
            <p className="text-sm text-muted-foreground">credit units</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-green-500/10 dark:bg-green-500/15">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Courses Passed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{passedCount}</p>
            <p className="text-sm text-muted-foreground">completed</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-blue-500/10 dark:bg-blue-500/15">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{inProgressCount}</p>
            <p className="text-sm text-muted-foreground">active courses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Streak Tracker */}
        <Card className="border-0 bg-orange-500/10 dark:bg-orange-500/15">
          <CardContent className="p-5 flex items-center gap-4">
            <Flame className="h-8 w-8 text-orange-500 shrink-0" aria-hidden="true" />
            <div>
              {streakCount > 0 ? (
                <>
                  <p className="font-semibold text-orange-700 dark:text-orange-400">{streakCount} day streak</p>
                  <p className="text-sm text-muted-foreground">Keep it up — log in daily to maintain your streak.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold">Start your streak today</p>
                  <p className="text-sm text-muted-foreground">Open any lesson to begin tracking your streak.</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Unlock Nudge */}
        {unlockNudge ? (
          <Link href="/progress">
            <Card className="border-0 bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer h-full">
              <CardContent className="p-5 flex items-center gap-4">
                <Lock className="h-8 w-8 text-muted-foreground shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">
                    {unlockNudge.remaining === 0
                      ? `Ready to unlock ${unlockNudge.label}`
                      : `${unlockNudge.remaining} course${unlockNudge.remaining === 1 ? '' : 's'} left to unlock ${unlockNudge.label}`}
                  </p>
                  <p className="text-sm text-muted-foreground">View your progress →</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ) : null}
      </div>

      <div>
        <h2 className="text-4xl font-semibold mb-3">Recent Activity</h2>
        {(recentCourses ?? []).length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {(recentCourses ?? []).map((item) => {
              const course = item.courses as unknown as { id: string; name: string; code: string; years: { level: number } };
              if (!course) return null;
              return (
                <Link key={course.id} href={`/classroom/${course.id}`}>
                  <Card className="hover:bg-muted/30 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{course.name}</p>
                        <p className="text-sm text-muted-foreground">{course.code} · {formatYearLabel(course.years.level)}</p>
                      </div>
                      <Badge variant={item.status === 'passed' ? 'default' : 'secondary'}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">No activity yet. Open the curriculum to start your first course.</p>
              <Link href="/courses" className="underline mt-3 inline-block">
                Go to Courses
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="bg-muted/20">
        <CardContent className="p-6">
          <p className="text-xl font-semibold">Learning Tips</p>
          <div className="mt-3 text-sm text-muted-foreground space-y-2">
            <p>1. Keep up with at least one lesson per day.</p>
            <p>2. Attempt quizzes after each completed module.</p>
            <p>3. Use Suggest Content to request deep-dive materials.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
