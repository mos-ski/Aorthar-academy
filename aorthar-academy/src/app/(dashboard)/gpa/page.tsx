import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { formatGPA, formatYearLabel, formatSemesterLabel } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GPACard from '@/components/gpa/GPACard';
import GradeTable from '@/components/gpa/GradeTable';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getDemoStudentSnapshot } from '@/lib/demo/studentSnapshot';
import { isDemoMode, isExplicitLiveMode } from '@/lib/demo/mode';

export default async function GPAPage() {
  const { user } = await requireAuth();
  const supabase = await createClient();
  const forcedDemo = await isDemoMode();
  const explicitLive = await isExplicitLiveMode();

  const [{ data: cumGpa }, { data: semGpas }, { data: grades }, { data: subscription }] = await Promise.all([
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
    supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle(),
  ]);
  const isPremium = Boolean(subscription);
  const isProduction = process.env.NEXT_PUBLIC_APP_ENV === 'production';
  const demo = getDemoStudentSnapshot();
  // In production, never show demo data — show the real empty state instead
  const shouldUseDemo = !isProduction && (forcedDemo || (!explicitLive && !cumGpa && (semGpas?.length ?? 0) === 0 && (grades?.length ?? 0) === 0));
  const shownCumGpa = shouldUseDemo ? demo.cumulativeGpa : cumGpa;
  const shownSemGpas = shouldUseDemo ? demo.semesterGpas : (semGpas ?? []);
  const shownGrades = shouldUseDemo ? demo.grades : (grades ?? []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          {shouldUseDemo && (
            <Badge variant="outline" className="mb-3 bg-amber-50 text-amber-700 border-amber-200">
              Demo Mode: showing sample GPA history
            </Badge>
          )}
          <h1 className="text-3xl font-bold">GPA & Grades</h1>
          <p className="text-muted-foreground mt-1">Your academic performance record.</p>
        </div>
        {isPremium ? (
          <Button asChild variant="outline" size="sm" className="shrink-0 mt-1">
            <a href="/api/transcript/download" download>
              Download Transcript
            </a>
          </Button>
        ) : (
          <div className="flex flex-col items-end gap-1 mt-1">
            <Button asChild variant="outline" size="sm" className="shrink-0 opacity-60" disabled>
              <span>Download Transcript</span>
            </Button>
            <Link href="/pricing" className="text-xs text-primary hover:underline">
              Premium required
            </Link>
          </div>
        )}
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
      {shownGrades.length === 0 && !shouldUseDemo ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          <p className="font-medium text-base mb-1">No grades yet</p>
          <p className="text-sm">Complete a quiz or exam to start building your academic record.</p>
        </div>
      ) : (
        <GradeTable grades={shownGrades} />
      )}
    </div>
  );
}
