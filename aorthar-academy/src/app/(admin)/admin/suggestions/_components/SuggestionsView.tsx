'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SuggestionReview from '@/components/admin/SuggestionReview';
import { formatDate } from '@/utils/formatters';
import { Lightbulb, CheckCircle2, XCircle, Clock } from 'lucide-react';

type Suggestion = {
  id: string;
  type: string;
  status: string;
  content: Record<string, unknown>;
  created_at: string;
  profiles: { full_name: string } | null;
};

interface Props {
  suggestions: Suggestion[];
}

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'] as const;
type Tab = typeof STATUS_TABS[number];

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5" />,
  approved: <CheckCircle2 className="h-3.5 w-3.5" />,
  rejected: <XCircle className="h-3.5 w-3.5" />,
};

const STATUS_VARIANT: Record<string, 'secondary' | 'default' | 'destructive'> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
};

export default function SuggestionsView({ suggestions }: Props) {
  const [tab, setTab] = useState<Tab>('pending');

  const filtered = tab === 'all' ? suggestions : suggestions.filter((s) => s.status === tab);
  const pendingCount = suggestions.filter((s) => s.status === 'pending').length;

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 border-b pb-0">
        {STATUS_TABS.map((t) => {
          const count = t === 'all' ? suggestions.length : suggestions.filter((s) => s.status === t).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors -mb-px ${
                tab === t
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t} <span className="ml-1 text-xs opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Lightbulb className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="font-medium text-sm">No {tab === 'all' ? '' : tab} suggestions</p>
          <p className="text-xs text-muted-foreground mt-1">
            {tab === 'pending' ? 'All caught up — no pending reviews.' : `Nothing here yet.`}
          </p>
        </div>
      )}

      {/* Suggestion cards */}
      <div className="space-y-3">
        {filtered.map((s) => {
          const isPending = s.status === 'pending';
          const content = s.content as Record<string, unknown>;
          return (
            <Card key={s.id} className={isPending ? 'border-amber-200 dark:border-amber-800' : ''}>
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm capitalize">{s.type} suggestion</span>
                      <Badge variant={STATUS_VARIANT[s.status] ?? 'secondary'} className="gap-1 text-xs">
                        {STATUS_ICON[s.status]}
                        {s.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      By {s.profiles?.full_name ?? 'Unknown'} · {formatDate(s.created_at)}
                    </p>
                  </div>
                </div>

                {/* Content fields — readable key-value pairs */}
                <div className="space-y-1 rounded-md bg-muted/50 p-3">
                  {Object.entries(content).map(([key, val]) => (
                    <div key={key} className="flex gap-2 text-sm">
                      <span className="text-muted-foreground capitalize shrink-0 w-28 text-xs pt-0.5">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm break-words flex-1">
                        {typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean'
                          ? String(val)
                          : JSON.stringify(val)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Review actions (pending only) */}
                {isPending && <SuggestionReview suggestionId={s.id} />}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
