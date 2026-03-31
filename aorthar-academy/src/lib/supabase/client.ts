import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        // Share sessions across all .aorthar.com subdomains in production/staging
        domain:
          process.env.NEXT_PUBLIC_APP_ENV === 'production' ||
          process.env.NEXT_PUBLIC_APP_ENV === 'staging'
            ? '.aorthar.com'
            : undefined,
      },
    },
  );
}
