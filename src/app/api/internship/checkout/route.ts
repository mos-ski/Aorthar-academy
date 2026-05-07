import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { initiatePayment } from '@/lib/paystack';

const INTERNSHIP_URL = process.env.NEXT_PUBLIC_INTERNSHIP_URL ?? 'http://localhost:3000/internship';

// POST /api/internship/checkout
// Body: { full_name: string, email: string, address: string }
// Returns: { payment_url: string } or { payment_url: null, ref: string } if already paid + unsubmitted
export async function POST(request: NextRequest) {
  let fullName = '';
  let email = '';
  let address = '';
  try {
    const body = await request.json();
    fullName = (body.full_name ?? '').trim();
    email = (body.email ?? '').trim().toLowerCase();
    address = (body.address ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!fullName) {
    return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
  }
  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
  }
  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Check for an existing paid-but-unsubmitted application (idempotent path)
  const { data: existing } = await admin
    .from('internship_applications')
    .select('id, paystack_reference')
    .eq('email', email)
    .eq('payment_status', 'paid')
    .is('form_submitted_at', null)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      payment_url: null,
      ref: existing.paystack_reference,
      message: 'You already have a paid application slot. Please complete your application form.',
    });
  }

  // Read price from the current open cohort
  const { data: cohort } = await admin
    .from('internship_cohorts')
    .select('id, price_ngn')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const priceNgn = cohort?.price_ngn ?? 10000;
  const reference = `int-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Pre-create the application row with pending status
  const { error: insertError } = await admin
    .from('internship_applications')
    .insert({
      paystack_reference: reference,
      payment_status: 'pending',
      email,
      full_name: fullName,
      address,
    });

  if (insertError) {
    console.error('[internship/checkout] DB insert error:', insertError);
    return NextResponse.json({ error: 'Failed to initialise application' }, { status: 500 });
  }

  try {
    const paystack = await initiatePayment({
      email,
      amount_kobo: priceNgn * 100,
      reference,
      metadata: {
        type: 'internship_application',
        email,
      },
      callback_url: `${INTERNSHIP_URL}/application?ref=${reference}`,
    });

    return NextResponse.json({ payment_url: paystack.data.authorization_url });
  } catch (err) {
    console.error('[internship/checkout] Paystack error:', err);
    // Clean up the pre-created row so the email can try again
    await admin.from('internship_applications').delete().eq('paystack_reference', reference);
    return NextResponse.json({ error: 'Payment initiation failed. Please try again.' }, { status: 500 });
  }
}
