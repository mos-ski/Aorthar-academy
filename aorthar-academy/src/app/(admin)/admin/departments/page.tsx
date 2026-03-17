import { createClient } from '@/lib/supabase/server';
import { AORTHAR_DEPARTMENTS } from '@/lib/academics/departments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2 } from 'lucide-react';
import { DEMO_DEPARTMENT_COUNTS } from '@/lib/demo/adminSnapshot';
import { isDemoMode, isExplicitLiveMode } from '@/lib/demo/mode';

export default async function AdminDepartmentsPage() {
  const supabase = await createClient();
  const demo = await isDemoMode();
  const explicitLive = await isExplicitLiveMode();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('department')
    .not('department', 'is', null);

  const liveCounts: Record<string, number> = {};
  for (const p of profiles ?? []) {
    if (p.department) liveCounts[p.department] = (liveCounts[p.department] ?? 0) + 1;
  }

  const liveTotal = Object.values(liveCounts).reduce((s, n) => s + n, 0);
  const isLive = explicitLive || (!demo && liveTotal > 0);
  const counts = isLive ? liveCounts : DEMO_DEPARTMENT_COUNTS;
  const total = isLive ? liveTotal : Object.values(DEMO_DEPARTMENT_COUNTS).reduce((s, n) => s + n, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Departments</h2>
        <p className="text-sm text-muted-foreground">
          {AORTHAR_DEPARTMENTS.length} departments · {total} enrolled students
        </p>
      </div>

      {/* Department cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {AORTHAR_DEPARTMENTS.map((dept) => {
          const count = counts[dept] ?? 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <Card key={dept}>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs leading-snug font-medium text-muted-foreground">{dept}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                <p className="text-2xl font-bold">{count}</p>
                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{pct.toFixed(1)}% of enrolled</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Breakdown table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Enrollment Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead>Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {total === 0 && isLive && (
                <TableRow>
                  <TableCell colSpan={3} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Building2 className="h-8 w-8 opacity-30" />
                      <p className="text-sm font-medium">No enrolled students yet</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {AORTHAR_DEPARTMENTS.map((dept) => {
                const count = counts[dept] ?? 0;
                const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
                const barPct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <TableRow key={dept}>
                    <TableCell className="font-medium text-sm">{dept}</TableCell>
                    <TableCell className="text-right font-mono">{count}</TableCell>
                    <TableCell className="min-w-[160px]">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                        <Badge variant="secondary" className="text-xs tabular-nums w-14 justify-center">
                          {pct}%
                        </Badge>
                      </div>
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
