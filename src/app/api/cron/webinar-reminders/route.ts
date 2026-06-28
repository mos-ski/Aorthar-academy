import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { webinarReminderHtml, webinarReminderSubject } from '@/lib/email/templates/webinar-reminder';
import { eventPublicUrl } from '@/lib/urls';

// Runs once daily (Vercel Hobby plan only allows daily cron schedules), so
// the 1-hour-out window below only fires reminders for webinars that happen
// to start within an hour of this run — it's best-effort, not exact.

interface RegistrationRow {
  id: string;
  user_id: string | null;
  webinar_id: string;
  first_name: string;
  email: string;
  reminder_1d_sent_at: string | null;
  reminder_1h_sent_at: string | null;
}

interface WebinarRow {
  id: string;
  title: string;
  slug: string;
  scheduled_at: string;
  join_url: string;
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  const expected = process.env.CRON_SECRET;

  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminSupabase = createAdminClient();
  const now = Date.now();

  const oneDayWindowStart = new Date(now).toISOString();
  const oneDayWindowEnd = new Date(now + 24 * 60 * 60 * 1000).toISOString();
  const oneHourWindowStart = new Date(now + 50 * 60 * 1000).toISOString();
  const oneHourWindowEnd = new Date(now + 70 * 60 * 1000).toISOString();

  const { data: webinars } = await adminSupabase
    .from('webinars')
    .select('id, title, slug, scheduled_at, join_url')
    .eq('status', 'published')
    .gte('scheduled_at', oneHourWindowStart)
    .lte('scheduled_at', oneDayWindowEnd);

  const webinarMap = new Map<string, WebinarRow>((webinars ?? []).map((w) => [w.id, w]));

  let remindersSent = 0;

  for (const webinar of webinars ?? []) {
    const inOneDayWindow = webinar.scheduled_at >= oneDayWindowStart && webinar.scheduled_at <= oneDayWindowEnd;
    const inOneHourWindow = webinar.scheduled_at >= oneHourWindowStart && webinar.scheduled_at <= oneHourWindowEnd;
    if (!inOneDayWindow && !inOneHourWindow) continue;

    const { data: registrations } = await adminSupabase
      .from('webinar_registrations')
      .select('id, user_id, webinar_id, first_name, email, reminder_1d_sent_at, reminder_1h_sent_at')
      .eq('webinar_id', webinar.id);

    for (const reg of (registrations ?? []) as RegistrationRow[]) {
      if (inOneHourWindow && !reg.reminder_1h_sent_at) {
        remindersSent += await sendReminder(adminSupabase, reg, webinarMap, 1) ? 1 : 0;
      } else if (inOneDayWindow && !reg.reminder_1d_sent_at) {
        remindersSent += await sendReminder(adminSupabase, reg, webinarMap, 24) ? 1 : 0;
      }
    }
  }

  return NextResponse.json({ ok: true, scanned: webinars?.length ?? 0, remindersSent });
}

async function sendReminder(
  adminSupabase: ReturnType<typeof createAdminClient>,
  reg: RegistrationRow,
  webinarMap: Map<string, WebinarRow>,
  hoursUntil: 1 | 24,
): Promise<boolean> {
  const webinar = webinarMap.get(reg.webinar_id);
  if (!webinar) return false;

  try {
    let email = reg.email?.trim().toLowerCase();
    let firstName = reg.first_name?.trim() || 'there';

    if (!email && reg.user_id) {
      const { data: userRecord } = await adminSupabase.auth.admin.getUserById(reg.user_id);
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', reg.user_id)
        .maybeSingle();

      email = userRecord?.user?.email ?? '';
      firstName = profile?.full_name?.split(' ')[0] ?? firstName;
    }

    if (!email) return false;
    const joinUrl = webinar.join_url || eventPublicUrl(webinar.slug);

    await sendEmail({
      to: email,
      subject: webinarReminderSubject(webinar.title, hoursUntil),
      html: webinarReminderHtml({
        firstName,
        webinarTitle: webinar.title,
        scheduledAt: webinar.scheduled_at,
        joinUrl,
        hoursUntil,
      }),
    });

    const field = hoursUntil === 1 ? 'reminder_1h_sent_at' : 'reminder_1d_sent_at';
    await adminSupabase
      .from('webinar_registrations')
      .update({ [field]: new Date().toISOString() })
      .eq('id', reg.id);

    return true;
  } catch (err) {
    console.error('[cron/webinar-reminders] reminder email failed:', err);
    return false;
  }
}
