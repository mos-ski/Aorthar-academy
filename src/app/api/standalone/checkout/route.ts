import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { initiatePayment, generateReference } from '@/lib/paystack';
import { requireApiAuthNotSuspended } from '@/lib/auth';

export async function POST(request: NextRequest) {
  let userId: string;
  try {
    const auth = await requireApiAuthNotSuspended();
    userId = auth.userId;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Not authenticated';
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (message === 'SUSPENDED') {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let slug = '';
  let couponCode: string | null = null;
  try {
    const ct = request.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      const body = await request.json();
      slug = body.slug ?? '';
      couponCode = body.coupon_code ?? null;
    } else {
      const form = await request.formData();
      slug = form.get('slug')?.toString() ?? '';
      couponCode = form.get('coupon_code')?.toString() ?? null;
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!slug) {
    return NextResponse.json({ error: 'Course slug required' }, { status: 400 });
  }

  const { data: course } = await supabase
    .from('standalone_courses')
    .select('id, title, price_ngn, status')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from('standalone_purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ redirect: `/courses-app/learn/${slug}` }, { status: 409 });
  }

  let finalPrice = course.price_ngn;
  let appliedCoupon: { id: string; code: string; discount_type: string; discount_value: number } | null = null;

  if (couponCode) {
    const adminSupabase = createAdminClient();
    const { data: coupon } = await adminSupabase
      .from('coupon_codes')
      .select('id, code, discount_type, discount_value, scope, course_id, max_uses, used_count, is_active, expires_at')
      .eq('code', couponCode.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }

    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 });
    }

    if (coupon.scope === 'specific' && coupon.course_id !== course.id) {
      return NextResponse.json({ error: 'This coupon is not valid for this course' }, { status: 400 });
    }

    if (coupon.discount_type === 'percentage') {
      finalPrice = Math.max(0, Math.round(finalPrice * (1 - coupon.discount_value / 100)));
    } else {
      finalPrice = Math.max(0, finalPrice - coupon.discount_value);
    }

    appliedCoupon = { id: coupon.id, code: coupon.code, discount_type: coupon.discount_type, discount_value: coupon.discount_value };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', user.id)
    .maybeSingle();

  const email = user.email ?? '';
  const reference = generateReference(user.id);
  const amountKobo = finalPrice * 100;

  const origin = request.nextUrl.origin;

  const metadata: Record<string, string> = {
    type: 'standalone_course',
    course_id: course.id,
    course_slug: slug,
    user_id: user.id,
    user_name: profile?.full_name ?? '',
  };
  if (appliedCoupon) {
    metadata.coupon_id = appliedCoupon.id;
    metadata.coupon_code = appliedCoupon.code;
    metadata.original_price_ngn = String(course.price_ngn);
    metadata.discounted_price_ngn = String(finalPrice);
  }

  try {
    const paystack = await initiatePayment({
      email,
      amount_kobo: amountKobo,
      reference,
      metadata,
      callback_url: `${origin}/courses-app/learn/${slug}`,
    });

    const response: Record<string, unknown> = { payment_url: paystack.data.authorization_url };
    if (appliedCoupon) {
      response.original_price = course.price_ngn;
      response.discounted_price = finalPrice;
      response.coupon = appliedCoupon;
    }
    return NextResponse.json(response);
  } catch (err) {
    console.error('[standalone/checkout] Paystack error:', err);
    return NextResponse.json({ error: 'Payment initiation failed. Please try again.' }, { status: 500 });
  }
}
