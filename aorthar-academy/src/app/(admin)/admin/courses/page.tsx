import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import NewCourseDialog from './_components/NewCourseDialog';
import { DEMO_YEARS_WITH_COURSES } from '@/lib/demo/adminSnapshot';
import { isDemoMode, isExplicitLiveMode } from '@/lib/demo/mode';

type CourseRow = {
  id: string; code: string; name: string; credit_units: number;
  status: string; is_premium: boolean; pass_mark: number; sort_order: number;
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
        .select('*, semesters(*, courses(id, code, name, credit_units, status, is_premium, pass_mark, sort_order))')
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

  const safeYears = years ?? [];
  const totalCourses = safeYears.flatMap((y) =>
    (y.semesters ?? []).flatMap((s) => s.courses ?? [])
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Courses</h2>
          <p className="text-sm text-muted-foreground">
            {totalCourses} total
            {isDemo && <span className="ml-2 text-amber-600 font-medium">(demo data)</span>}
          </p>
        </div>
      </div>

      {safeYears.map((year) => (
        <div key={year.id} className="space-y-4">
          <h3 className="text-base font-semibold border-b pb-1">Year {year.level}</h3>

          {((year.semesters ?? []) as SemesterRow[]).map((sem) => {
            const courses = (sem.courses ?? []).sort((a, b) => a.sort_order - b.sort_order);
            return (
              <div key={sem.id}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Semester {sem.number}</p>
                  {!isDemo && <NewCourseDialog semesterId={sem.id} nextSortOrder={courses.length + 1} />}
                </div>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Pass Mark</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead className="w-16">Manage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courses.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell className="font-mono text-sm font-medium">{course.code}</TableCell>
                            <TableCell>{course.name}</TableCell>
                            <TableCell>{course.credit_units}</TableCell>
                            <TableCell>{course.pass_mark}%</TableCell>
                            <TableCell>
                              <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                                {course.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {course.is_premium
                                ? <Badge variant="outline">Premium</Badge>
                                : <span className="text-xs text-muted-foreground">Free</span>}
                            </TableCell>
                            <TableCell>
                              <Link href={`/admin/courses/${course.id}`}>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                        {courses.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-4">
                              No courses yet — add one above
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      ))}

      {!safeYears.length && (
        <p className="text-muted-foreground text-sm">No curriculum structure found. Go to Curriculum to add years and semesters first.</p>
      )}
    </div>
  );
}
