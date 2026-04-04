import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getPermissionForPath, hasAdminPermission, normalizeAdminLevel } from '@/lib/admin/permissions';
import { getProductFromHost } from '@/lib/urls';

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
  '/unauthorized',
  '/suspended',
  '/verify',
  '/forgot-password',
  '/reset-password',
  // public API routes (no auth required)
  '/api/auth/forgot-password',
  '/api/auth/send-welcome',
  '/api/auth/callback',
  // courses-app / bootcamp public routes
  '/courses-app',
];
const AUTH_ROUTES = ['/login', '/register', '/verify'];
const PREMIUM_ROUTES = ['/courses/400', '/transcript/export', '/mentorship', '/capstone'];
const ADMIN_ROUTES = ['/admin'];
const ONBOARDING_ROUTE = '/onboarding';
const SUSPENDED_ROUTE = '/suspended';

// ─────────────────────────────────────────────
// SUBDOMAIN CONFIG
// ─────────────────────────────────────────────

/** Products that skip the university onboarding gate */
const SKIP_ONBOARDING_PRODUCTS = ['bootcamp', 'internship', 'admin', 'base'] as const;

/** Auth routes that should pass through on every subdomain */
const AUTH_PASSTHROUGH_PREFIXES = [
  '/login',
  '/register',
  '/verify',
  '/forgot-password',
  '/reset-password',
  '/api/',
  '/_next/',
] as const;

function isAuthPassthrough(pathname: string): boolean {
  return AUTH_PASSTHROUGH_PREFIXES.some((p) => pathname.startsWith(p));
}

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

function isSuspendedRoute(pathname: string): boolean {
  return pathname === SUSPENDED_ROUTE || pathname.startsWith(`${SUSPENDED_ROUTE}/`);
}

// ─────────────────────────────────────────────
// SUBDOMAIN REWRITE
// ─────────────────────────────────────────────

function getSubdomainRewrite(request: NextRequest): NextResponse | null {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const product = getProductFromHost(hostname);

  // bootcamp.aorthar.com (and legacy courses.aorthar.com) → /courses-app/*
  if (product === 'bootcamp') {
    if (isAuthPassthrough(pathname)) return null;
    const url = request.nextUrl.clone();
    const cleanPath = pathname.startsWith('/courses-app')
      ? pathname.slice('/courses-app'.length) || '/'
      : pathname;
    url.pathname = cleanPath === '/' ? '/courses-app' : `/courses-app${cleanPath}`;
    return NextResponse.rewrite(url);
  }

  // university.aorthar.com → / serves marketing landing page; other paths pass through
  if (product === 'university') {
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/university';
      return NextResponse.rewrite(url);
    }
    return null;
  }

  // internship.aorthar.com → /internship/*
  if (product === 'internship') {
    if (isAuthPassthrough(pathname)) return null;
    const url = request.nextUrl.clone();
    const cleanPath = pathname.startsWith('/internship')
      ? pathname.slice('/internship'.length) || '/'
      : pathname;
    url.pathname = cleanPath === '/' ? '/internship' : `/internship${cleanPath}`;
    return NextResponse.rewrite(url);
  }

  // admin.aorthar.com → /admin/*
  if (product === 'admin') {
    if (isAuthPassthrough(pathname)) return null;
    // Let /settings pass through to the dashboard settings page
    if (pathname === '/settings' || pathname.startsWith('/settings/')) return null;
    const url = request.nextUrl.clone();
    const cleanPath = pathname.startsWith('/admin')
      ? pathname.slice('/admin'.length) || '/'
      : pathname;
    url.pathname = cleanPath === '/' ? '/admin' : `/admin${cleanPath}`;
    return NextResponse.rewrite(url);
  }

  // aorthar.com (base/marketing) — no rewrite needed
  return null;
}

// ─────────────────────────────────────────────
// MIDDLEWARE (Next.js 16)
// ─────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  // ── Subdomain routing (runs before auth checks) ──
  const subdomainRewrite = getSubdomainRewrite(request);
  if (subdomainRewrite) {
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

  // ── Determine product context from hostname ──
  const hostname = request.headers.get('host') ?? '';
  const product = getProductFromHost(hostname);
  const isBootcampSubdomain = product === 'bootcamp';
  const skipOnboarding = product !== null && (SKIP_ONBOARDING_PRODUCTS as readonly string[]).includes(product);

  // Redirect logged-in users away from auth pages
  if (user && isAuthRoute(pathname)) {
    const nextParam = request.nextUrl.searchParams.get('next');
    // On bootcamp subdomain: honour ?next param, otherwise go to learn
    if (isBootcampSubdomain) {
      const dest = nextParam ?? '/courses-app/learn';
      return NextResponse.redirect(new URL(dest, request.url));
    }
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
    admin_level: 'super_admin' | 'content_admin' | 'finance_admin' | null;
    department: string | null;
    onboarding_completed_at: string | null;
    is_suspended: boolean;
  } | null = null;

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, admin_level, department, onboarding_completed_at, is_suspended')
      .eq('user_id', user.id)
      .maybeSingle();
    profile = data;
  }

  // Suspended account guard
  if (user && profile?.is_suspended) {
    const isApiRoute = pathname.startsWith('/api/');

    if (isApiRoute) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
    }

    if (!isSuspendedRoute(pathname) && !isAuthRoute(pathname)) {
      return NextResponse.redirect(new URL(SUSPENDED_ROUTE, request.url));
    }
  }

  if (user && !profile?.is_suspended && isSuspendedRoute(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Student onboarding gate — skip on bootcamp, internship, admin, and base subdomains
  if (user && profile?.role === 'student' && !skipOnboarding) {
    const done = Boolean(profile.department && profile.onboarding_completed_at);
    const isApiRoute = pathname.startsWith('/api/');

    if (!done && !isOnboardingRoute(pathname) && !isApiRoute && !isPublicRoute(pathname)) {
      return NextResponse.redirect(new URL(ONBOARDING_ROUTE, request.url));
    }

    if (done && isOnboardingRoute(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Admin route protection
  if (user && isAdminRoute(pathname)) {
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    const requiredPermission = getPermissionForPath(pathname);
    const adminLevel = normalizeAdminLevel(profile?.admin_level ?? null);
    if (requiredPermission && !hasAdminPermission(adminLevel, requiredPermission)) {
      const isApiRoute = pathname.startsWith('/api/');
      if (isApiRoute) {
        return NextResponse.json({ error: 'Permission denied for this action' }, { status: 403 });
      }
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
