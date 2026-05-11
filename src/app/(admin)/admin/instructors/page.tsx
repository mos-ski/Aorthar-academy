export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminApi } from '@/lib/admin/apiAuth';
import InstructorsClient from './InstructorsClient';

type Instructor = {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
};

export default async function InstructorsPage() {
  await requireAdminApi('content');
  const admin = createAdminClient();
  const { data } = await admin
    .from('bootcamp_instructors')
    .select('id, full_name, email, avatar_url, is_active, created_at')
    .order('full_name', { ascending: true });

  return <InstructorsClient instructors={(data ?? []) as Instructor[]} />;
}
