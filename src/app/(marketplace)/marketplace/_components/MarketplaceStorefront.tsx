import Link from 'next/link';

const CATEGORY_LABELS: Record<string, string> = {
  pdf: 'PDF',
  template: 'Template',
  guide: 'Guide',
  toolkit: 'Toolkit',
  other: 'Resource',
};

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_ngn: number;
  category: string;
  thumbnail_url: string | null;
}

export default function MarketplaceStorefront({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-5">
        <p className="text-[18px] font-semibold mb-2">Coming Soon</p>
        <p className="text-[15px]" style={{ color: '#b1b1b1' }}>
          Products are being added. Check back shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b pb-3 text-[13px]" style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#b1b1b1' }}>
        <p>1-{products.length} of {products.length} results</p>
        <p className="hidden sm:block">Sort by: Featured</p>
      </div>

      {products.map((product) => (
        <Link
          key={product.id}
          href={`/marketplace/${product.slug}`}
          className="group grid grid-cols-1 overflow-hidden rounded-md border transition-colors hover:border-white/20 sm:grid-cols-[260px_1fr] lg:grid-cols-[320px_1fr]"
          style={{ backgroundColor: '#171717', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div
            className="relative min-h-[260px] overflow-hidden sm:min-h-[250px]"
            style={{ backgroundColor: '#f3f3f3' }}
          >
            {product.thumbnail_url ? (
              <img
                src={product.thumbnail_url}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.025]"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                    stroke="#a7d252"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#a7d252" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col p-5 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className="rounded-[3px] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em]"
                style={{ backgroundColor: '#a7d252', color: '#101010' }}
              >
                {CATEGORY_LABELS[product.category] ?? 'Resource'}
              </span>
              <span className="text-[13px]" style={{ color: '#8a8a8a' }}>Instant DOCX download</span>
            </div>
            <h3
              className="mb-2 text-[20px] font-semibold leading-snug transition-colors group-hover:text-[#a7d252] sm:text-[22px]"
              style={{ letterSpacing: '-0.01em' }}
            >
              {product.name}
            </h3>
            {product.description && (
              <p
                className="mb-5 max-w-[850px] flex-1 text-[15px] leading-7 line-clamp-3"
                style={{ color: '#b1b1b1' }}
              >
                {product.description}
              </p>
            )}
            <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[13px]" style={{ color: '#8a8a8a' }}>Digital playbook</p>
                <p className="text-[28px] font-bold leading-none text-white">
                  {product.price_ngn === 0 ? 'Free' : `₦${product.price_ngn.toLocaleString('en-NG')}`}
                </p>
              </div>
              <span
                className="rounded-full px-5 py-2.5 text-[14px] font-semibold transition-transform group-hover:scale-[1.02]"
                style={{ backgroundColor: '#a7d252', color: '#101010' }}
              >
                View product
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
