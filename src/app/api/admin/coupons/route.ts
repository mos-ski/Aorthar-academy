import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth, requireRole } from '@/lib/auth';
import { writeAuditLog } from '@/lib/admin/audit';

export async function GET() {
  const { user } = await requireAuth();
  await requireRole('admin');

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from('coupon_codes')
    .select('*, standalone_courses(title, slug)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { user } = await requireAuth();
  await requireRole('admin');

  const body = await request.json();
  const { code, discount_type, discount_value, scope, course_id, max_uses, expires_at } = body;

  if (!code || !discount_type || !discount_value) {
    return NextResponse.json({ error: 'code, discount_type, and discount_value are required' }, { status: 400 });
  }

  if (!['percentage', 'fixed'].includes(discount_type)) {
    return NextResponse.json({ error: 'discount_type must be "percentage" or "fixed"' }, { status: 400 });
  }

  if (discount_type === 'percentage' && (discount_value < 1 || discount_value > 100)) {
    return NextResponse.json({ error: 'Percentage discount must be between 1 and 100' }, { status: 400 });
  }

  if (discount_type === 'fixed' && discount_value < 0) {
    return NextResponse.json({ error: 'Fixed price cannot be negative' }, { status: 400 });
  }

  if (!['all', 'specific'].includes(scope)) {
    return NextResponse.json({ error: 'scope must be "all" or "specific"' }, { status: 400 });
  }

  if (scope === 'specific' && !course_id) {
    return NextResponse.json({ error: 'course_id is required when scope is "specific"' }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  const insertData: Record<string, unknown> = {
    code: code.toUpperCase().trim(),
    discount_type,
    discount_value: Number(discount_value),
    scope,
    course_id: scope === 'specific' ? course_id : null,
    max_uses: max_uses ? Number(max_uses) : null,
    expires_at: expires_at || null,
  };

  const { data, error } = await adminSupabase
    .from('coupon_codes')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeAuditLog({
    action: 'coupon.create',
    performedBy: user.id,
    entityType: 'coupon',
    entityId: data.id,
    newValue: { code: data.code, discount_type, discount_value, scope },
    req: request,
  });

  return NextResponse.json(data, { status: 201 });
}