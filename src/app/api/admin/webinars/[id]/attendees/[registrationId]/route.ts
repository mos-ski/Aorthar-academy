import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth, requireRole } from '@/lib/auth';
import { writeAuditLog } from '@/lib/admin/audit';

type Params = { params: Promise<{ id: string; registrationId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { user } = await requireAuth();
  await requireRole('admin');

  const { id, registrationId } = await params;
  const body = await request.json();
  const attended = Boolean(body.attended);
  const attendedAt = attended ? new Date().toISOString() : null;
  const adminSupabase = createAdminClient();

  const { data: existing } = await adminSupabase
    .from('webinar_registrations')
    .select('id, webinar_id, attended_at')
    .eq('id', registrationId)
    .eq('webinar_id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
  }

  const { error } = await adminSupabase
    .from('webinar_registrations')
    .update({ attended_at: attendedAt })
    .eq('id', registrationId)
    .eq('webinar_id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog({
    action: attended ? 'webinar.attendance.mark' : 'webinar.attendance.unmark',
    performedBy: user.id,
    entityType: 'webinar_registration',
    entityId: registrationId,
    oldValue: existing,
    newValue: { attended_at: attendedAt },
    req: request,
  });

  return NextResponse.json({ ok: true, attended_at: attendedAt });
}
