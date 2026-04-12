import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

  // Accept both JSON and form data
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
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!slug) {
    return NextResponse.json({ error: 'Course slug required' }, { status: 400 });
  }

  // Load course
  const { data: course } = await supabase
    .from('standalone_courses')
    .select('id, title, price_ngn, status')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  // Already purchased → return redirect URL
  const { data: existing } = await supabase
    .from('standalone_purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ redirect: `/courses-app/learn/${slug}` }, { status: 409 });
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

  // Use the actual request origin for the callback URL
  const origin = request.nextUrl.origin;

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

    return NextResponse.json({ payment_url: paystack.data.authorization_url });
  } catch (err) {
    console.error('[standalone/checkout] Paystack error:', err);
    return NextResponse.json({ error: 'Payment initiation failed. Please try again.' }, { status: 500 });
  }
}
