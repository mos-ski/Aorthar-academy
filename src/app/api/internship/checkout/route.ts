import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { initiatePayment } from '@/lib/paystack';

const INTERNSHIP_URL = process.env.NEXT_PUBLIC_INTERNSHIP_URL ?? 'http://localhost:3000/internship';

// POST /api/internship/checkout
// Body: { email: string }
// Returns: { payment_url: string } or { payment_url: null, ref: string } if already paid + unsubmitted
export async function POST(request: NextRequest) {
  let email = '';
  try {
    const body = await request.json();
    email = (body.email ?? '').trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
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

  const reference = `int-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Pre-create the application row with pending status
  const { error: insertError } = await admin
    .from('internship_applications')
    .insert({ paystack_reference: reference, payment_status: 'pending', email });

  if (insertError) {
    console.error('[internship/checkout] DB insert error:', insertError);
    return NextResponse.json({ error: 'Failed to initialise application' }, { status: 500 });
  }

  try {
    const paystack = await initiatePayment({
      email,
      amount_kobo: 1_000_000, // ₦10,000
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
