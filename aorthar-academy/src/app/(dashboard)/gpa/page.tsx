import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { formatGPA, formatYearLabel, formatSemesterLabel } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GPACard from '@/components/gpa/GPACard';
import GradeTable from '@/components/gpa/GradeTable';
import { Badge } from '@/components/ui/badge';
import { getDemoStudentSnapshot } from '@/lib/demo/studentSnapshot';

export default async function GPAPage() {
  const { user } = await requireAuth();
  const supabase = await createClient();

  const [{ data: cumGpa }, { data: semGpas }, { data: grades }] = await Promise.all([
    supabase.from('cumulative_gpas').select('*').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('semester_gpas')
      .select('*, years(level), semesters(number)')
      .eq('user_id', user.id)
      .order('computed_at', { ascending: true }),
    supabase
      .from('course_grades')
      .select('*, courses(name, code, credit_units)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
  ]);
  const demo = getDemoStudentSnapshot();
  const shouldUseDemo = !cumGpa && (semGpas?.length ?? 0) === 0 && (grades?.length ?? 0) === 0;
  const shownCumGpa = shouldUseDemo ? demo.cumulativeGpa : cumGpa;
  const shownSemGpas = shouldUseDemo ? demo.semesterGpas : (semGpas ?? []);
  const shownGrades = shouldUseDemo ? demo.grades : (grades ?? []);

  return (
    <div className="space-y-6">
      <div>
        {shouldUseDemo && (
          <Badge variant="outline" className="mb-3 bg-amber-50 text-amber-700 border-amber-200">
            Demo Mode: showing sample GPA history
          </Badge>
        )}
        <h1 className="text-3xl font-bold">GPA & Grades</h1>
        <p className="text-muted-foreground mt-1">Your academic performance record.</p>
      </div>

      {/* Cumulative GPA */}
      <GPACard
        cumulative_gpa={shownCumGpa?.cumulative_gpa ?? 0}
        total_credits={shownCumGpa?.total_credits_earned ?? 0}
      />

      {/* Semester GPAs */}
      {shownSemGpas.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Semester Performance</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {shownSemGpas.map((sg) => (
              <Card key={sg.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {formatYearLabel((sg.years as { level: number }).level)} · {formatSemesterLabel((sg.semesters as { number: number }).number)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{formatGPA(sg.gpa)}</p>
                  <p className="text-xs text-muted-foreground">{sg.total_credits} credits</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Grade Table */}
      <GradeTable grades={shownGrades} />
    </div>
  );
}
