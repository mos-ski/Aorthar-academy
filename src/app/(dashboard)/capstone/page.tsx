import { createClient } from '@/lib/supabase/server';
import { requireAuth, checkPremiumAccess } from '@/lib/auth';
import CapstoneForm from '@/components/capstone/CapstoneForm';
import CapstoneStatus from '@/components/capstone/CapstoneStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export default async function CapstonePage() {
  const { user } = await requireAuth();
  const supabase = await createClient();
  const isPremium = await checkPremiumAccess(user.id);

  const { data: submission } = await supabase
    .from('capstone_submissions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!isPremium) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Capstone Project</h1>
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Capstone submission is a Premium feature. Upgrade to submit your final project.
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/pricing">View Premium Plans</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Capstone Project</h1>
        <p className="text-muted-foreground mt-1">
          Submit your final Year 400 project for review and graduation.
        </p>
      </div>
      {submission ? (
        <CapstoneStatus submission={submission} />
      ) : (
        <CapstoneForm />
      )}
    </div>
  );
}
