import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { getDeptFromCode } from '@/lib/academics/departments';
import Link from 'next/link';
import {
  BookOpen,
  Trophy,
  TrendingUp,
  Award,
  Flame,
  ArrowRight,
  Lock,
  Play,
} from 'lucide-react';
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

  const studentDept = profile?.department || null;
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

    const starterCourses = (years ?? []).flatMap((year) =>
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
      progress = (await supabase.from('user_progress').select('status, courses(name, code, years(level))').eq('user_id', user.id)).data;
      recentCourses = (await supabase.from('user_progress').select('status, courses(id, name, code, department, years(level))').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(12)).data;
    }
  }

  const stats = {
    gpa: Number(displayGpa?.cumulative_gpa ?? 0).toFixed(2),
    credits: displayGpa?.total_credits_earned ?? 0,
    completed: (progress ?? []).filter((p: any) => p.status === 'passed').length,
    inProgress: (progress ?? []).filter((p: any) => p.status === 'in_progress').length,
  };

  const activeCourse = (recentCourses?.length ?? 0) > 0 ? (recentCourses![0] as any) : null;
  const activeCourseData = activeCourse?.courses;

  const firstYear = years?.[0];
  const currentYearLevel = firstYear?.level ?? 100;
  const currentSemesterNumber = firstYear?.semesters?.[0]?.number ?? 1;

  const currentSemCourses =
    firstYear?.semesters
      ?.find((s: any) => s.number === 1)
      ?.courses?.filter((c: any) => c.status === 'published') ?? [];

  const progressMap: Record<string, string> = {};
  for (const p of progress ?? []) {
    if ((p as any).courses) {
      progressMap[(p as any).courses.id] = p.status;
    }
  }

  return (
    <div className="space-y-8">
      {/* Context Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Year {currentYearLevel} · Semester {currentSemesterNumber}
        </p>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="GPA" value={stats.gpa} icon={Award} color="text-primary" />
          <StatCard label="Credits" value={stats.credits.toString()} icon={BookOpen} color="text-blue-500" />
          <StatCard label="Completed" value={stats.completed.toString()} icon={Trophy} color="text-amber-500" />
          <StatCard label="In Progress" value={stats.inProgress.toString()} icon={TrendingUp} color="text-purple-500" />
        </div>
      </div>

      {/* Primary Action: Continue Learning */}
      {activeCourseData ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Continue Learning
            </h2>
            {activeCourse.courses?.department && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {activeCourse.courses.department}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-primary">
                  {activeCourse.courses.code}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">
                  {activeCourse.courses.years?.level} Level
                </span>
              </div>
              <h3 className="mt-1 truncate text-xl font-semibold text-foreground">
                {activeCourse.courses.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Status: <span className="capitalize text-foreground">{activeCourse.status.replace('_', ' ')}</span>
              </p>
            </div>
            <Link
              href={`/classroom/${activeCourse.courses.id}`}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Play className="h-4 w-4" />
              Resume
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/50 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No active courses</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Start a course to see your progress here.
          </p>
          <Link
            href="/courses"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
          >
            Browse Courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Secondary Action: Your Courses (Current Semester) */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Your Courses — Semester {currentSemesterNumber}
          </h2>
          <Link
            href="/courses"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            View All Years →
          </Link>
        </div>

        {currentSemCourses.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentSemCourses.map((course: any) => {
              const status = progressMap[course.id] ?? 'not_started';
              const progressPct = status === 'passed' ? 100 : status === 'in_progress' ? 50 : 0;
              const statusColor =
                status === 'passed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : status === 'in_progress'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-muted text-muted-foreground border-border';

              return (
                <Link
                  key={course.id}
                  href={`/classroom/${course.id}`}
                  className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      {course.code}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor}`}
                    >
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {course.name}
                  </h3>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-muted/50 p-8 text-center text-sm text-muted-foreground">
            No courses found for this semester.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
