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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/marketplace/${product.slug}`}
          className="group flex flex-col rounded-xl overflow-hidden transition-all hover:scale-[1.01]"
          style={{ backgroundColor: '#1c1c1c', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Thumbnail */}
          <div
            className="h-[180px] flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#141414' }}
          >
            {product.thumbnail_url ? (
              <img
                src={product.thumbnail_url}
                alt={product.name}
                className="w-full h-full object-contain p-3"
              />
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
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

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-2"
              style={{ color: '#a7d252' }}
            >
              {CATEGORY_LABELS[product.category] ?? 'Resource'}
            </p>
            <h3
              className="text-[17px] font-semibold leading-snug mb-2 group-hover:opacity-80 transition-opacity"
              style={{ letterSpacing: '-0.01em' }}
            >
              {product.name}
            </h3>
            {product.description && (
              <p
                className="text-[14px] leading-6 mb-4 flex-1 line-clamp-2"
                style={{ color: '#b1b1b1' }}
              >
                {product.description}
              </p>
            )}
            <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-[16px] font-bold text-white">
                {product.price_ngn === 0 ? 'Free' : `₦${product.price_ngn.toLocaleString('en-NG')}`}
              </span>
              <span className="text-[13px] font-medium" style={{ color: '#a7d252' }}>
                Get it →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
