export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import WebinarEditor from './WebinarEditor';

type Props = { params: Promise<{ id: string }> };

export default async function WebinarEditPage({ params }: Props) {
  const { id } = await params;
  await requireRole('admin');

  const supabase = await createClient();

  const { data: webinar } = await supabase
    .from('webinars')
    .select('*')
    .eq('id', id)
    .single();

  if (!webinar) notFound();

  const { count: registrationCount } = await supabase
    .from('webinar_registrations')
    .select('id', { count: 'exact', head: true })
    .eq('webinar_id', id);

  return <WebinarEditor webinar={webinar} registrationCount={registrationCount ?? 0} />;
}
