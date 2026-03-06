import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type CourseRow = {
  id: string; code: string; name: string; credit_units: number;
  status: string; is_premium: boolean; pass_mark: number; sort_order: number;
};
type SemesterRow = { id: string; number: number; courses?: CourseRow[] };

export default async function AdminCoursesPage() {
  const supabase = await createClient();

  const { data: years } = await supabase
    .from('years')
    .select('*, semesters(*, courses(id, code, name, credit_units, status, is_premium, pass_mark, sort_order))')
    .order('level', { ascending: true });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Courses</h2>
        <span className="text-sm text-muted-foreground">
          {years?.flatMap((y) => y.semesters?.flatMap((s: SemesterRow) => s.courses ?? []) ?? []).length ?? 0} total
        </span>
      </div>

      {(years ?? []).map((year) => (
        <div key={year.id} className="space-y-4">
          <h3 className="text-base font-semibold">Year {year.level}</h3>

          {((year.semesters ?? []) as SemesterRow[]).map((sem) => (
            <div key={sem.id}>
              <p className="text-sm text-muted-foreground mb-2">Semester {sem.number}</p>
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
                        <TableHead>Premium</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(sem.courses ?? [])
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((course) => (
                          <TableRow key={course.id}>
                            <TableCell className="font-mono text-sm font-medium">{course.code}</TableCell>
                            <TableCell>{course.name}</TableCell>
                            <TableCell>{course.credit_units}</TableCell>
                            <TableCell>{course.pass_mark}%</TableCell>
                            <TableCell>
                              <Badge
                                variant={course.status === 'published' ? 'default' : 'secondary'}
                              >
                                {course.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {course.is_premium ? (
                                <Badge variant="outline">Premium</Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">Free</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ))}

      {!years?.length && (
        <p className="text-muted-foreground text-sm">No courses found. Run the seed migrations.</p>
      )}
    </div>
  );
}
