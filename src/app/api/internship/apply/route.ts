import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { internshipOnboardingHtml, internshipOnboardingSubject } from '@/lib/email/templates/internship-onboarding';

const INTERNSHIP_URL = process.env.NEXT_PUBLIC_INTERNSHIP_URL ?? 'http://localhost:3000/internship';

// POST /api/internship/apply
// Body: { reference, full_name, email, phone?, portfolio_url?, track, current_status, motivation }
// Returns: { ok: true }
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

  // Update application with form data
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
      form_submitted_at: new Date().toISOString(),
      cohort_id: cohort?.id ?? null,
    })
    .eq('id', application.id);

  if (updateError) {
    console.error('[internship/apply] DB update error:', updateError);
    return NextResponse.json({ error: 'Failed to save application' }, { status: 500 });
  }

  // Create exam token (24h expiry)
  const { data: tokenRow, error: tokenError } = await admin
    .from('internship_exam_tokens')
    .insert({ application_id: application.id })
    .select('id, expires_at')
    .single();

  if (tokenError || !tokenRow) {
    console.error('[internship/apply] Token creation error:', tokenError);
    return NextResponse.json({ error: 'Failed to create exam token' }, { status: 500 });
  }

  // Build exam URL and human-readable expiry
  const examUrl = `${INTERNSHIP_URL}/exam/${tokenRow.id}`;
  const expiresAt = new Date(tokenRow.expires_at).toLocaleString('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Lagos',
    timeZoneName: 'short',
  });

  const firstName = full_name.trim().split(' ')[0];

  // Fire-and-forget onboarding email
  void (async () => {
    try {
      await sendEmail({
        to: email.trim().toLowerCase(),
        subject: internshipOnboardingSubject(),
        html: internshipOnboardingHtml({ firstName, examUrl, expiresAt }),
      });
    } catch (emailErr) {
      console.error('[internship/apply] Onboarding email failed:', emailErr);
    }
  })();

  return NextResponse.json({ ok: true });
}
