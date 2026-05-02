import type { Metadata } from 'next';
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

  // Verify payment server-side
  let downloadToken: string | null = null;
  let tokenExpiresAt: string | null = null;
  let productName = '';
  let email = '';
  let error: string | null = null;

  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      ?? process.env.NEXT_PUBLIC_INTERNSHIP_URL?.replace('/internship', '')
      ?? 'http://localhost:3000';

    const res = await fetch(
      `${baseUrl}/api/marketplace/verify-payment?ref=${encodeURIComponent(ref)}`,
      { cache: 'no-store' },
    );

    const data = await res.json();

    if (res.ok && data.ok) {
      downloadToken = data.download_token;
      tokenExpiresAt = data.token_expires_at;
      productName = data.product_name ?? '';
      email = data.email ?? '';
    } else {
      error = data.error ?? 'Payment could not be verified.';
    }
  } catch {
    error = 'Could not connect to payment service. Please refresh to try again.';
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
