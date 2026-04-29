export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, CreditCard, CheckCircle, XCircle, ClipboardList } from 'lucide-react';
import Link from 'next/link';

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

type AttemptRow = {
  score_percent: number | null;
  passed: boolean | null;
  correct_count: number | null;
  total_questions: number | null;
  completed_at: string | null;
}[];

type ApplicationRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  track: string | null;
  current_status: string | null;
  payment_status: string;
  app_status: string;
  paid_at: string | null;
  form_submitted_at: string | null;
  created_at: string;
  internship_exam_attempts: AttemptRow;
};

export default async function AdminInternshipPage() {
  try {
    await requireRole('admin');
  } catch {
    redirect('/unauthorized');
  }

  const admin = createAdminClient();

  const { data: rawData } = await admin
    .from('internship_applications')
    .select(`
      id,
      full_name,
      email,
      track,
      current_status,
      payment_status,
      app_status,
      paid_at,
      form_submitted_at,
      created_at,
      internship_exam_attempts (
        score_percent,
        passed,
        correct_count,
        total_questions,
        completed_at
      )
    `)
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: false })
    .limit(500);

  const applications = (rawData ?? []) as ApplicationRow[];

  const totalPaid = applications.length;
  const totalSubmitted = applications.filter((a) => a.form_submitted_at).length;
  const totalExamDone = applications.filter((a) => (a.internship_exam_attempts as AttemptRow)[0]?.completed_at).length;
  const totalPassed = applications.filter((a) => (a.internship_exam_attempts as AttemptRow)[0]?.passed === true).length;
  const totalFailed = applications.filter((a) => (a.internship_exam_attempts as AttemptRow)[0]?.passed === false).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Internship Applicants</h1>
          <p className="text-muted-foreground text-sm mt-1">All paid applications and assessment results</p>
        </div>
        <Link
          href="/admin/internship/questions"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-muted"
        >
          <ClipboardList className="h-4 w-4" />
          Manage Questions
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: 'Total Paid', value: totalPaid, Icon: CreditCard, color: 'text-blue-500' },
          { label: 'Form Submitted', value: totalSubmitted, Icon: Users, color: 'text-purple-500' },
          { label: 'Exam Completed', value: totalExamDone, Icon: ClipboardList, color: 'text-yellow-500' },
          { label: 'Passed (≥70%)', value: totalPassed, Icon: CheckCircle, color: 'text-green-500' },
          { label: 'Failed (<70%)', value: totalFailed, Icon: XCircle, color: 'text-red-500' },
        ].map(({ label, value, Icon, color }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applicants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applicants</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {applications.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No paid applications yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Track</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Applied</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => {
                    const attempt = (app.internship_exam_attempts as AttemptRow)[0];
                    const score = attempt?.score_percent;
                    const passed = attempt?.passed;
                    const examDone = Boolean(attempt?.completed_at);

                    return (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium max-w-[150px] truncate">
                          {app.full_name ?? '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                          {app.email ?? '—'}
                        </TableCell>
                        <TableCell>
                          {app.track ? (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(167,210,82,0.1)', color: '#5a7a1a', border: '1px solid rgba(167,210,82,0.25)' }}>
                              {app.track}
                            </span>
                          ) : '—'}
                        </TableCell>
                        <TableCell>
                          {app.form_submitted_at ? (
                            <Badge variant="secondary">Submitted</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {examDone && score !== null && score !== undefined
                            ? <span className="font-semibold">{Math.round(score)}%</span>
                            : <span className="text-muted-foreground text-sm">{app.form_submitted_at ? 'Not taken' : '—'}</span>
                          }
                        </TableCell>
                        <TableCell>
                          {examDone ? (
                            passed
                              ? <Badge className="bg-green-500/15 text-green-600 border-green-500/20 hover:bg-green-500/15">Passed</Badge>
                              : <Badge className="bg-red-500/15 text-red-600 border-red-500/20 hover:bg-red-500/15">Failed</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(app.created_at)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
