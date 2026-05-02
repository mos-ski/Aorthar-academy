import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import MarketplaceNav from '../_components/MarketplaceNav';
import CheckoutForm from '../_components/CheckoutForm';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data: product } = await admin
    .from('marketplace_products')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!product) return { title: 'Not Found' };

  return {
    title: `${product.name} — Aorthar Marketplace`,
    description: product.description || undefined,
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  pdf: 'PDF',
  template: 'Template',
  guide: 'Guide',
  toolkit: 'Toolkit',
  other: 'Resource',
};

export default async function MarketplaceProductPage({ params }: Props) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: product } = await admin
    .from('marketplace_products')
    .select('id, slug, name, description, price_ngn, category, thumbnail_url')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!product) notFound();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#18191a', color: '#ffffff' }}>
      <MarketplaceNav />

      <section className="px-5 sm:px-10 py-16 sm:py-20" style={{ backgroundColor: '#101010' }}>
        <div className="max-w-[1280px] mx-auto">
          <Link
            href="/marketplace"
            className="text-[13px] hover:text-white transition-colors mb-10 inline-block"
            style={{ color: '#b1b1b1' }}
          >
            ← All Products
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left — product info */}
            <div>
              {/* Thumbnail */}
              <div
                className="w-full aspect-video rounded-xl flex items-center justify-center mb-8 overflow-hidden"
                style={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {product.thumbnail_url ? (
                  <img
                    src={product.thumbnail_url}
                    alt={product.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                      stroke="#a7d252"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#a7d252" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </div>

              <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: '#a7d252' }}>
                {CATEGORY_LABELS[product.category] ?? 'Resource'}
              </p>
              <h1
                className="text-[32px] sm:text-[42px] font-semibold mb-5 leading-[1.1]"
                style={{ letterSpacing: '-0.025em' }}
              >
                {product.name}
              </h1>

              {product.description && (
                <div className="space-y-4">
                  {product.description.split('\n').filter(Boolean).map((para: string, i: number) => (
                    <p key={i} className="text-[16px] leading-7" style={{ color: '#b1b1b1' }}>
                      {para}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Right — checkout */}
            <div className="lg:sticky lg:top-20">
              <CheckoutForm
                slug={product.slug}
                productName={product.name}
                priceNgn={product.price_ngn}
                category={product.category}
              />
            </div>
          </div>
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
