import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { initiatePayment, generateReference } from '@/lib/paystack';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in — redirect to register with ?next pointing back to the course
  const referer = request.headers.get('referer') ?? 'https://courses.aorthar.com';
  if (!user) {
    // Extract slug from form so we can build the next param
    let slugForRedirect = '';
    try {
      const ct = request.headers.get('content-type') ?? '';
      if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
        const form = await request.formData();
        slugForRedirect = form.get('slug')?.toString() ?? '';
      }
    } catch { /* ignore */ }
    const registerUrl = new URL('/register', 'https://courses.aorthar.com');
    if (slugForRedirect) registerUrl.searchParams.set('next', `/courses-app/checkout/${slugForRedirect}`);
    return NextResponse.redirect(registerUrl.toString(), { status: 303 });
  }

  // Parse slug — accept both form-data and JSON
  let slug = '';
  try {
    const ct = request.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      const body = await request.json();
      slug = body.slug ?? '';
    } else {
      const form = await request.formData();
      slug = form.get('slug')?.toString() ?? '';
    }
  } catch {
    return NextResponse.redirect(referer, { status: 303 });
  }

  if (!slug) {
    return NextResponse.redirect(referer, { status: 303 });
  }

  // Load course
  const { data: course } = await supabase
    .from('standalone_courses')
    .select('id, title, price_ngn, status')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!course) {
    return NextResponse.redirect(referer, { status: 303 });
  }

  // Already purchased — send straight to classroom
  const { data: existing } = await supabase
    .from('standalone_purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle();

  const host = request.headers.get('host') ?? 'courses.aorthar.com';
  const origin = host.includes('localhost') ? `http://${host}` : `https://courses.aorthar.com`;

  if (existing) {
    return NextResponse.redirect(`${origin}/courses-app/learn/${slug}`, { status: 303 });
  }

  // Get profile for name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', user.id)
    .maybeSingle();

  const email = user.email ?? '';
  const reference = generateReference(user.id);
  const amountKobo = course.price_ngn * 100;

  try {
    const paystack = await initiatePayment({
      email,
      amount_kobo: amountKobo,
      reference,
      metadata: {
        type: 'standalone_course',
        course_id: course.id,
        course_slug: slug,
        user_id: user.id,
        user_name: profile?.full_name ?? '',
      },
      callback_url: `${origin}/courses-app/learn/${slug}`,
    });

    // Redirect browser directly to Paystack payment page
    return NextResponse.redirect(paystack.data.authorization_url, { status: 303 });
  } catch (err) {
    console.error('[standalone/checkout] Paystack error:', err);
    return NextResponse.redirect(`${origin}/courses-app/${slug}?error=payment_failed`, { status: 303 });
  }
}
