/**
 * Subdomain-aware URL helpers.
 *
 * In production, each product lives on its own subdomain:
 *   - aorthar.com             → Marketing site
 *   - university.aorthar.com  → University
 *   - bootcamp.aorthar.com    → Bootcamps
 *   - internship.aorthar.com  → Internship
 *   - admin.aorthar.com       → Admin CMS
 *
 * In development, everything runs on localhost:3000 and these helpers
 * return relative paths instead of full URLs.
 */

const PRODUCTION_URLS = {
  base: process.env.NEXT_PUBLIC_BASE_URL ?? 'https://aorthar.com',
  university: process.env.NEXT_PUBLIC_UNIVERSITY_URL ?? 'https://university.aorthar.com',
  bootcamp: process.env.NEXT_PUBLIC_BOOTCAMP_URL ?? 'https://bootcamp.aorthar.com',
  internship: process.env.NEXT_PUBLIC_INTERNSHIP_URL ?? 'https://internship.aorthar.com',
  admin: process.env.NEXT_PUBLIC_ADMIN_URL ?? 'https://admin.aorthar.com',
} as const;

const isDev = process.env.NODE_ENV === 'development';

/**
 * Build a URL for the given product subdomain.
 * In development, returns the relative path (e.g. `/courses-app/learn`).
 * In production, returns the full URL (e.g. `https://bootcamp.aorthar.com/courses-app/learn`).
 */
export function productUrl(
  product: keyof typeof PRODUCTION_URLS,
  path: string = '/',
): string {
  if (isDev) return path;
  const base = PRODUCTION_URLS[product].replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/** Shorthand helpers for each product */
export const urls = {
  base: (path: string = '/') => productUrl('base', path),
  university: (path: string = '/') => productUrl('university', path),
  bootcamp: (path: string = '/') => productUrl('bootcamp', path),
  internship: (path: string = '/') => productUrl('internship', path),
  admin: (path: string = '/') => productUrl('admin', path),
} as const;

/**
 * Extract the subdomain product name from a hostname.
 * Returns `'university' | 'bootcamp' | 'internship' | 'admin' | 'base' | null`
 */
export function getProductFromHost(hostname: string): keyof typeof PRODUCTION_URLS | null {
  const host = hostname.replace(/:\d+$/, ''); // strip port
  if (host === 'university.aorthar.com') return 'university';
  if (host === 'bootcamp.aorthar.com') return 'bootcamp';
  if (host === 'internship.aorthar.com') return 'internship';
  if (host === 'admin.aorthar.com') return 'admin';
  if (host === 'aorthar.com' || host === 'localhost') return 'base';
  // Also support legacy courses.aorthar.com → bootcamp
  if (host === 'courses.aorthar.com') return 'bootcamp';
  return null;
}
