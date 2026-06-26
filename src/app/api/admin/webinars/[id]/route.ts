import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth, requireRole } from '@/lib/auth';
import { writeAuditLog } from '@/lib/admin/audit';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  await requireAuth();
  await requireRole('admin');

  const { id } = await params;
  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from('webinars')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { user } = await requireAuth();
  await requireRole('admin');

  const { id } = await params;
  const body = await request.json();

  const adminSupabase = createAdminClient();

  const { data: existing } = await adminSupabase
    .from('webinars')
    .select('title, slug, price_ngn, status')
    .eq('id', id)
    .single();

  const updatePayload = {
    title: body.title,
    slug: body.slug,
    description: body.description ?? '',
    scheduled_at: body.scheduled_at,
    duration_minutes: Number(body.duration_minutes) || 60,
    capacity: body.capacity === '' || body.capacity == null ? null : Number(body.capacity),
    price_ngn: Number(body.price_ngn) || 0,
    join_url: body.join_url ?? '',
    status: body.status,
  };

  const { error } = await adminSupabase
    .from('webinars')
    .update(updatePayload)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeAuditLog({
    action: 'webinar.update',
    performedBy: user.id,
    entityType: 'webinar',
    entityId: id,
    oldValue: existing,
    newValue: updatePayload,
    req: request,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { user } = await requireAuth();
  await requireRole('admin');

  const { id } = await params;
  const adminSupabase = createAdminClient();

  const { data: existing } = await adminSupabase
    .from('webinars')
    .select('title, slug')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
  }

  const { count } = await adminSupabase
    .from('webinar_registrations')
    .select('id', { count: 'exact', head: true })
    .eq('webinar_id', id);

  if ((count ?? 0) > 0) {
    const { error } = await adminSupabase
      .from('webinars')
      .update({ status: 'draft' })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await writeAuditLog({
      action: 'webinar.soft_delete',
      performedBy: user.id,
      entityType: 'webinar',
      entityId: id,
      oldValue: existing,
      newValue: { status: 'draft' },
      req: request,
    });

    return NextResponse.json({ ok: true, soft_deleted: true });
  }

  const { error } = await adminSupabase.from('webinars').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeAuditLog({
    action: 'webinar.delete',
    performedBy: user.id,
    entityType: 'webinar',
    entityId: id,
    oldValue: existing,
    req: request,
  });

  return NextResponse.json({ ok: true, soft_deleted: false });
}
