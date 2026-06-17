import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import SettingsClient from '@/components/settings/SettingsClient';

export default async function AdminProfilePage() {
  const { user, profile } = await requireAuth();
  const supabase = await createClient();

  const { data: freshProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <SettingsClient
      profile={freshProfile ?? profile}
      subscription={null}
      email={user.email ?? ''}
      userId={user.id}
      role="admin"
    />
  );
}
