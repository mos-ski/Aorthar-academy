'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import CapstoneReview from '@/components/capstone/CapstoneReview';
import { formatDate } from '@/utils/formatters';
import { CheckSquare, Github, ExternalLink, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';

type Submission = {
  id: string;
  status: string;
  description: string;
  github_url: string;
  live_url: string;
  tech_stack: string[];
  submitted_at: string | null;
  created_at: string;
  admin_notes: string | null;
  profiles: { full_name: string } | null;
};

interface Props {
  submissions: Submission[];
}

const STATUS_TABS = ['all', 'submitted', 'approved', 'revision', 'rejected'] as const;
type Tab = typeof STATUS_TABS[number];

const STATUS_VARIANT: Record<string, 'outline' | 'default' | 'destructive' | 'secondary'> = {
  submitted: 'outline',
  approved: 'default',
  rejected: 'destructive',
  revision: 'secondary',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  submitted: <Clock className="h-3.5 w-3.5" />,
  approved: <CheckCircle2 className="h-3.5 w-3.5" />,
  rejected: <XCircle className="h-3.5 w-3.5" />,
  revision: <RefreshCw className="h-3.5 w-3.5" />,
};

export default function CapstoneView({ submissions }: Props) {
  const [tab, setTab] = useState<Tab>('submitted');

  const filtered = tab === 'all' ? submissions : submissions.filter((s) => s.status === tab);

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 border-b overflow-x-auto">
        {STATUS_TABS.map((t) => {
          const count = t === 'all' ? submissions.length : submissions.filter((s) => s.status === t).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors -mb-px whitespace-nowrap ${
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
          <CheckSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="font-medium text-sm">No {tab === 'all' ? '' : tab} submissions</p>
          <p className="text-xs text-muted-foreground mt-1">
            {tab === 'submitted' ? "All caught up — no pending capstones to review." : "Nothing here yet."}
          </p>
        </div>
      )}

      {/* Submission cards */}
      <div className="space-y-4">
        {filtered.map((s) => (
          <Card key={s.id} className={s.status === 'submitted' ? 'border-amber-200 dark:border-amber-800' : ''}>
            <CardContent className="p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{s.profiles?.full_name ?? 'Unknown Student'}</p>
                  <p className="text-xs text-muted-foreground">
                    Submitted {formatDate(s.submitted_at ?? s.created_at)}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[s.status] ?? 'outline'} className="gap-1 shrink-0">
                  {STATUS_ICON[s.status]}
                  {s.status}
                </Badge>
              </div>

              {/* Description */}
              {s.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              )}

              {/* Links */}
              <div className="flex gap-4">
                {s.github_url && (
                  <a
                    href={s.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                )}
                {s.live_url && (
                  <a
                    href={s.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" /> Live Demo
                  </a>
                )}
              </div>

              {/* Tech stack */}
              {(s.tech_stack ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {s.tech_stack.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                  ))}
                </div>
              )}

              {/* Admin notes (reviewed) */}
              {s.admin_notes && (
                <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                  <span className="font-medium">Admin notes:</span> {s.admin_notes}
                </div>
              )}

              {/* Review actions (submitted only) */}
              {s.status === 'submitted' && <CapstoneReview capstoneId={s.id} />}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
