import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Role } from '@/types';

// ─────────────────────────────────────────────
// AUTH HELPERS — server-side only
// ─────────────────────────────────────────────

/**
 * Get the current authenticated user session.
 * Returns null if unauthenticated.
 */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Get the current user's full profile.
 * Redirects to /login if unauthenticated.
 */
export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return { user, profile };
}

/**
 * Require a specific role. Redirects to /unauthorized if role mismatch.
 */
export async function requireRole(requiredRole: Role) {
  const { user, profile } = await requireAuth();

  if (!profile || profile.role !== requiredRole) {
    redirect('/unauthorized');
  }

  return { user, profile };
}

/**
 * Check if a user has an active premium subscription.
 */
export async function checkPremiumAccess(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  return !!data;
}

/**
 * Get user's subscription status string.
 */
export async function getSubscriptionStatus(
  userId: string,
): Promise<'free' | 'active' | 'expired' | 'cancelled'> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return 'free';
  return data.status;
}
