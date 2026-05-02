import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/marketplace/download?token=<UUID>
// Validates token, increments download count, redirects to file URL
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim();

  if (!token) {
    return NextResponse.json({ error: 'Download token is required' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: purchase } = await admin
    .from('marketplace_purchases')
    .select('id, product_id, payment_status, token_expires_at, download_count')
    .eq('download_token', token)
    .maybeSingle();

  if (!purchase) {
    return new NextResponse('Invalid download link. Please check your email or contact hello@aorthar.com.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  if (purchase.payment_status !== 'paid') {
    return new NextResponse('Payment not completed. Please complete your purchase first.', {
      status: 402,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  if (new Date(purchase.token_expires_at) < new Date()) {
    return new NextResponse(
      'This download link has expired (valid for 7 days). Please contact hello@aorthar.com for a fresh link.',
      { status: 410, headers: { 'Content-Type': 'text/plain' } },
    );
  }

  const { data: product } = await admin
    .from('marketplace_products')
    .select('file_url, name')
    .eq('id', purchase.product_id)
    .single();

  if (!product?.file_url) {
    return new NextResponse(
      'File not available. Please contact hello@aorthar.com.',
      { status: 503, headers: { 'Content-Type': 'text/plain' } },
    );
  }

  // Increment download count (fire-and-forget — don't block redirect)
  void admin
    .from('marketplace_purchases')
    .update({ download_count: (purchase.download_count ?? 0) + 1 })
    .eq('id', purchase.id);

  return NextResponse.redirect(product.file_url, { status: 302 });
}
