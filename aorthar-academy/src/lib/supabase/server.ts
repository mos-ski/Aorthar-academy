import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// In production, set cookie domain to .aorthar.com so sessions are shared
// across university.aorthar.com and courses.aorthar.com
const cookieDomain =
  process.env.NEXT_PUBLIC_APP_ENV === 'production' ||
  process.env.NEXT_PUBLIC_APP_ENV === 'staging'
    ? '.aorthar.com'
    : undefined;

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                ...(cookieDomain ? { domain: cookieDomain } : {}),
              }),
            );
          } catch {
            // setAll called from Server Component — safe to ignore
          }
        },
      },
    },
  );
}
