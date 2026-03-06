import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatYearLabel } from '@/utils/formatters';
import Link from 'next/link';
import { BookOpen, Trophy, TrendingUp, Award } from 'lucide-react';
import { getDemoStudentSnapshot } from '@/lib/demo/studentSnapshot';

export default async function DashboardPage() {
  const { user, profile } = await requireAuth();
  const supabase = await createClient();

  const [{ data: gpa }, { data: initialProgress }, { data: initialRecentCourses }, { data: years }, { data: semesterProgress }] =
    await Promise.all([
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
        .select('status, courses(id, name, code, years(level))')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(4),
      supabase
        .from('years')
        .select('id, level, semesters(id, number, courses(id, status))')
        .order('level'),
      supabase
        .from('semester_progress')
        .select('semester_id, is_unlocked')
        .eq('user_id', user.id),
    ]);
  const demo = getDemoStudentSnapshot();
  const hasCatalog = (years?.length ?? 0) > 0;
  const shouldUseDemo = !hasCatalog;
  const firstName =
    profile?.full_name?.split(' ')[0] ??
    user.email?.split('@')[0] ??
    'Student';

  let progress = shouldUseDemo ? demo.progressRows : initialProgress;
  let recentCourses = shouldUseDemo ? demo.recentCourses : initialRecentCourses;
  const displayGpa = shouldUseDemo ? demo.cumulativeGpa : gpa;

  // Bootstrap first-time students so dashboard is not empty.
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
          .flatMap((semester: { courses: { id: string; status: string }[] }) => semester.courses ?? [])
          .filter((course: { status: string }) => course.status === 'published'),
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
          .select('status, courses(id, name, code, years(level))')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(4),
      ]);

      progress = refreshedProgress ?? progress;
      recentCourses = refreshedRecent ?? recentCourses;
    }
  }

  const passedCount = progress?.filter((p) => p.status === 'passed').length ?? 0;
  const inProgressCount = progress?.filter((p) => p.status === 'in_progress').length ?? 0;
  const cumulativeGpaValue = Number(displayGpa?.cumulative_gpa ?? 0);
  const creditsEarnedValue = Number(displayGpa?.total_credits_earned ?? 0);

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Cumulative GPA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">{cumulativeGpaValue.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Credits Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">{creditsEarnedValue}</p>
            <p className="text-sm text-muted-foreground">credit units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Courses Passed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">{passedCount}</p>
            <p className="text-sm text-muted-foreground">completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">{inProgressCount}</p>
            <p className="text-sm text-muted-foreground">active courses</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-4xl font-semibold mb-3">Recent Activity</h2>
        {(recentCourses ?? []).length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {(recentCourses ?? []).map((item) => {
              const course = item.courses as unknown as { id: string; name: string; code: string; years: { level: number } };
              if (!course) return null;
              return (
                <Link key={course.id} href={`/courses/${course.id}`}>
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
