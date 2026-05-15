import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const courseId = request.nextUrl.searchParams.get('course_id');

  if (!code) {
    return NextResponse.json({ error: 'code parameter is required' }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const { data: coupon, error } = await adminSupabase
    .from('coupon_codes')
    .select('id, code, discount_type, discount_value, scope, course_id, max_uses, used_count, is_active, expires_at')
    .eq('code', code.toUpperCase().trim())
    .eq('is_active', true)
    .single();

  if (error || !coupon) {
    return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
  }

  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 });
  }

  if (coupon.scope === 'specific' && courseId && coupon.course_id !== courseId) {
    return NextResponse.json({ error: 'This coupon is not valid for this course' }, { status: 400 });
  }

  return NextResponse.json({
    id: coupon.id,
    code: coupon.code,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    scope: coupon.scope,
    course_id: coupon.course_id,
  });
}