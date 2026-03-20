import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { formatGPA } from '@/utils/formatters';

export async function GET() {
  const { user, profile } = await requireAuth();
  const supabase = await createClient();

  // Premium gate
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json({ error: 'Premium subscription required.' }, { status: 403 });
  }

  const [{ data: cumGpa }, , { data: grades }] = await Promise.all([
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

  const studentName = profile?.full_name ?? user.email ?? 'Student';
  const department = profile?.department ?? 'N/A';
  const generatedAt = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

  const courseRows = (grades ?? [])
    .map((g) => {
      const course = g.courses as { name: string; code: string; credit_units: number } | null;
      if (!course) return '';
      return `
      <tr>
        <td>${course.code}</td>
        <td>${course.name}</td>
        <td>${course.credit_units}</td>
        <td>${g.quiz_score != null ? `${(g.quiz_score * 100).toFixed(1)}%` : '—'}</td>
        <td>${g.exam_score != null ? `${(g.exam_score * 100).toFixed(1)}%` : '—'}</td>
        <td>${g.final_grade != null ? `${(g.final_grade * 100).toFixed(1)}%` : '—'}</td>
        <td>${g.grade ?? '—'}</td>
      </tr>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Academic Transcript — ${studentName}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #111; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .subtitle { color: #555; font-size: 14px; margin-bottom: 24px; }
    .meta { margin-bottom: 24px; font-size: 14px; }
    .meta dt { font-weight: bold; display: inline; }
    .meta dd { display: inline; margin: 0 0 0 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 16px; }
    th { background: #f0f0f0; padding: 8px; text-align: left; border-bottom: 2px solid #ccc; }
    td { padding: 7px 8px; border-bottom: 1px solid #e0e0e0; }
    .gpa-summary { margin-top: 24px; padding: 16px; background: #f9f9f9; border: 1px solid #ddd; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>Aorthar Academy</h1>
  <p class="subtitle">Official Academic Transcript</p>
  <dl class="meta">
    <dt>Student:</dt><dd>${studentName}</dd><br/>
    <dt>Department:</dt><dd>${department}</dd><br/>
    <dt>Generated:</dt><dd>${generatedAt}</dd>
  </dl>

  <table>
    <thead>
      <tr>
        <th>Code</th>
        <th>Course</th>
        <th>Credits</th>
        <th>Quiz</th>
        <th>Exam</th>
        <th>Final</th>
        <th>Grade</th>
      </tr>
    </thead>
    <tbody>${courseRows || '<tr><td colspan="7" style="text-align:center;color:#888">No grades recorded yet.</td></tr>'}</tbody>
  </table>

  <div class="gpa-summary">
    <strong>Cumulative GPA:</strong> ${formatGPA(cumGpa?.cumulative_gpa ?? 0)} / 5.0 &nbsp;&nbsp;
    <strong>Total Credits:</strong> ${cumGpa?.total_credits_earned ?? 0}
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="transcript-${studentName.replace(/\s+/g, '-').toLowerCase()}.html"`,
    },
  });
}
