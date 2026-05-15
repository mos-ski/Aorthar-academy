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

  const updateData: Record<string, unknown> = {};
  if (body.code !== undefined) updateData.code = String(body.code).toUpperCase().trim();
  if (body.discount_type !== undefined) updateData.discount_type = body.discount_type;
  if (body.discount_value !== undefined) updateData.discount_value = Number(body.discount_value);
  if (body.scope !== undefined) updateData.scope = body.scope;
  if (body.max_uses !== undefined) updateData.max_uses = body.max_uses ? Number(body.max_uses) : null;
  if (body.expires_at !== undefined) updateData.expires_at = body.expires_at || null;
  if (body.is_active !== undefined) updateData.is_active = Boolean(body.is_active);
  if (body.course_id !== undefined) updateData.course_id = body.scope === 'specific' ? body.course_id : null;
  updateData.updated_at = new Date().toISOString();

  if (body.scope === 'specific' && !body.course_id && !updateData.course_id) {
    return NextResponse.json({ error: 'course_id is required when scope is "specific"' }, { status: 400 });
  }

  const { data, error } = await adminSupabase
    .from('coupon_codes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
  }

  await writeAuditLog({
    action: 'coupon.update',
    performedBy: user.id,
    entityType: 'coupon',
    entityId: id,
    newValue: updateData,
    req: request,
  });

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { user } = await requireAuth();
  await requireRole('admin');

  const { id } = await params;
  const adminSupabase = createAdminClient();

  const { data: existing } = await adminSupabase
    .from('coupon_codes')
    .select('code')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
  }

  const { error } = await adminSupabase.from('coupon_codes').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeAuditLog({
    action: 'coupon.delete',
    performedBy: user.id,
    entityType: 'coupon',
    entityId: id,
    oldValue: existing,
    req: request,
  });

  return NextResponse.json({ ok: true });
}