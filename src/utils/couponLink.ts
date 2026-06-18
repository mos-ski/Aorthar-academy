export function getCouponCodeFromSearch(search: string): string | null {
  const params = new URLSearchParams(search);
  const code = params.get('coupon');
  if (!code) return null;
  const trimmed = code.trim();
  return trimmed ? trimmed.toUpperCase() : null;
}

export function buildCouponShareLink(origin: string, slug: string, code: string): string {
  const base = origin.replace(/\/$/, '');
  return `${base}/courses-app/${slug}?coupon=${encodeURIComponent(code)}`;
}
