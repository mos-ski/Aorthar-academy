export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/utils/formatters';
import { GraduationCap, CheckCircle2, XCircle, Clock } from 'lucide-react';

function ScoreBadge({ score, passed }: { score: number | null; passed: boolean | null }) {
  if (score === null) return <span className="text-xs text-muted-foreground">In progress</span>;
  const pct = Math.round(score);
  return (
    <div className="flex items-center gap-1.5">
      {passed
        ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
        : <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />}
      <span className={`text-sm font-medium ${passed ? 'text-green-600' : 'text-destructive'}`}>{pct}%</span>
    </div>
  );
}

export default async function AdminExamSystemPage() {
  const admin = createAdminClient();

  const [
    { data: examAttempts },
    { data: profiles },
    { data: courses },
  ] = await Promise.all([
    admin
      .from('quiz_attempts')
      .select('id, user_id, course_id, attempt_number, started_at, completed_at, score, passed, correct_count, total_questions, assessment_type')
      .eq('assessment_type', 'exam')
      .order('started_at', { ascending: false })
      .limit(300),
    admin.from('profiles').select('user_id, full_name, email'),
    admin.from('courses').select('id, code, name, semester_id, semesters(number, year_id, years(level))'),
  ]);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.user_id, { full_name: p.full_name, email: (p as { email?: string | null }).email ?? null }]),
  );

  const courseMap = new Map(
    (courses ?? []).map((c) => {
      const sem = c.semesters as unknown as { number: number; years: { level: number } } | null;
      return [c.id, { code: c.code, name: c.name, year: sem?.years?.level ?? 0, semester: sem?.number ?? 0 }];
    }),
  );

  const attempts = examAttempts ?? [];
  const completed = attempts.filter((a) => a.completed_at !== null);
  const passed = completed.filter((a) => a.passed);
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((s, a) => s + (a.score ?? 0), 0) / completed.length)
    : 0;

  // Group by course for summary
  const byCourse = new Map<string, { total: number; passed: number; avg: number }>();
  for (const a of completed) {
    const existing = byCourse.get(a.course_id) ?? { total: 0, passed: 0, avg: 0 };
    existing.total += 1;
    if (a.passed) existing.passed += 1;
    existing.avg = (existing.avg * (existing.total - 1) + (a.score ?? 0)) / existing.total;
    byCourse.set(a.course_id, existing);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Exam System</h2>
        <p className="text-sm text-muted-foreground">Semester exam attempts and results</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Attempts</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{attempts.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{completed.length} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {completed.length > 0 ? Math.round((passed.length / completed.length) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">{passed.length} passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Score</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgScore}%</p>
            <p className="text-xs text-muted-foreground mt-1">across all exams</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{attempts.length - completed.length}</p>
            <p className="text-xs text-muted-foreground mt-1">not yet submitted</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-course summary */}
      {byCourse.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Results by Course</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Year / Semester</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Pass Rate</TableHead>
                  <TableHead>Avg Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from(byCourse.entries())
                  .sort((a, b) => {
                    const ca = courseMap.get(a[0]);
                    const cb = courseMap.get(b[0]);
                    return (ca?.code ?? '').localeCompare(cb?.code ?? '');
                  })
                  .map(([courseId, stats]) => {
                    const course = courseMap.get(courseId);
                    if (!course) return null;
                    const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
                    return (
                      <TableRow key={courseId}>
                        <TableCell>
                          <p className="font-mono text-sm font-medium">{course.code}</p>
                          <p className="text-xs text-muted-foreground">{course.name}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          Year {course.year} · Sem {course.semester}
                        </TableCell>
                        <TableCell>{stats.total}</TableCell>
                        <TableCell>
                          <Badge variant={passRate >= 60 ? 'default' : 'destructive'} className="text-xs">
                            {passRate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{Math.round(stats.avg)}%</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All exam attempts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Exam Attempts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Attempt</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-8 w-8 opacity-30" />
                      <p className="text-sm font-medium">No exam attempts yet</p>
                      <p className="text-xs">Semester exams will appear here once students complete them.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {attempts.map((a) => {
                const profile = profileMap.get(a.user_id);
                const course = courseMap.get(a.course_id);
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{profile?.full_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{profile?.email ?? a.user_id.slice(0, 8) + '…'}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-mono text-sm">{course?.code ?? '—'}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">{course?.name ?? '—'}</p>
                    </TableCell>
                    <TableCell className="text-sm">#{a.attempt_number}</TableCell>
                    <TableCell>
                      <ScoreBadge score={a.score} passed={a.passed} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.correct_count !== null && a.total_questions
                        ? `${a.correct_count}/${a.total_questions}`
                        : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(a.started_at)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
