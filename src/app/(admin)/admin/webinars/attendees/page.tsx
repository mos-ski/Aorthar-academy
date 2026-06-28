export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';
import AttendeesOverviewClient from './AttendeesOverviewClient';

export const metadata = { title: 'Webinar Attendees — Admin' };

type RegistrationRow = {
  id: string;
  webinar_id: string;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  whatsapp_number: string | null;
  wants_whatsapp_community: boolean | null;
  amount_paid_ngn: number;
  registered_at: string;
  attended_at: string | null;
  webinars: { title: string; slug: string } | { title: string; slug: string }[] | null;
};

export default async function WebinarAttendeesOverviewPage() {
  await requireRole('admin');
  const adminSupabase = createAdminClient();

  const { data: registrations } = await adminSupabase
    .from('webinar_registrations')
    .select('id, webinar_id, user_id, first_name, last_name, email, whatsapp_number, wants_whatsapp_community, amount_paid_ngn, registered_at, attended_at, webinars(title, slug)')
    .order('registered_at', { ascending: false })
    .returns<RegistrationRow[]>();

  const rows = await Promise.all(
    (registrations ?? []).map(async (reg) => {
      const [{ data: userRecord }, { data: profile }] = reg.user_id
        ? await Promise.all([
          adminSupabase.auth.admin.getUserById(reg.user_id),
          adminSupabase.from('profiles').select('full_name').eq('user_id', reg.user_id).maybeSingle(),
        ])
        : [{ data: null }, { data: null }];

      const webinar = Array.isArray(reg.webinars) ? reg.webinars[0] : reg.webinars;
      const publicName = `${reg.first_name ?? ''} ${reg.last_name ?? ''}`.trim();

      return {
        id: reg.id,
        webinarId: reg.webinar_id,
        webinarTitle: webinar?.title ?? 'Untitled webinar',
        webinarSlug: webinar?.slug ?? '',
        name: publicName || profile?.full_name || '-',
        email: reg.email || userRecord?.user?.email || '-',
        whatsappNumber: reg.whatsapp_number || '-',
        wantsWhatsappCommunity: Boolean(reg.wants_whatsapp_community),
        amountPaidNgn: reg.amount_paid_ngn,
        registeredAt: reg.registered_at,
        attendedAt: reg.attended_at,
      };
    }),
  );

  return <AttendeesOverviewClient attendees={rows} />;
}
