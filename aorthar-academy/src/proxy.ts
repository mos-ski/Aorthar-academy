import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ─────────────────────────────────────────────
// ROUTE CATEGORIES
// ─────────────────────────────────────────────

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/cookies',
  '/explore-courses',
  '/internship',
  '/login',
  '/partnership',
  '/pricing',
  '/privacy',
  '/register',
  '/terms',
  '/university',
  '/unauthorized',
  '/verify',
  // courses-app public routes
  '/courses-app',
];
const AUTH_ROUTES = ['/login', '/register', '/verify'];
const PREMIUM_ROUTES = ['/courses/400', '/transcript/export', '/mentorship', '/capstone'];
const ADMIN_ROUTES = ['/admin'];
const ONBOARDING_ROUTE = '/onboarding';

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((r) => pathname.startsWith(r));
}

function isPremiumRoute(pathname: string): boolean {
  return PREMIUM_ROUTES.some((r) => pathname.startsWith(r));
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));
}

function isOnboardingRoute(pathname: string): boolean {
  return pathname === ONBOARDING_ROUTE || pathname.startsWith(`${ONBOARDING_ROUTE}/`);
}

// ─────────────────────────────────────────────
// SUBDOMAIN ROUTING
// ─────────────────────────────────────────────

function getSubdomainRewrite(request: NextRequest): NextResponse | null {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // courses.aorthar.com → /courses-app/*
  // Strip any accidental /courses-app prefix that internal links may have added
  if (
    hostname === 'courses.aorthar.com' ||
    hostname === 'courses.aorthar.com:3000'
  ) {
    // Auth routes and API routes pass through as-is (they exist at root level)
    const isPassthrough =
      pathname.startsWith('/login') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/verify') ||
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/');
    if (isPassthrough) return null;

    const url = request.nextUrl.clone();
    const cleanPath = pathname.startsWith('/courses-app')
      ? pathname.slice('/courses-app'.length) || '/'
      : pathname;
    url.pathname = cleanPath === '/' ? '/courses-app' : `/courses-app${cleanPath}`;
    return NextResponse.rewrite(url);
  }

  // university.aorthar.com — root → /university marketing page; all other paths as-is
  if (
    hostname === 'university.aorthar.com' ||
    hostname === 'university.aorthar.com:3000'
  ) {
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/university';
      return NextResponse.rewrite(url);
    }
    // All other paths (dashboard, courses, login, etc.) pass through unchanged
    return null;
  }

  return null;
}

// ─────────────────────────────────────────────
// PROXY (Next.js 16 — replaces middleware)
// ─────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  // ── Subdomain routing (runs before auth checks) ──
  const subdomainRewrite = getSubdomainRewrite(request);
  if (subdomainRewrite) {
    // Apply Supabase cookie refresh on the rewritten response too
    // by letting it fall through with the rewritten URL
    // For simple rewrites we return early; auth is handled on the rewritten path
    return subdomainRewrite;
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { pathname } = request.nextUrl;

  // Skip Supabase auth check for public routes that aren't auth routes
  const needsAuthCheck = isAuthRoute(pathname) || !isPublicRoute(pathname);

  // Refresh session — gracefully handle missing/placeholder Supabase credentials
  let user = null;
  if (needsAuthCheck) {
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      // Supabase not configured yet — treat as unauthenticated
    }
  }

  // Redirect logged-in users away from auth pages
  if (user && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Require auth for all non-public routes
  if (!user && !isPublicRoute(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  let profile: {
    role: 'student' | 'contributor' | 'admin';
    department: string | null;
    onboarding_completed_at: string | null;
  } | null = null;

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, department, onboarding_completed_at')
      .eq('user_id', user.id)
      .maybeSingle();
    profile = data;
  }

  // Student onboarding gate
  if (user && profile?.role === 'student') {
    const done = Boolean(profile.department && profile.onboarding_completed_at);
    const isApiRoute = pathname.startsWith('/api/');

    if (!done && !isOnboardingRoute(pathname) && !isApiRoute && !isPublicRoute(pathname)) {
      return NextResponse.redirect(new URL(ONBOARDING_ROUTE, request.url));
    }

    if (done && isOnboardingRoute(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Admin route protection — disabled in development, enforced in staging + production
  if (process.env.NEXT_PUBLIC_APP_ENV !== 'development' && user && isAdminRoute(pathname)) {
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Premium route protection
  if (user && isPremiumRoute(pathname)) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!sub) {
      return NextResponse.redirect(new URL('/pricing', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
