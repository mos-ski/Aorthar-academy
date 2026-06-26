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
    .select('id, user_id, first_name, last_name, email, whatsapp_number, amount_paid_ngn, registered_at, attended_at, wants_whatsapp_community')
    .eq('webinar_id', id)
    .order('registered_at', { ascending: false });

  const rows = await Promise.all(
    (registrations ?? []).map(async (reg) => {
      const [{ data: userRecord }, { data: profile }] = reg.user_id
        ? await Promise.all([
          adminSupabase.auth.admin.getUserById(reg.user_id),
          adminSupabase.from('profiles').select('full_name').eq('user_id', reg.user_id).maybeSingle(),
        ])
        : [{ data: null }, { data: null }];

      const publicName = `${reg.first_name ?? ''} ${reg.last_name ?? ''}`.trim();

      return {
        id: reg.id,
        name: publicName || profile?.full_name || '—',
        email: reg.email || userRecord?.user?.email || '—',
        whatsappNumber: reg.whatsapp_number || '—',
        wantsWhatsappCommunity: Boolean(reg.wants_whatsapp_community),
        amountPaidNgn: reg.amount_paid_ngn,
        registeredAt: reg.registered_at,
        attendedAt: reg.attended_at,
      };
    }),
  );

  return <AttendeesClient webinar={webinar} attendees={rows} />;
}
