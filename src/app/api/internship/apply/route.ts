import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { internshipWelcomeHtml, internshipWelcomeSubject } from '@/lib/email/templates/internship-welcome';

const INTERNSHIP_URL = process.env.NEXT_PUBLIC_INTERNSHIP_URL ?? 'http://localhost:3000/internship';

// POST /api/internship/apply
// Body: { reference, full_name, email, phone?, portfolio_url?, track, current_status, motivation }
// Returns: { ok: true }
// Flow: saves form → schedules exam link for 24h later → sends welcome/study email immediately
export async function POST(request: NextRequest) {
  let body: {
    reference?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    portfolio_url?: string;
    track?: string;
    current_status?: string;
    motivation?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { reference, full_name, email, phone, portfolio_url, track, current_status, motivation } = body;

  if (!reference || !full_name || !email || !track || !current_status || !motivation) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify payment
  const { data: application } = await admin
    .from('internship_applications')
    .select('id, payment_status, form_submitted_at')
    .eq('paystack_reference', reference)
    .maybeSingle();

  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  if (application.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Payment not confirmed' }, { status: 403 });
  }

  // Already submitted — idempotent
  if (application.form_submitted_at) {
    return NextResponse.json({ ok: true, already_submitted: true }, { status: 200 });
  }

  // Find the currently open cohort
  const { data: cohort } = await admin
    .from('internship_cohorts')
    .select('id')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Schedule exam link 24 hours from now
  const formSubmittedAt = new Date();
  const examLinkScheduledAt = new Date(formSubmittedAt.getTime() + 24 * 60 * 60 * 1000);

  // Update application with form data + schedule
  const { error: updateError } = await admin
    .from('internship_applications')
    .update({
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      portfolio_url: portfolio_url?.trim() || null,
      track,
      current_status,
      motivation: motivation.trim(),
      app_status: 'submitted',
      form_submitted_at: formSubmittedAt.toISOString(),
      exam_link_scheduled_at: examLinkScheduledAt.toISOString(),
      cohort_id: cohort?.id ?? null,
    })
    .eq('id', application.id);

  if (updateError) {
    console.error('[internship/apply] DB update error:', updateError);
    return NextResponse.json({ error: 'Failed to save application' }, { status: 500 });
  }

  const firstName = full_name.trim().split(' ')[0];
  const studyUrl = `${INTERNSHIP_URL}/study`;
  const examScheduledAt = examLinkScheduledAt.toLocaleString('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Lagos',
    timeZoneName: 'short',
  });

  // Fire-and-forget welcome + study email
  void (async () => {
    try {
      await sendEmail({
        to: email.trim().toLowerCase(),
        subject: internshipWelcomeSubject(),
        html: internshipWelcomeHtml({ firstName, studyUrl, examScheduledAt }),
      });
    } catch (emailErr) {
      console.error('[internship/apply] Welcome email failed:', emailErr);
    }
  })();

  return NextResponse.json({ ok: true });
}
