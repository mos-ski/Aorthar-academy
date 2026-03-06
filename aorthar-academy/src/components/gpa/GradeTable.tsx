import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatScore } from '@/utils/formatters';

interface GradeRow {
  id: string;
  quiz_score: number | null;
  exam_score: number | null;
  final_score: number | null;
  grade: string | null;
  passed: boolean;
  courses: { name: string; code: string; credit_units: number } | null;
}

export default function GradeTable({ grades }: { grades: GradeRow[] }) {
  if (grades.length === 0) {
    return <p className="text-muted-foreground text-sm">No grades recorded yet.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Course Grades</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Quiz</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Final</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grades.map((g) => (
              <TableRow key={g.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{g.courses?.name}</p>
                    <p className="text-xs text-muted-foreground">{g.courses?.code} · {g.courses?.credit_units} credits</p>
                  </div>
                </TableCell>
                <TableCell>{g.quiz_score != null ? formatScore(g.quiz_score) : '—'}</TableCell>
                <TableCell>{g.exam_score != null ? formatScore(g.exam_score) : '—'}</TableCell>
                <TableCell>{g.final_score != null ? formatScore(g.final_score) : '—'}</TableCell>
                <TableCell>
                  <span className="font-semibold">{g.grade ?? '—'}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={g.passed ? 'default' : 'destructive'}>
                    {g.passed ? 'Passed' : 'Failed'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
