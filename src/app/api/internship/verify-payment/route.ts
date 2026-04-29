import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyTransaction } from '@/lib/paystack';

// GET /api/internship/verify-payment?ref={reference}
// Idempotent: if already paid, returns ok immediately
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref')?.trim();

  if (!ref) {
    return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: application } = await admin
    .from('internship_applications')
    .select('id, payment_status, email')
    .eq('paystack_reference', ref)
    .maybeSingle();

  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  // Already verified — return immediately (idempotent)
  if (application.payment_status === 'paid') {
    return NextResponse.json({ ok: true, application_id: application.id, email: application.email });
  }

  // Verify with Paystack
  let tx;
  try {
    tx = await verifyTransaction(ref);
  } catch (err) {
    console.error('[internship/verify-payment] Paystack verify error:', err);
    return NextResponse.json({ error: 'Could not verify payment. Please try again.' }, { status: 502 });
  }

  if (tx?.data?.status !== 'success') {
    return NextResponse.json({ error: 'Payment has not been confirmed yet.' }, { status: 402 });
  }

  // Update to paid
  const { error: updateError } = await admin
    .from('internship_applications')
    .update({
      payment_status: 'paid',
      amount_paid_ngn: 10000,
      paid_at: new Date().toISOString(),
    })
    .eq('paystack_reference', ref);

  if (updateError) {
    console.error('[internship/verify-payment] DB update error:', updateError);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, application_id: application.id, email: application.email });
}
