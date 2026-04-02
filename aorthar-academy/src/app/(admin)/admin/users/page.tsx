export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UsersTable from './_components/UsersTable';

export default async function AdminUsersPage() {
  const admin = createAdminClient();

  const { data: users } = await admin
    .from('profiles')
    .select('*, subscriptions(status)')
    .order('created_at', { ascending: false });

  const rows = users ?? [];

  const adminCount = rows.filter((u) => u.role === 'admin').length;
  const contributorCount = rows.filter((u) => u.role === 'contributor').length;
  const premiumCount = rows.filter(
    (u) => Array.isArray(u.subscriptions) && u.subscriptions.some((s: { status: string }) => s.status === 'active'),
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Users</h2>
        <p className="text-sm text-muted-foreground">{rows.length} registered accounts</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{adminCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contributors</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{contributorCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Premium</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{premiumCount}</p></CardContent>
        </Card>
      </div>

      <UsersTable users={rows} />
    </div>
  );
}
