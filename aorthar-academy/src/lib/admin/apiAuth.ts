import { createClient } from '@/lib/supabase/server';

export async function requireAdminApi(): Promise<{ userId: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_suspended')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profile?.is_suspended) {
    throw new Error('SUSPENDED');
  }

  if (!profile || profile.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  return { userId: user.id };
}

export function mapAdminApiError(error: unknown): { status: number; message: string } {
  const message = error instanceof Error ? error.message : 'Internal server error';

  if (message === 'UNAUTHORIZED') return { status: 401, message: 'Unauthorized' };
  if (message === 'SUSPENDED') return { status: 403, message: 'Account suspended' };
  if (message === 'FORBIDDEN') return { status: 403, message: 'Forbidden' };

  return { status: 500, message: 'Internal server error' };
}
