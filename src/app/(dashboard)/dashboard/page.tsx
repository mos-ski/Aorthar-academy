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

  // Department filtering
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

  // Bootstrap first-time students
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

  // --- Data Aggregation ---

  const stats = {
    gpa: Number(displayGpa?.cumulative_gpa ?? 0).toFixed(2),
    credits: displayGpa?.total_credits_earned ?? 0,
    completed: (progress ?? []).filter((p: any) => p.status === 'passed').length,
    inProgress: (progress ?? []).filter((p: any) => p.status === 'in_progress').length,
  };

  // Most recently active course for "Continue Learning"
  const activeCourse = (recentCourses?.length ?? 0) > 0 ? (recentCourses![0] as any) : null;
  const activeCourseData = activeCourse?.courses;

  // Current Year/Semester
  const firstYear = years?.[0];
  const currentYearLevel = firstYear?.level ?? 100;
  const currentSemesterNumber = firstYear?.semesters?.[0]?.number ?? 1;

  // Courses for the current semester
  const currentSemCourses =
    firstYear?.semesters
      ?.find((s: any) => s.number === 1)
      ?.courses?.filter((c: any) => c.status === 'published') ?? [];

  // Progress for each course in current semester
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
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Welcome back, {firstName}
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Year {currentYearLevel} · Semester {currentSemesterNumber}
        </p>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="GPA" value={stats.gpa} icon={Award} color="text-emerald-400" />
          <StatCard label="Credits" value={stats.credits.toString()} icon={BookOpen} color="text-blue-400" />
          <StatCard label="Completed" value={stats.completed.toString()} icon={Trophy} color="text-amber-400" />
          <StatCard label="In Progress" value={stats.inProgress.toString()} icon={TrendingUp} color="text-purple-400" />
        </div>
      </div>

      {/* Primary Action: Continue Learning */}
      {activeCourseData ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Continue Learning
            </h2>
            {activeCourse.courses?.department && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-300">
                {activeCourse.courses.department}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-emerald-400">
                  {activeCourse.courses.code}
                </span>
                <span className="text-xs text-gray-500">·</span>
                <span className="text-sm text-gray-400">
                  {activeCourse.courses.years?.level} Level
                </span>
              </div>
              <h3 className="mt-1 truncate text-xl font-semibold text-white">
                {activeCourse.courses.name}
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Status: <span className="capitalize text-white">{activeCourse.status.replace('_', ' ')}</span>
              </p>
            </div>
            <Link
              href={`/classroom/${activeCourse.courses.id}`}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              <Play className="h-4 w-4" />
              Resume
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-4 text-lg font-semibold text-white">No active courses</h3>
          <p className="mt-1 text-sm text-gray-400">
            Start a course to see your progress here.
          </p>
          <Link
            href="/courses"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            Browse Courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Secondary Action: Your Courses (Current Semester) */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Your Courses — Semester {currentSemesterNumber}
          </h2>
          <Link
            href="/courses"
            className="text-sm font-medium text-gray-400 hover:text-white"
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
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : status === 'in_progress'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-white/5 text-gray-400 border-white/10';

              return (
                <Link
                  key={course.id}
                  href={`/classroom/${course.id}`}
                  className="group rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-emerald-500/50 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs font-bold text-gray-500">
                      {course.code}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor}`}
                    >
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    {course.name}
                  </h3>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-gray-400">
            No courses found for this semester.
          </div>
        )}
      </div>
    </div>
  );
}

// --- Subcomponents ---

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
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
