'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function CapstoneReview({ capstoneId }: { capstoneId: string }) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReview(status: 'approved' | 'rejected' | 'revision') {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('capstone_submissions')
      .update({
        status,
        admin_notes: notes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      })
      .eq('id', capstoneId);

    setLoading(false);
    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Capstone marked as ${status}`);
    }
  }

  return (
    <div className="space-y-3 pt-2 border-t">
      <div className="space-y-1">
        <Label className="text-xs">Admin Notes (optional)</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Leave feedback for the student..."
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => handleReview('approved')} disabled={loading}>
          Approve
        </Button>
        <Button size="sm" variant="secondary" onClick={() => handleReview('revision')} disabled={loading}>
          Request Revision
        </Button>
        <Button size="sm" variant="destructive" onClick={() => handleReview('rejected')} disabled={loading}>
          Reject
        </Button>
      </div>
    </div>
  );
}
