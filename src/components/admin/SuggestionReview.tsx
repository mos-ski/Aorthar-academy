'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function SuggestionReview({ suggestionId }: { suggestionId: string }) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReview(status: 'approved' | 'rejected') {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('suggestions')
      .update({
        status,
        admin_notes: notes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      })
      .eq('id', suggestionId);

    setLoading(false);
    if (error) {
      toast.error('Failed to update suggestion');
    } else {
      toast.success(`Suggestion ${status}`);
    }
  }

  return (
    <div className="space-y-2 pt-2 border-t">
      <div>
        <Label className="text-xs">Notes (optional)</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Reason for rejection or notes for the proposer..."
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => handleReview('approved')} disabled={loading}>Approve</Button>
        <Button size="sm" variant="destructive" onClick={() => handleReview('rejected')} disabled={loading}>Reject</Button>
      </div>
    </div>
  );
}
