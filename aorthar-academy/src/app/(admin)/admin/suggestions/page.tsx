import { createClient } from '@/lib/supabase/server';
import SuggestionsView from './_components/SuggestionsView';
import { DEMO_SUGGESTIONS } from '@/lib/demo/adminSnapshot';
import { isDemoMode, isExplicitLiveMode } from '@/lib/demo/mode';
import type { ComponentProps } from 'react';

type ViewProps = ComponentProps<typeof SuggestionsView>['suggestions'];

export default async function AdminSuggestionsPage() {
  const supabase = await createClient();
  const demo = await isDemoMode();
  const explicitLive = await isExplicitLiveMode();

  const { data: suggestions } = await supabase
    .from('suggestions')
    .select('*, profiles!proposer_id(full_name)')
    .order('created_at', { ascending: false });

  const rows: ViewProps = (explicitLive || (!demo && (suggestions ?? []).length > 0))
    ? (suggestions as unknown as ViewProps)
    : (DEMO_SUGGESTIONS as unknown as ViewProps);

  const pending = rows.filter((s) => s.status === 'pending').length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Suggestions</h2>
        <p className="text-sm text-muted-foreground">
          {pending > 0 ? `${pending} pending review` : 'All caught up'}
          {' · '}
          {rows.length} total
        </p>
      </div>

      <SuggestionsView suggestions={rows} />
    </div>
  );
}
