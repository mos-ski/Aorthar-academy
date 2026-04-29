import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { internshipOnboardingHtml, internshipOnboardingSubject } from '@/lib/email/templates/internship-onboarding';

const INTERNSHIP_URL = process.env.NEXT_PUBLIC_INTERNSHIP_URL ?? 'http://localhost:3000/internship';
const CRON_SECRET = process.env.CRON_SECRET;

// GET /api/internship/cron/send-exam-links
// Called by Vercel Cron every hour.
// Finds applications where exam_link_scheduled_at <= NOW() and exam_link_sent_at IS NULL,
// creates exam tokens, sends exam link emails, marks exam_link_sent_at.
export async function GET(request: NextRequest) {
  // Verify Vercel cron secret (automatically set by Vercel)
  if (CRON_SECRET) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Find all applications due for exam link dispatch
  const { data: due, error: queryError } = await admin
    .from('internship_applications')
    .select('id, full_name, email, track')
    .lte('exam_link_scheduled_at', now)
    .is('exam_link_sent_at', null)
    .not('form_submitted_at', 'is', null)
    .eq('payment_status', 'paid')
    .limit(100);

  if (queryError) {
    console.error('[cron/send-exam-links] Query error:', queryError);
    return NextResponse.json({ error: 'DB query failed' }, { status: 500 });
  }

  if (!due || due.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'No applications due.' });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const app of due) {
    try {
      // Create exam token (24h expiry from now)
      const { data: tokenRow, error: tokenError } = await admin
        .from('internship_exam_tokens')
        .insert({ application_id: app.id })
        .select('id, expires_at')
        .single();

      if (tokenError || !tokenRow) {
        errors.push(`${app.id}: token creation failed — ${tokenError?.message}`);
        continue;
      }

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

      const firstName = app.full_name?.split(' ')[0] ?? 'there';

      // Send exam link email
      await sendEmail({
        to: app.email!,
        subject: internshipOnboardingSubject(),
        html: internshipOnboardingHtml({ firstName, examUrl, expiresAt }),
      });

      // Mark as sent
      await admin
        .from('internship_applications')
        .update({ exam_link_sent_at: new Date().toISOString() })
        .eq('id', app.id);

      sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${app.id}: ${msg}`);
      console.error(`[cron/send-exam-links] Failed for application ${app.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, sent, errors: errors.length > 0 ? errors : undefined });
}
