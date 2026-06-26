export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import WebinarsAdmin from './WebinarsAdmin';

export const metadata = { title: 'Webinars — Admin' };

export default async function WebinarsAdminPage() {
  await requireRole('admin');

  const supabase = await createClient();

  const { data: webinars } = await supabase
    .from('webinars')
    .select('id, slug, title, scheduled_at, price_ngn, status, created_at')
    .order('scheduled_at', { ascending: false });

  const webinarIds = (webinars ?? []).map((w) => w.id);
  const { data: registrations } = await supabase
    .from('webinar_registrations')
    .select('webinar_id')
    .in('webinar_id', webinarIds.length ? webinarIds : ['00000000-0000-0000-0000-000000000000']);

  const registrationMap: Record<string, number> = {};
  (registrations ?? []).forEach((reg) => {
    registrationMap[reg.webinar_id] = (registrationMap[reg.webinar_id] ?? 0) + 1;
  });

  return (
    <WebinarsAdmin
      webinars={(webinars ?? []).map((w) => ({ ...w, registrationCount: registrationMap[w.id] ?? 0 }))}
    />
  );
}
