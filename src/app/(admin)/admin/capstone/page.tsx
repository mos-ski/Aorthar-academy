export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import CapstoneView from './_components/CapstoneView';
import { DEMO_CAPSTONES } from '@/lib/demo/adminSnapshot';
import { isDemoMode, isExplicitLiveMode } from '@/lib/demo/mode';
import type { ComponentProps } from 'react';

type ViewProps = ComponentProps<typeof CapstoneView>['submissions'];

export default async function AdminCapstonePage() {
  const supabase = await createClient();
  const demo = await isDemoMode();
  const explicitLive = await isExplicitLiveMode();

  const { data: submissions } = await supabase
    .from('capstone_submissions')
    .select('*, profiles!user_id(full_name)')
    .order('submitted_at', { ascending: true });

  const rows: ViewProps = (explicitLive || (!demo && (submissions ?? []).length > 0))
    ? (submissions as unknown as ViewProps)
    : (DEMO_CAPSTONES as unknown as ViewProps);

  const pending = rows.filter((s) => s.status === 'submitted').length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Capstone Submissions</h2>
        <p className="text-sm text-muted-foreground">
          {pending > 0 ? `${pending} pending review` : 'All reviewed'}
          {' · '}
          {rows.length} total
        </p>
      </div>

      <CapstoneView submissions={rows} />
    </div>
  );
}
