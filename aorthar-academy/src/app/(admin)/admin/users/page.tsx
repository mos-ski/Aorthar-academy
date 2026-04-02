export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UsersTable from './_components/UsersTable';

export default async function AdminUsersPage() {
  const admin = createAdminClient();

  const [{ data: profiles }, { data: standalonePurchases }] = await Promise.all([
    admin
      .from('profiles')
      .select('*, subscriptions(status)')
      .order('created_at', { ascending: false }),
    admin
      .from('standalone_purchases')
      .select('user_id, course_id, purchased_at, standalone_courses(title)')
      .order('purchased_at', { ascending: false }),
  ]);

  // Build a map: user_id -> standalone purchases
  const purchasesByUser = new Map<string, { course_id: string; purchased_at: string; standalone_courses: { title: string } | null }[]>();
  for (const p of (standalonePurchases ?? [])) {
    const list = purchasesByUser.get(p.user_id) ?? [];
    const course = Array.isArray(p.standalone_courses) ? p.standalone_courses[0] : null;
    list.push({
      course_id: p.course_id,
      purchased_at: p.purchased_at,
      standalone_courses: course ? { title: course.title } : null,
    });
    purchasesByUser.set(p.user_id, list);
  }

  // Merge: start with all profiles, then add buyers who have no profile
  type UserRow = {
    id: string;
    user_id: string;
    full_name: string | null;
    email: string | null;
    role: string;
    department: string | null;
    created_at: string;
    subscriptions: { status: string }[];
    standalone_purchases: { course_id: string; purchased_at: string; standalone_courses: { title: string } | null }[];
  };

  const rows: UserRow[] = (profiles ?? []).map((p) => ({
    ...p,
    standalone_purchases: purchasesByUser.get(p.user_id) ?? [],
  }));

  // Find buyers who don't have a profile row
  const profileUserIds = new Set((profiles ?? []).map((p) => p.user_id));
  for (const [userId, purchases] of purchasesByUser) {
    if (!profileUserIds.has(userId)) {
      // Fetch user from auth to get email
      const { data: { user } } = await admin.auth.admin.getUserById(userId);
      rows.push({
        id: userId,
        user_id: userId,
        full_name: user?.user_metadata?.full_name ?? null,
        email: user?.email ?? null,
        role: 'student',
        department: null,
        created_at: user?.created_at ?? '',
        subscriptions: [],
        standalone_purchases: purchases,
      });
    }
  }

  // Sort by most recent activity (created_at or latest purchase)
  rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const adminCount = rows.filter((u) => u.role === 'admin').length;
  const contributorCount = rows.filter((u) => u.role === 'contributor').length;
  const premiumCount = rows.filter(
    (u) => Array.isArray(u.subscriptions) && u.subscriptions.some((s: { status: string }) => s.status === 'active'),
  ).length;
  const purchaseCount = rows.filter(
    (u) => Array.isArray(u.standalone_purchases) && u.standalone_purchases.length > 0,
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Users</h2>
        <p className="text-sm text-muted-foreground">{rows.length} registered accounts</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Course Buyers</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{purchaseCount}</p></CardContent>
        </Card>
      </div>

      <UsersTable users={rows} />
    </div>
  );
}
