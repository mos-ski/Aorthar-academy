import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SuggestionForm from '@/components/admin/SuggestionForm';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/utils/formatters';

export default async function SuggestPage() {
  const { user } = await requireAuth();
  const supabase = await createClient();

  const { data: mySuggestions } = await supabase
    .from('suggestions')
    .select('*')
    .eq('proposer_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Suggest Content</h1>
        <p className="text-muted-foreground mt-1">
          Help grow Aorthar Academy by proposing new courses, lessons, or resources.
        </p>
      </div>

      <Tabs defaultValue="new">
        <TabsList>
          <TabsTrigger value="new">New Suggestion</TabsTrigger>
          <TabsTrigger value="history">My Suggestions</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="pt-4">
          <SuggestionForm />
        </TabsContent>
        <TabsContent value="history" className="pt-4 space-y-3">
          {(mySuggestions ?? []).length === 0 && (
            <p className="text-muted-foreground text-sm">No suggestions yet.</p>
          )}
          {(mySuggestions ?? []).map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium capitalize">{s.type} suggestion</p>
                  <p className="text-xs text-muted-foreground">{formatDate(s.created_at)}</p>
                  {s.admin_notes && <p className="text-xs text-muted-foreground mt-1">Note: {s.admin_notes}</p>}
                </div>
                <Badge
                  variant={s.status === 'approved' ? 'default' : s.status === 'rejected' ? 'destructive' : 'secondary'}
                >
                  {s.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
