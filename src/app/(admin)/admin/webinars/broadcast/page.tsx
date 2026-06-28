export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';
import BroadcastClient from './BroadcastClient';

export const metadata = { title: 'Webinar Broadcast — Admin' };

type WebinarOption = {
  id: string;
  title: string;
  scheduled_at: string;
};

export default async function WebinarBroadcastPage() {
  await requireRole('admin');
  const adminSupabase = createAdminClient();

  const { data: webinars } = await adminSupabase
    .from('webinars')
    .select('id, title, scheduled_at')
    .order('scheduled_at', { ascending: false })
    .returns<WebinarOption[]>();

  return <BroadcastClient webinars={webinars ?? []} />;
}
