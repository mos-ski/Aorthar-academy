import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/utils/formatters';
import { getDemoStudentSnapshot } from '@/lib/demo/studentSnapshot';

export default async function SettingsPage() {
  await requireAuth();
  const supabase = await createClient();
  const demo = getDemoStudentSnapshot();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .maybeSingle();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, plans(name, billing_type)')
    .eq('user_id', user?.id ?? '')
    .eq('status', 'active')
    .maybeSingle();

  const shouldUseDemo = !profile && !subscription;
  const shownProfile = profile ?? demo.profile;
  const shownSubscription = subscription ?? demo.subscription;
  const userName = shownProfile?.full_name ?? user?.email?.split('@')[0] ?? 'Student';
  const userEmail = user?.email ?? 'student@aorthar.academy';

  return (
    <div className="space-y-6 max-w-2xl">
      {shouldUseDemo && (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Demo Mode: account data is unavailable, showing preview
        </Badge>
      )}
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{userName}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{userEmail}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Role</span>
            <Badge variant="secondary" className="capitalize">{shownProfile?.role ?? 'student'}</Badge>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Joined</span>
            <span>{formatDate(shownProfile?.created_at)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {shownSubscription ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">
                  {(shownSubscription.plans as { name: string; billing_type: string } | null)?.name ?? 'Premium'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="default">Active</Badge>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Started</span>
                <span>{formatDate(shownSubscription.start_date)}</span>
              </div>
              {shownSubscription.end_date && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Renews / Expires</span>
                    <span>{formatDate(shownSubscription.end_date)}</span>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-4 space-y-2">
              <p className="text-sm text-muted-foreground">You are on the free plan.</p>
              <a
                href="/pricing"
                className="inline-block text-sm font-medium text-primary underline underline-offset-4"
              >
                Upgrade to Premium
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">User ID</span>
            <span className="font-mono text-xs">{user?.id}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email confirmed</span>
            <span>{user?.email_confirmed_at ? 'Yes' : 'No'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
