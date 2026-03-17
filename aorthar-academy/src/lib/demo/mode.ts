import { cookies } from 'next/headers';

export const DEMO_COOKIE = 'aorthar_demo';

/** Returns true when the user has forced demo data on. */
export async function isDemoMode(): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_APP_ENV === 'production') return false;
  const store = await cookies();
  return store.get(DEMO_COOKIE)?.value === '1';
}

/**
 * Returns true when the user has explicitly toggled to Live.
 * Pages should skip their passive demo fallback (DB-empty check) in this case,
 * so the user sees the real empty state instead of demo data.
 */
export async function isExplicitLiveMode(): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_APP_ENV === 'production') return false;
  const store = await cookies();
  return store.get(DEMO_COOKIE)?.value === '0';
}
