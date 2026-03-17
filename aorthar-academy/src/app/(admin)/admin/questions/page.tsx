import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { DEMO_COURSES, DEMO_QUESTION_COUNTS } from '@/lib/demo/adminSnapshot';

export default async function AdminQuestionsPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from('courses')
    .select('id, code, name, semesters!inner(years!inner(level))')
    .order('code', { ascending: true });

  const { data: questionCounts } = await supabase
    .from('questions')
    .select('course_id, id');

  const isLive = (courses ?? []).length > 0;
  const displayCourses = isLive ? (courses ?? []) : DEMO_COURSES;

  const countMap: Record<string, number> = {};
  if (isLive) {
    (questionCounts ?? []).forEach((q) => {
      countMap[q.course_id] = (countMap[q.course_id] ?? 0) + 1;
    });
  } else {
    Object.assign(countMap, DEMO_QUESTION_COUNTS);
  }

  const totalQuestions = Object.values(countMap).reduce((a, b) => a + b, 0);
  const EXPECTED = 20;
  const incomplete = displayCourses.filter((c) => (countMap[c.id] ?? 0) < EXPECTED).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Questions</h2>
          <p className="text-sm text-muted-foreground">
            {totalQuestions.toLocaleString()} total · {displayCourses.length} courses · click a card to edit
          </p>
        </div>
        {incomplete > 0 && (
          <Badge variant="destructive" className="gap-1 shrink-0">
            <AlertCircle className="h-3 w-3" />
            {incomplete} incomplete
          </Badge>
        )}
      </div>

      {displayCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileQuestion className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="font-medium text-sm">No courses yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add courses in the{' '}
            <Link href="/admin/courses" className="text-primary underline">
              Courses
            </Link>{' '}
            section, then add questions from each course editor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {displayCourses.map((course) => {
            const sem = course.semesters as unknown as { years: { level: number } };
            const yearLevel = sem?.years?.level ?? 0;
            const count = countMap[course.id] ?? 0;
            const isComplete = count >= EXPECTED;
            return (
              <Link key={course.id} href={`/admin/courses/${course.id}`}>
                <Card className={`hover:border-primary/50 transition-colors cursor-pointer h-full ${!isComplete ? 'border-destructive/40' : ''}`}>
                  <CardHeader className="pb-1 pt-3 px-3">
                    <div className="flex items-start justify-between gap-1">
                      <CardTitle className="text-sm font-mono leading-tight">{course.code}</CardTitle>
                      {isComplete
                        ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        : <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{course.name}</p>
                    <p className="text-xs text-muted-foreground">Year {yearLevel}</p>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-bold">{count}</span>
                      <span className="text-xs text-muted-foreground">/ {EXPECTED}</span>
                    </div>
                    {!isComplete && (
                      <p className="text-xs text-destructive mt-0.5">{EXPECTED - count} missing</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
