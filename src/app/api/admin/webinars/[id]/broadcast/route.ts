import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth, requireRole } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { webinarBroadcastHtml } from '@/lib/email/templates/webinar-broadcast';
import { writeAuditLog } from '@/lib/admin/audit';

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/webinars/[id]/broadcast — email every registered attendee
export async function POST(request: NextRequest, { params }: Params) {
  const { user } = await requireAuth();
  await requireRole('admin');

  const { id } = await params;
  const { subject, body_html } = await request.json();

  if (!subject?.trim() || !body_html?.trim()) {
    return NextResponse.json({ error: 'Subject and message body are required' }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  const { data: webinar } = await adminSupabase
    .from('webinars')
    .select('id, title')
    .eq('id', id)
    .single();

  if (!webinar) {
    return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
  }

  const { data: registrations } = await adminSupabase
    .from('webinar_registrations')
    .select('user_id, email')
    .eq('webinar_id', id);

  if (!registrations || registrations.length === 0) {
    return NextResponse.json({ error: 'No registered attendees to send to' }, { status: 400 });
  }

  const emails = (
    await Promise.all(
      registrations.map(async ({ user_id }) => {
        if (!user_id) return null;
        const { data } = await adminSupabase.auth.admin.getUserById(user_id);
        return data?.user?.email ?? null;
      }),
    )
  )
    .concat(registrations.map((registration) => registration.email))
    .filter((email): email is string => Boolean(email));

  const uniqueEmails = Array.from(new Set(emails));

  const html = webinarBroadcastHtml(body_html, webinar.title);

  const results = await Promise.allSettled(
    uniqueEmails.map((to) => sendEmail({ to, subject, html })),
  );
  const sentCount = results.filter((r) => r.status === 'fulfilled').length;

  const { data: broadcast, error: broadcastError } = await adminSupabase.from('webinar_broadcasts').insert({
    webinar_id: id,
    subject,
    body_html,
    recipient_count: sentCount,
    sent_by: user.id,
  }).select('id, webinar_id, subject, body_html, recipient_count, sent_at').single();

  if (broadcastError) {
    console.error('[admin/webinars/broadcast] history insert error:', broadcastError);
  }

  await writeAuditLog({
    action: 'webinar.broadcast',
    performedBy: user.id,
    entityType: 'webinar',
    entityId: id,
    newValue: { subject, recipient_count: sentCount },
    req: request,
  });

  return NextResponse.json({ ok: true, sent: sentCount, total: uniqueEmails.length, broadcast });
}
