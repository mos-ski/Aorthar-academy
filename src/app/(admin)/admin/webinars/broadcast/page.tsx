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

type BroadcastHistoryItem = {
  id: string;
  webinar_id: string;
  subject: string;
  body_html: string;
  recipient_count: number;
  sent_at: string;
};

export default async function WebinarBroadcastPage() {
  await requireRole('admin');
  const adminSupabase = createAdminClient();

  const [{ data: webinars }, { data: broadcasts }] = await Promise.all([
    adminSupabase
    .from('webinars')
    .select('id, title, scheduled_at')
    .order('scheduled_at', { ascending: false })
      .returns<WebinarOption[]>(),
    adminSupabase
      .from('webinar_broadcasts')
      .select('id, webinar_id, subject, body_html, recipient_count, sent_at')
      .order('sent_at', { ascending: false })
      .limit(20)
      .returns<BroadcastHistoryItem[]>(),
  ]);

  return <BroadcastClient webinars={webinars ?? []} initialBroadcasts={broadcasts ?? []} />;
}
