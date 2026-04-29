import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';
import { redirect } from 'next/navigation';

// GET /api/admin/internship/applicants
// Returns all paid applications with their exam attempt results
export async function GET() {
  try {
    await requireRole('admin');
  } catch {
    redirect('/unauthorized');
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from('internship_applications')
    .select(`
      id,
      full_name,
      email,
      phone,
      track,
      current_status,
      motivation,
      payment_status,
      amount_paid_ngn,
      paid_at,
      app_status,
      form_submitted_at,
      created_at,
      cohort_id,
      internship_exam_attempts (
        score_percent,
        passed,
        correct_count,
        total_questions,
        started_at,
        completed_at
      )
    `)
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('[admin/internship/applicants] Query error:', error);
    return NextResponse.json({ error: 'Failed to fetch applicants' }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}
