import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, CreditCard, FileQuestion, CheckSquare, Lightbulb } from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: totalCourses },
    { count: pendingSuggestions },
    { count: pendingCapstones },
    { count: activeSubscriptions },
    { count: totalTransactions },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('suggestions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('capstone_submissions').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'success'),
  ]);

  const stats = [
    { label: 'Total Users', value: totalUsers ?? 0, icon: Users, href: '/admin/users' },
    { label: 'Courses', value: totalCourses ?? 0, icon: BookOpen, href: '/admin/courses' },
    { label: 'Pending Suggestions', value: pendingSuggestions ?? 0, icon: Lightbulb, href: '/admin/suggestions', alert: (pendingSuggestions ?? 0) > 0 },
    { label: 'Capstones to Review', value: pendingCapstones ?? 0, icon: CheckSquare, href: '/admin/capstone', alert: (pendingCapstones ?? 0) > 0 },
    { label: 'Active Subscriptions', value: activeSubscriptions ?? 0, icon: CreditCard, href: '/admin/payments' },
    { label: 'Successful Payments', value: totalTransactions ?? 0, icon: FileQuestion, href: '/admin/payments' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Overview</h2>
        <p className="text-sm text-muted-foreground">Platform health at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href, alert }) => (
          <a key={label} href={href}>
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <div className="flex items-center gap-2">
                  {alert && <Badge variant="destructive" className="text-xs">Action needed</Badge>}
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{value.toLocaleString()}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
