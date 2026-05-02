'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

const CATEGORY_LABELS: Record<string, string> = {
  pdf: 'PDF',
  template: 'Template',
  guide: 'Guide',
  toolkit: 'Toolkit',
  other: 'Resource',
};

const CHANNEL_FILTERS = [
  { label: 'All channels', value: 'all', terms: [] },
  { label: 'Meta ads', value: 'meta', terms: ['facebook', 'meta', 'instagram'] },
  { label: 'Google ads', value: 'google', terms: ['google', 'search'] },
  { label: 'TikTok ads', value: 'tiktok', terms: ['tiktok'] },
  { label: 'Snapchat ads', value: 'snapchat', terms: ['snapchat'] },
  { label: 'Campaign strategy', value: 'campaign', terms: ['campaign', 'lightforth'] },
] as const;

const PRICE_FILTERS = [
  { label: 'Any price', value: 'all' },
  { label: 'Free', value: 'free' },
  { label: 'Up to ₦1,000', value: 'under-1000' },
  { label: '₦1,001 to ₦5,000', value: '1001-5000' },
  { label: 'Above ₦5,000', value: 'above-5000' },
] as const;

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_ngn: number;
  category: string;
  thumbnail_url: string | null;
}

function productSearchText(product: Product): string {
  return `${product.name} ${product.description} ${product.category} ${product.slug}`.toLowerCase();
}

function matchesPrice(product: Product, priceFilter: string): boolean {
  if (priceFilter === 'free') return product.price_ngn === 0;
  if (priceFilter === 'under-1000') return product.price_ngn <= 1000;
  if (priceFilter === '1001-5000') return product.price_ngn >= 1001 && product.price_ngn <= 5000;
  if (priceFilter === 'above-5000') return product.price_ngn > 5000;
  return true;
}

function CheckboxFilter({
  checked,
  label,
  name,
  onChange,
}: {
  checked: boolean;
  label: string;
  name: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-[14px]" style={{ color: '#d7d7d7' }}>
      <span
        className="flex size-4 items-center justify-center rounded-[3px] border"
        style={{
          backgroundColor: checked ? '#a7d252' : 'transparent',
          borderColor: checked ? '#a7d252' : 'rgba(255,255,255,0.4)',
        }}
      >
        {checked ? <span className="size-1.5 rounded-full" style={{ backgroundColor: '#101010' }} /> : null}
      </span>
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only" />
      <span>{label}</span>
    </label>
  );
}

function MarketplaceFilters({
  activeCategory,
  activeChannel,
  activePrice,
  categories,
  onCategoryChange,
  onChannelChange,
  onClear,
  onPriceChange,
}: {
  activeCategory: string;
  activeChannel: string;
  activePrice: string;
  categories: string[];
  onCategoryChange: (category: string) => void;
  onChannelChange: (channel: string) => void;
  onClear: () => void;
  onPriceChange: (price: string) => void;
}) {
  return (
    <aside className="space-y-7">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-white">Filters</h2>
          <button
            type="button"
            onClick={onClear}
            className="text-[13px] font-medium transition-colors hover:text-white"
            style={{ color: '#a7d252' }}
          >
            Clear
          </button>
        </div>
        <div className="space-y-2 text-[15px]" style={{ color: '#d7d7d7' }}>
          <button type="button" onClick={() => onChannelChange('campaign')} className="block text-left transition-colors hover:text-white">
            Campaign strategy
          </button>
          <button type="button" onClick={() => onChannelChange('meta')} className="block text-left transition-colors hover:text-white">
            Social ads
          </button>
          <button type="button" onClick={() => onChannelChange('google')} className="block text-left transition-colors hover:text-white">
            Search ads
          </button>
          <button type="button" onClick={() => onPriceChange('under-1000')} className="block text-left transition-colors hover:text-white">
            Budget resources
          </button>
        </div>
      </div>

      <div className="border-t pt-6" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <h3 className="mb-3 text-[15px] font-bold text-white">Category</h3>
        <div className="space-y-3">
          <CheckboxFilter
            checked={activeCategory === 'all'}
            label="All resources"
            name="category-all"
            onChange={() => onCategoryChange('all')}
          />
          {categories.map((category) => (
            <CheckboxFilter
              key={category}
              checked={activeCategory === category}
              label={CATEGORY_LABELS[category] ?? category}
              name={`category-${category}`}
              onChange={() => onCategoryChange(category)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-[15px] font-bold text-white">Ad Channel</h3>
        <div className="space-y-3">
          {CHANNEL_FILTERS.map((filter) => (
            <CheckboxFilter
              key={filter.value}
              checked={activeChannel === filter.value}
              label={filter.label}
              name={`channel-${filter.value}`}
              onChange={() => onChannelChange(filter.value)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-[15px] font-bold text-white">Price</h3>
        <div className="space-y-3">
          {PRICE_FILTERS.map((filter) => (
            <CheckboxFilter
              key={filter.value}
              checked={activePrice === filter.value}
              label={filter.label}
              name={`price-${filter.value}`}
              onChange={() => onPriceChange(filter.value)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function MarketplaceStorefront({ products }: { products: Product[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeChannel, setActiveChannel] = useState('all');
  const [activePrice, setActivePrice] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.category))).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const channel = CHANNEL_FILTERS.find((filter) => filter.value === activeChannel);

    return products.filter((product) => {
      const searchText = productSearchText(product);
      const matchesSearch = normalizedSearch.length === 0 || searchText.includes(normalizedSearch);
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesChannel = !channel || channel.terms.length === 0 || channel.terms.some((term) => searchText.includes(term));

      return matchesSearch && matchesCategory && matchesChannel && matchesPrice(product, activePrice);
    });
  }, [activeCategory, activeChannel, activePrice, products, searchQuery]);

  const clearFilters = (): void => {
    setActiveCategory('all');
    setActiveChannel('all');
    setActivePrice('all');
    setSearchQuery('');
  };

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
    <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
      <div className="hidden lg:block">
        <MarketplaceFilters
          activeCategory={activeCategory}
          activeChannel={activeChannel}
          activePrice={activePrice}
          categories={categories}
          onCategoryChange={setActiveCategory}
          onChannelChange={setActiveChannel}
          onClear={clearFilters}
          onPriceChange={setActivePrice}
        />
      </div>

      <div className="min-w-0 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search playbooks, channels, templates..."
            className="h-11 min-w-0 flex-1 rounded-md border bg-transparent px-4 text-[15px] text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#a7d252]"
            style={{ borderColor: 'rgba(255,255,255,0.14)' }}
          />
          <button
            type="button"
            onClick={() => setShowMobileFilters((current) => !current)}
            className="h-11 rounded-md border px-4 text-[14px] font-semibold text-white lg:hidden"
            style={{ borderColor: 'rgba(255,255,255,0.14)' }}
          >
            Filters
          </button>
        </div>

        {showMobileFilters ? (
          <div className="rounded-md border p-5 lg:hidden" style={{ backgroundColor: '#171717', borderColor: 'rgba(255,255,255,0.08)' }}>
            <MarketplaceFilters
              activeCategory={activeCategory}
              activeChannel={activeChannel}
              activePrice={activePrice}
              categories={categories}
              onCategoryChange={setActiveCategory}
              onChannelChange={setActiveChannel}
              onClear={clearFilters}
              onPriceChange={setActivePrice}
            />
          </div>
        ) : null}

        <div className="flex items-center justify-between border-b pb-3 text-[13px]" style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#b1b1b1' }}>
          <p>
            {filteredProducts.length === 0
              ? 'No results'
              : `1-${filteredProducts.length} of ${filteredProducts.length} results`}
          </p>
          <p className="hidden sm:block">Sort by: Featured</p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-md border px-6 py-16 text-center" style={{ backgroundColor: '#171717', borderColor: 'rgba(255,255,255,0.08)' }}>
            <p className="text-[18px] font-semibold text-white">No matching resources</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-[14px] font-semibold transition-colors hover:text-white"
              style={{ color: '#a7d252' }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
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
        )}
      </div>
    </div>
  );
}
