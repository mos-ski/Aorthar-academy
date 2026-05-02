import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyTransaction } from '@/lib/paystack';
import { sendEmail } from '@/lib/email';
import {
  marketplaceDownloadHtml,
  marketplaceDownloadSubject,
} from '@/lib/email/templates/marketplace-download';

// GET /api/marketplace/verify-payment?ref=
// Idempotent: if already paid, returns { ok, download_token } immediately
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref')?.trim();

  if (!ref) {
    return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: purchase } = await admin
    .from('marketplace_purchases')
    .select('id, email, payment_status, product_id, download_token, token_expires_at')
    .eq('paystack_reference', ref)
    .maybeSingle();

  if (!purchase) {
    return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
  }

  // Already verified — idempotent return
  if (purchase.payment_status === 'paid') {
    const { data: product } = await admin
      .from('marketplace_products')
      .select('name')
      .eq('id', purchase.product_id)
      .single();

    return NextResponse.json({
      ok: true,
      download_token: purchase.download_token,
      token_expires_at: purchase.token_expires_at,
      product_name: product?.name ?? '',
      email: purchase.email,
    });
  }

  // Verify with Paystack
  let tx;
  try {
    tx = await verifyTransaction(ref);
  } catch (err) {
    console.error('[marketplace/verify-payment] Paystack verify error:', err);
    return NextResponse.json({ error: 'Could not verify payment. Please try again.' }, { status: 502 });
  }

  if (tx?.data?.status !== 'success') {
    return NextResponse.json({ error: 'Payment has not been confirmed yet.' }, { status: 402 });
  }

  const amountNgn = Math.round((tx?.data?.amount ?? 0) / 100);

  const { error: updateError } = await admin
    .from('marketplace_purchases')
    .update({
      payment_status: 'paid',
      amount_paid_ngn: amountNgn,
      paid_at: new Date().toISOString(),
    })
    .eq('paystack_reference', ref);

  if (updateError) {
    console.error('[marketplace/verify-payment] DB update error:', updateError);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }

  // Fetch refreshed purchase data with the updated token info
  const { data: updated } = await admin
    .from('marketplace_purchases')
    .select('download_token, token_expires_at')
    .eq('paystack_reference', ref)
    .single();

  const { data: product } = await admin
    .from('marketplace_products')
    .select('name')
    .eq('id', purchase.product_id)
    .single();

  const productName = product?.name ?? 'your purchase';
  const origin = request.nextUrl.origin;
  const downloadUrl = `${origin}/api/marketplace/download?token=${updated?.download_token}`;

  // Fire-and-forget: send download email
  void (async () => {
    try {
      await sendEmail({
        to: purchase.email,
        subject: marketplaceDownloadSubject(productName),
        html: marketplaceDownloadHtml({
          productName,
          downloadUrl,
          tokenExpiresAt: updated?.token_expires_at ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          amountNgn,
          email: purchase.email,
        }),
      });
    } catch (emailErr) {
      console.error('[marketplace/verify-payment] download email failed:', emailErr);
    }
  })();

  return NextResponse.json({
    ok: true,
    download_token: updated?.download_token,
    token_expires_at: updated?.token_expires_at,
    product_name: productName,
    email: purchase.email,
  });
}
