import type { Metadata } from 'next';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import MarketplaceNav from './_components/MarketplaceNav';
import MarketplaceStorefront from './_components/MarketplaceStorefront';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Marketplace — Aorthar',
  description: 'PDFs, templates, guides, and toolkits from Aorthar.',
};

export default async function MarketplacePage() {
  const admin = createAdminClient();

  const { data: products } = await admin
    .from('marketplace_products')
    .select('id, slug, name, description, price_ngn, category, thumbnail_url')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#18191a', color: '#ffffff' }}>
      <MarketplaceNav />

      <section className="px-5 sm:px-10 py-16 sm:py-20" style={{ backgroundColor: '#101010' }}>
        <div className="max-w-[1280px] mx-auto">
          {/* Hero */}
          <div className="mb-12">
            <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: '#a7d252' }}>
              Aorthar Marketplace
            </p>
            <h1
              className="text-[36px] sm:text-[52px] font-semibold mb-4 leading-[1.05]"
              style={{ letterSpacing: '-0.025em' }}
            >
              Resources Built for<br className="hidden sm:block" /> Product Practitioners
            </h1>
            <p className="text-[16px] sm:text-[18px] leading-7 max-w-[600px]" style={{ color: '#b1b1b1' }}>
              PDFs, templates, guides, and toolkits — crafted by the Aorthar team and ready to download instantly.
            </p>
          </div>

          <MarketplaceStorefront products={products ?? []} />
        </div>
      </section>

      <footer className="px-5 sm:px-10 py-8 border-t text-center text-[13px]" style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#6b7280' }}>
        © 2025 Aorthar ·{' '}
        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
        {' · '}
        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
      </footer>
    </div>
  );
}
