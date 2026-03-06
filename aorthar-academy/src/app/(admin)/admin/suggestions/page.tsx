import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import SuggestionReview from '@/components/admin/SuggestionReview';

export default async function AdminSuggestionsPage() {
  const supabase = await createClient();

  const { data: suggestions } = await supabase
    .from('suggestions')
    .select('*, profiles!proposer_id(full_name)')
    .order('created_at', { ascending: false });

  const pending = suggestions?.filter((s) => s.status === 'pending') ?? [];
  const reviewed = suggestions?.filter((s) => s.status !== 'pending') ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Suggestions ({pending.length} pending)</h2>

      <div className="space-y-3">
        {pending.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium capitalize">{s.type} suggestion</p>
                  <p className="text-sm text-muted-foreground">
                    By {(s.profiles as { full_name: string })?.full_name} · {formatDate(s.created_at)}
                  </p>
                  <pre className="text-xs bg-muted rounded p-2 mt-2 overflow-x-auto">
                    {JSON.stringify(s.content, null, 2)}
                  </pre>
                </div>
                <Badge variant="secondary">pending</Badge>
              </div>
              <SuggestionReview suggestionId={s.id} />
            </CardContent>
          </Card>
        ))}

        {pending.length === 0 && (
          <p className="text-muted-foreground text-sm">No pending suggestions.</p>
        )}
      </div>

      <details>
        <summary className="cursor-pointer text-sm text-muted-foreground">
          Reviewed ({reviewed.length})
        </summary>
        <div className="space-y-2 mt-2">
          {reviewed.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex justify-between items-center p-4">
                <span className="text-sm capitalize">{s.type} · {formatDate(s.created_at)}</span>
                <Badge variant={s.status === 'approved' ? 'default' : 'destructive'}>{s.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </details>
    </div>
  );
}
