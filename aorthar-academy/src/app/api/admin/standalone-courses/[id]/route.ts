import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth, requireRole } from '@/lib/auth';
import { writeAuditLog } from '@/lib/admin/audit';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { user } = await requireAuth();
  await requireRole('admin');

  const { id } = await params;
  const body = await request.json();

  const adminSupabase = createAdminClient();

  // Fetch old value for audit diff
  const { data: existing } = await adminSupabase
    .from('standalone_courses')
    .select('title, slug, price_ngn, status')
    .eq('id', id)
    .single();

  const { error } = await adminSupabase
    .from('standalone_courses')
    .update({
      title: body.title,
      slug: body.slug,
      description: body.description,
      long_description: body.long_description,
      thumbnail_url: body.thumbnail_url || null,
      price_ngn: Number(body.price_ngn),
      instructor_name: body.instructor_name,
      instructor_avatar_url: body.instructor_avatar_url || null,
      status: body.status,
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeAuditLog({
    action: 'standalone_course.update',
    performedBy: user.id,
    entityType: 'standalone_course',
    entityId: id,
    oldValue: existing,
    newValue: { title: body.title, slug: body.slug, price_ngn: body.price_ngn, status: body.status },
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
    .from('standalone_courses')
    .select('title, slug')
    .eq('id', id)
    .single();

  const { error } = await adminSupabase.from('standalone_courses').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeAuditLog({
    action: 'standalone_course.delete',
    performedBy: user.id,
    entityType: 'standalone_course',
    entityId: id,
    oldValue: existing,
    req: request,
  });

  return NextResponse.json({ ok: true });
}
