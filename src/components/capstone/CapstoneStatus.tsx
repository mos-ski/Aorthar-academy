import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/utils/formatters';
import type { CapstoneSubmission } from '@/types';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-yellow-500', label: 'Under Review' },
  revision: { icon: AlertCircle, color: 'text-orange-500', label: 'Revision Required' },
  approved: { icon: CheckCircle, color: 'text-green-500', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-500', label: 'Rejected' },
  draft: { icon: Clock, color: 'text-muted-foreground', label: 'Draft' },
  locked: { icon: Clock, color: 'text-muted-foreground', label: 'Locked' },
  available: { icon: Clock, color: 'text-muted-foreground', label: 'Available' },
};

export default function CapstoneStatus({ submission }: { submission: CapstoneSubmission }) {
  const config = STATUS_CONFIG[submission.status];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config.color}`} />
          Capstone Status: {config.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Submitted</p>
            <p className="font-medium">{submission.submitted_at ? formatDate(submission.submitted_at) : '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Reviewed</p>
            <p className="font-medium">{submission.reviewed_at ? formatDate(submission.reviewed_at) : 'Pending'}</p>
          </div>
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground mb-1">GitHub</p>
          <a href={submission.github_url} target="_blank" rel="noopener noreferrer"
            className="text-primary hover:underline break-all">{submission.github_url}</a>
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground mb-1">Live URL</p>
          <a href={submission.live_url} target="_blank" rel="noopener noreferrer"
            className="text-primary hover:underline break-all">{submission.live_url}</a>
        </div>

        {submission.admin_notes && (
          <div className="bg-muted rounded p-3 text-sm">
            <p className="font-medium mb-1">Admin Notes:</p>
            <p>{submission.admin_notes}</p>
          </div>
        )}

        {submission.status === 'approved' && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded p-4 text-center">
            <p className="text-green-700 dark:text-green-300 font-semibold">
              Congratulations! Your capstone has been approved. You are eligible for graduation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
