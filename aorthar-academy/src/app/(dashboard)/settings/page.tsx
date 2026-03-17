import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import SettingsClient from '@/components/settings/SettingsClient';

export default async function SettingsPage() {
  const { user } = await requireAuth();
  const supabase = await createClient();

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('subscriptions')
      .select('start_date, end_date, plans(name, billing_type)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle(),
  ]);

  return (
    <SettingsClient
      profile={profile}
      subscription={subscription as { start_date: string; end_date: string | null; plans: { name: string; billing_type: string } | null } | null}
      email={user.email ?? ''}
      userId={user.id}
    />
  );
}
