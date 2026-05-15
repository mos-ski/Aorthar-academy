import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth, requireRole } from '@/lib/auth';
import { writeAuditLog } from '@/lib/admin/audit';

type Params = { params: Promise<{ id: string }> };
type SaleType = 'pre_sale' | 'live_class' | 'recorded_course';
const saleTypes = new Set<SaleType>(['pre_sale', 'live_class', 'recorded_course']);

type CourseUpdate = {
  title: string;
  slug: string;
  description: string;
  long_description: string;
  thumbnail_url: string | null;
  price_ngn: number;
  instructor_name: string;
  instructor_avatar_url: string | null;
  sale_type?: SaleType;
  status: string;
};

function isMissingSaleTypeColumn(error: { message?: string; code?: string } | null): boolean {
  return Boolean(
    error
      && (
        error.code === 'PGRST204'
        || error.code === '42703'
        || error.message?.includes('sale_type')
      ),
  );
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { user } = await requireAuth();
  await requireRole('admin');

  const { id } = await params;
  const body = await request.json();
  const saleType = saleTypes.has(body.sale_type) ? body.sale_type as SaleType : 'recorded_course';

  const adminSupabase = createAdminClient();

  // Fetch old value for audit diff
  const { data: existing } = await adminSupabase
    .from('standalone_courses')
    .select('title, slug, price_ngn, status')
    .eq('id', id)
    .single();

  const updatePayload: CourseUpdate = {
    title: body.title,
    slug: body.slug,
    description: body.description,
    long_description: body.long_description,
    thumbnail_url: body.thumbnail_url || null,
    price_ngn: Number(body.price_ngn),
    instructor_name: body.instructor_name || 'Aorthar Instructor',
    instructor_avatar_url: body.instructor_avatar_url || null,
    sale_type: saleType,
    status: body.status,
  };

  let saleTypePersisted = true;
  let { error } = await adminSupabase
    .from('standalone_courses')
    .update(updatePayload)
    .eq('id', id);

  if (isMissingSaleTypeColumn(error)) {
    const fallbackPayload = { ...updatePayload };
    delete fallbackPayload.sale_type;
    saleTypePersisted = false;
    const fallback = await adminSupabase
      .from('standalone_courses')
      .update(fallbackPayload)
      .eq('id', id);
    error = fallback.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeAuditLog({
    action: 'standalone_course.update',
    performedBy: user.id,
    entityType: 'standalone_course',
    entityId: id,
    oldValue: existing,
    newValue: { title: body.title, slug: body.slug, price_ngn: body.price_ngn, sale_type: saleType, sale_type_persisted: saleTypePersisted, status: body.status },
    req: request,
  });

  return NextResponse.json({
    ok: true,
    sale_type_persisted: saleTypePersisted,
    warning: saleTypePersisted ? undefined : 'Sale type needs the pending database migration before it can be saved.',
  });
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

  if (!existing) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const { count } = await adminSupabase
    .from('standalone_purchases')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', id);

  if ((count ?? 0) > 0) {
    const { error } = await adminSupabase
      .from('standalone_courses')
      .update({ status: 'unpublished' })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await writeAuditLog({
      action: 'standalone_course.soft_delete',
      performedBy: user.id,
      entityType: 'standalone_course',
      entityId: id,
      oldValue: existing,
      newValue: { status: 'unpublished' },
      req: request,
    });

    return NextResponse.json({ ok: true, soft_deleted: true });
  }

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

  return NextResponse.json({ ok: true, soft_deleted: false });
}
