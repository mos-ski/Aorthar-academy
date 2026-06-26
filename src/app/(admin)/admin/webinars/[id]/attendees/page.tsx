export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';
import AttendeesClient from './AttendeesClient';

type Props = { params: Promise<{ id: string }> };

export default async function WebinarAttendeesPage({ params }: Props) {
  const { id } = await params;
  await requireRole('admin');

  const adminSupabase = createAdminClient();

  const { data: webinar } = await adminSupabase
    .from('webinars')
    .select('id, title, slug, scheduled_at')
    .eq('id', id)
    .single();

  if (!webinar) notFound();

  const { data: registrations } = await adminSupabase
    .from('webinar_registrations')
    .select('id, user_id, amount_paid_ngn, registered_at')
    .eq('webinar_id', id)
    .order('registered_at', { ascending: false });

  const rows = await Promise.all(
    (registrations ?? []).map(async (reg) => {
      const [{ data: userRecord }, { data: profile }] = await Promise.all([
        adminSupabase.auth.admin.getUserById(reg.user_id),
        adminSupabase.from('profiles').select('full_name').eq('user_id', reg.user_id).maybeSingle(),
      ]);

      return {
        id: reg.id,
        name: profile?.full_name ?? '—',
        email: userRecord?.user?.email ?? '—',
        amountPaidNgn: reg.amount_paid_ngn,
        registeredAt: reg.registered_at,
      };
    }),
  );

  return <AttendeesClient webinar={webinar} attendees={rows} />;
}
