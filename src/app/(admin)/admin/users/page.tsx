export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UsersTable from './_components/UsersTable';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string }>;
}) {
  const { module: moduleParam } = await searchParams;
  const admin = createAdminClient();

  const [
    { data: profiles },
    { data: standalonePurchases },
    { data: allStandaloneCourses },
    { data: progressRows },
    { data: lessonCounts },
  ] = await Promise.all([
    admin
      .from('profiles')
      .select('*, subscriptions(status)')
      .order('created_at', { ascending: false }),
    admin
      .from('standalone_purchases')
      .select('user_id, course_id, purchased_at')
      .order('purchased_at', { ascending: false }),
    // Separate query for course titles — avoids FK schema-cache issues
    admin.from('standalone_courses').select('id, title'),
    // Standalone lesson progress for progress bar
    admin
      .from('standalone_lesson_progress')
      .select('user_id, lesson_id'),
    // All published standalone lessons (to compute total per course)
    admin
      .from('standalone_lessons')
      .select('id, course_id')
      .eq('is_published', true),
  ]);

  // course_id -> title
  const courseMap = new Map<string, string>(
    (allStandaloneCourses ?? []).map((c) => [c.id, c.title]),
  );

  // lesson_id -> course_id
  const lessonCourseMap = new Map<string, string>(
    (lessonCounts ?? []).map((l) => [l.id, l.course_id]),
  );

  // course_id -> total lessons
  const totalLessonsPerCourse = new Map<string, number>();
  for (const l of (lessonCounts ?? [])) {
    totalLessonsPerCourse.set(l.course_id, (totalLessonsPerCourse.get(l.course_id) ?? 0) + 1);
  }

  // (userId::courseId) -> completed count
  const completedMap = new Map<string, number>();
  for (const p of (progressRows ?? [])) {
    const courseId = lessonCourseMap.get(p.lesson_id);
    if (courseId) {
      const key = `${p.user_id}::${courseId}`;
      completedMap.set(key, (completedMap.get(key) ?? 0) + 1);
    }
  }

  // user_id -> purchases with resolved titles + progress
  const purchasesByUser = new Map<
    string,
    { course_id: string; purchased_at: string; course_title: string; progress_pct: number }[]
  >();
  for (const p of (standalonePurchases ?? [])) {
    const list = purchasesByUser.get(p.user_id) ?? [];
    const title = courseMap.get(p.course_id) ?? 'Bootcamp';
    const total = totalLessonsPerCourse.get(p.course_id) ?? 0;
    const completed = completedMap.get(`${p.user_id}::${p.course_id}`) ?? 0;
    const progress_pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    list.push({ course_id: p.course_id, purchased_at: p.purchased_at, course_title: title, progress_pct });
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
    standalone_purchases: { course_id: string; purchased_at: string; course_title: string; progress_pct: number }[];
  };

  const rows: UserRow[] = (profiles ?? []).map((p) => ({
    ...p,
    standalone_purchases: purchasesByUser.get(p.user_id) ?? [],
  }));

  // Find buyers who don't have a profile row
  const profileUserIds = new Set((profiles ?? []).map((p) => p.user_id));
  for (const [userId, purchases] of purchasesByUser) {
    if (!profileUserIds.has(userId)) {
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

  rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Filter based on module
  const isBootcamp = moduleParam === 'courses';
  const isUniversity = moduleParam === 'university';

  const displayRows = isBootcamp
    ? rows.filter((u) => u.standalone_purchases.length > 0)
    : isUniversity
    ? rows.filter((u) => Array.isArray(u.subscriptions) && u.subscriptions.some((s) => s.status === 'active'))
    : rows;

  const adminCount = rows.filter((u) => u.role === 'admin').length;
  const contributorCount = rows.filter((u) => u.role === 'contributor').length;
  const premiumCount = rows.filter(
    (u) => Array.isArray(u.subscriptions) && u.subscriptions.some((s: { status: string }) => s.status === 'active'),
  ).length;
  const purchaseCount = rows.filter(
    (u) => u.standalone_purchases.length > 0,
  ).length;

  const title = isBootcamp ? 'Bootcamp Students' : isUniversity ? 'University Students' : 'All Users';
  const subtitle = isBootcamp
    ? `${displayRows.length} students with bootcamp access`
    : isUniversity
    ? `${displayRows.length} active university subscribers`
    : `${rows.length} registered accounts`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {!isBootcamp && !isUniversity && (
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Bootcamp Buyers</CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{purchaseCount}</p></CardContent>
          </Card>
        </div>
      )}

      {isBootcamp && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{displayRows.length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Bootcamps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {displayRows.length > 0
                  ? (displayRows.reduce((s, u) => s + u.standalone_purchases.length, 0) / displayRows.length).toFixed(1)
                  : '0'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {(() => {
                  const allPurchases = displayRows.flatMap((u) => u.standalone_purchases);
                  if (allPurchases.length === 0) return '0%';
                  const avg = allPurchases.reduce((s, p) => s + p.progress_pct, 0) / allPurchases.length;
                  return `${Math.round(avg)}%`;
                })()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {isUniversity && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscribers</CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{displayRows.length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">All Registered</CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{rows.length}</p></CardContent>
          </Card>
        </div>
      )}

      <UsersTable users={displayRows} module={moduleParam ?? 'all'} />
    </div>
  );
}
