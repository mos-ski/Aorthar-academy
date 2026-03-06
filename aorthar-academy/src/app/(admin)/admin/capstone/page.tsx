import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import CapstoneReview from '@/components/capstone/CapstoneReview';
import { ExternalLink, Github } from 'lucide-react';

export default async function AdminCapstonePage() {
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from('capstone_submissions')
    .select('*, profiles!user_id(full_name)')
    .order('submitted_at', { ascending: true });

  const pending = submissions?.filter((s) => s.status === 'pending') ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Capstone Submissions ({pending.length} pending)</h2>

      <div className="space-y-4">
        {(submissions ?? []).map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{(s.profiles as { full_name: string })?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(s.submitted_at ?? s.created_at)}</p>
                </div>
                <Badge
                  variant={
                    s.status === 'approved' ? 'default' :
                    s.status === 'rejected' ? 'destructive' :
                    s.status === 'revision' ? 'secondary' : 'outline'
                  }
                >
                  {s.status}
                </Badge>
              </div>
              <p className="text-sm">{s.description}</p>
              <div className="flex gap-4 text-sm">
                <a href={s.github_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline">
                  <Github className="h-3 w-3" /> GitHub
                </a>
                <a href={s.live_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" /> Live URL
                </a>
              </div>
              <div className="flex flex-wrap gap-1">
                {(s.tech_stack ?? []).map((t: string) => (
                  <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                ))}
              </div>
              {s.status === 'pending' && <CapstoneReview capstoneId={s.id} />}
              {s.admin_notes && (
                <p className="text-xs text-muted-foreground bg-muted rounded p-2">
                  Notes: {s.admin_notes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
