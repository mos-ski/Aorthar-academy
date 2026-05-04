import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyTransaction } from '@/lib/paystack';
import { sendEmail } from '@/lib/email';
import {
  marketplaceDownloadHtml,
  marketplaceDownloadSubject,
} from '@/lib/email/templates/marketplace-download';
import MarketplaceNav from '../_components/MarketplaceNav';
import SuccessPage from '../_components/SuccessPage';

export const metadata: Metadata = { title: 'Download Ready — Aorthar Marketplace' };

export default async function MarketplaceSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  if (!ref) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#18191a', color: '#ffffff' }}>
        <MarketplaceNav />
        <SuccessPage
          productName=""
          downloadToken={null}
          tokenExpiresAt={null}
          email=""
          error="No payment reference found. Please complete a purchase first."
        />
      </div>
    );
  }

  let downloadToken: string | null = null;
  let tokenExpiresAt: string | null = null;
  let productName = '';
  let email = '';
  let error: string | null = null;

  try {
    const admin = createAdminClient();

    const { data: purchase } = await admin
      .from('marketplace_purchases')
      .select('id, email, payment_status, product_id, download_token, token_expires_at')
      .eq('paystack_reference', ref)
      .maybeSingle();

    if (!purchase) {
      error = 'Purchase not found.';
    } else if (purchase.payment_status === 'paid') {
      downloadToken = purchase.download_token;
      tokenExpiresAt = purchase.token_expires_at;
      const { data: product } = await admin
        .from('marketplace_products')
        .select('name')
        .eq('id', purchase.product_id)
        .single();
      productName = product?.name ?? '';
      email = purchase.email;
    } else {
      const tx = await verifyTransaction(ref);

      if (tx?.data?.status !== 'success') {
        error = 'Payment has not been confirmed yet.';
      } else {
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
          console.error('[success] DB update error:', updateError);
          error = 'Failed to record payment. Please contact support.';
        } else {
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

          productName = product?.name ?? 'your purchase';
          email = purchase.email;
          downloadToken = updated?.download_token ?? null;
          tokenExpiresAt = updated?.token_expires_at ?? null;

          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
          const downloadUrl = `${siteUrl}/api/marketplace/download?token=${downloadToken}`;

          void (async () => {
            try {
              await sendEmail({
                to: email,
                subject: marketplaceDownloadSubject(productName),
                html: marketplaceDownloadHtml({
                  productName,
                  downloadUrl,
                  tokenExpiresAt: tokenExpiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                  amountNgn,
                  email,
                }),
              });
            } catch (e) {
              console.error('[success] download email failed:', e);
            }
          })();
        }
      }
    }
  } catch (err) {
    console.error('[success] verification error:', err);
    error = 'Could not verify payment. Please refresh to try again.';
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#18191a', color: '#ffffff' }}>
      <MarketplaceNav />
      <SuccessPage
        productName={productName}
        downloadToken={downloadToken}
        tokenExpiresAt={tokenExpiresAt}
        email={email}
        error={error}
      />
    </div>
  );
}
