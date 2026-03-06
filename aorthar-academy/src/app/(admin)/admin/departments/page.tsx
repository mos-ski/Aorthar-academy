import { createClient } from '@/lib/supabase/server';
import { AORTHAR_DEPARTMENTS } from '@/lib/academics/departments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function AdminDepartmentsPage() {
  const supabase = await createClient();

  // Count students per department
  const { data: profiles } = await supabase
    .from('profiles')
    .select('department')
    .not('department', 'is', null);

  const counts: Record<string, number> = {};
  for (const p of profiles ?? []) {
    if (p.department) counts[p.department] = (counts[p.department] ?? 0) + 1;
  }

  const total = Object.values(counts).reduce((s, n) => s + n, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Departments</h2>
        <p className="text-sm text-muted-foreground">{AORTHAR_DEPARTMENTS.length} departments · {total} enrolled students</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {AORTHAR_DEPARTMENTS.map((dept) => (
          <Card key={dept}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm leading-snug">{dept}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{counts[dept] ?? 0}</p>
              <p className="text-xs text-muted-foreground">students</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Enrollment Breakdown</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="text-right">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {AORTHAR_DEPARTMENTS.map((dept) => {
                const count = counts[dept] ?? 0;
                const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
                return (
                  <TableRow key={dept}>
                    <TableCell className="font-medium text-sm">{dept}</TableCell>
                    <TableCell className="text-right">{count}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{pct}%</Badge>
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
