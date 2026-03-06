import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminUserActions from '@/components/admin/AdminUserActions';

const ROLE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  admin: 'destructive',
  contributor: 'default',
  student: 'secondary',
};

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
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
      <h2 className="text-xl font-semibold">Users ({rows.length})</h2>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Admins</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{adminCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Contributors</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{contributorCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Premium</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{premiumCount}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((user) => {
                const isPremium =
                  Array.isArray(user.subscriptions) &&
                  user.subscriptions.some((s: { status: string }) => s.status === 'active');
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{user.full_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{user.email ?? '—'}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ROLE_VARIANT[user.role] ?? 'secondary'}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{user.department ?? '—'}</TableCell>
                    <TableCell>
                      {isPremium
                        ? <Badge variant="default">Premium</Badge>
                        : <span className="text-xs text-muted-foreground">Free</span>}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <AdminUserActions userId={user.user_id} currentRole={user.role} isPremium={isPremium} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No users yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
