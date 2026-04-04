'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Pencil } from 'lucide-react';

type CourseRow = {
  id: string; code: string; name: string; credit_units: number;
  status: string; is_premium: boolean; pass_mark: number; sort_order: number;
  department: string | null;
};
type SemesterRow = { id: string; number: number; courses?: CourseRow[] };
type YearRow = { id: string; level: number; semesters?: SemesterRow[] };

// Extract department prefix from course code: "PM101" → "PM", "FE302" → "FE"
function getDeptPrefix(code: string): string {
  return code.match(/^([A-Z]+)/)?.[1] ?? 'OTHER';
}

const DEPT_LABELS: Record<string, string> = {
  PM: 'Product Management',
  DES: 'Product Design',
  FE: 'Frontend Engineering',
  BE: 'Backend Engineering',
  QA: 'Quality Analytics',
  SO: 'Scrum & Agile Ops',
  DA: 'Data & Analytics',
  GO: 'Growth & Marketing',
  GM: 'Growth & Marketing',
  OP: 'Operations',
  OPS: 'Operations',
};

interface Props {
  years: YearRow[];
  isDemo: boolean;
}

export default function CoursesView({ years, isDemo }: Props) {
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // Collect unique department prefixes from actual course codes
  const departments = useMemo(() => {
    const prefixes = new Set<string>();
    for (const year of years) {
      for (const sem of (year.semesters ?? [])) {
        for (const course of (sem.courses ?? [])) {
          prefixes.add(getDeptPrefix(course.code));
        }
      }
    }
    return Array.from(prefixes).sort();
  }, [years]);

  const totalCourses = years.flatMap((y) =>
    (y.semesters ?? []).flatMap((s) => (s.courses ?? []).filter((c) =>
      selectedDept === 'all' || getDeptPrefix(c.code) === selectedDept,
    )),
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Courses</h2>
          <p className="text-sm text-muted-foreground">
            {totalCourses} {selectedDept !== 'all' ? `in ${DEPT_LABELS[selectedDept] ?? selectedDept}` : 'total'}
            {isDemo && <span className="ml-2 text-amber-600 font-medium">(demo data)</span>}
          </p>
        </div>

        {/* Department filter */}
        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            size="sm"
            variant={selectedDept === 'all' ? 'default' : 'outline'}
            className="h-7 text-xs"
            onClick={() => setSelectedDept('all')}
          >
            All
          </Button>
          {departments.map((dept) => (
            <Button
              key={dept}
              size="sm"
              variant={selectedDept === dept ? 'default' : 'outline'}
              className="h-7 text-xs"
              onClick={() => setSelectedDept(dept)}
            >
              {dept}
            </Button>
          ))}
        </div>
      </div>

      {years.map((year) => {
        // Check if any courses in this year match the filter
        const yearHasCourses = (year.semesters ?? []).some((sem) =>
          (sem.courses ?? []).some((c) => selectedDept === 'all' || getDeptPrefix(c.code) === selectedDept),
        );
        if (!yearHasCourses) return null;

        return (
          <div key={year.id} className="space-y-4">
            <h3 className="text-base font-semibold border-b pb-1">Year {year.level}</h3>

            {((year.semesters ?? []) as SemesterRow[]).map((sem) => {
              const courses = (sem.courses ?? [])
                .filter((c) => selectedDept === 'all' || getDeptPrefix(c.code) === selectedDept)
                .sort((a, b) => a.sort_order - b.sort_order);
              if (courses.length === 0) return null;

              return (
                <div key={sem.id}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Semester {sem.number}</p>
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
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
