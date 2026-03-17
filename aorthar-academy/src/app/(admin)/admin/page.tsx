import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, BookOpen, CreditCard, Lightbulb, CheckSquare,
  TrendingUp, ArrowRight, AlertTriangle, Layers, Building2,
} from 'lucide-react';
import Link from 'next/link';
import { DEMO_OVERVIEW } from '@/lib/demo/adminSnapshot';
import { isDemoMode, isExplicitLiveMode } from '@/lib/demo/mode';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const demo = await isDemoMode();
  const explicitLive = await isExplicitLiveMode();

  const [
    { count: _totalUsers },
    { count: _totalCourses },
    { count: _pendingSuggestions },
    { count: _pendingCapstones },
    { count: _activeSubscriptions },
    { count: _totalTransactions },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('suggestions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('capstone_submissions').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'success'),
  ]);

  // Fall back to demo data when DB is empty or demo mode is forced
  const isLive = explicitLive || (!demo && ((_totalUsers ?? 0) > 0 || (_totalCourses ?? 0) > 0));
  const totalUsers = isLive ? (_totalUsers ?? 0) : DEMO_OVERVIEW.totalUsers;
  const totalCourses = isLive ? (_totalCourses ?? 0) : DEMO_OVERVIEW.totalCourses;
  const pendingSuggestions = isLive ? (_pendingSuggestions ?? 0) : DEMO_OVERVIEW.pendingSuggestions;
  const pendingCapstones = isLive ? (_pendingCapstones ?? 0) : DEMO_OVERVIEW.pendingCapstones;
  const activeSubscriptions = isLive ? (_activeSubscriptions ?? 0) : DEMO_OVERVIEW.activeSubscriptions;
  const totalTransactions = isLive ? (_totalTransactions ?? 0) : DEMO_OVERVIEW.totalTransactions;

  const hasPendingActions = pendingSuggestions > 0 || pendingCapstones > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Overview</h2>
          <p className="text-sm text-muted-foreground">Platform health at a glance</p>
        </div>
        {!isLive && <Badge variant="outline" className="text-xs text-muted-foreground">Demo data</Badge>}
      </div>

      {/* Action alerts */}
      {hasPendingActions && (
        <div className="flex flex-col sm:flex-row gap-2">
          {pendingSuggestions > 0 && (
            <Link href="/admin/suggestions" className="flex-1">
              <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="flex-1 text-sm font-medium text-amber-800 dark:text-amber-300">
                  {pendingSuggestions} suggestion{pendingSuggestions > 1 ? 's' : ''} awaiting review
                </p>
                <ArrowRight className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              </div>
            </Link>
          )}
          {pendingCapstones > 0 && (
            <Link href="/admin/capstone" className="flex-1">
              <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="flex-1 text-sm font-medium text-amber-800 dark:text-amber-300">
                  {pendingCapstones} capstone{pendingCapstones > 1 ? 's' : ''} awaiting review
                </p>
                <ArrowRight className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/users">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalUsers.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">registered accounts</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/courses">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalCourses.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">published + draft</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/payments">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activeSubscriptions.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">premium students</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/payments">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Successful Payments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalTransactions.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">transactions</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/suggestions">
          <Card className={`hover:border-primary/50 transition-colors cursor-pointer ${pendingSuggestions > 0 ? 'border-amber-300 dark:border-amber-700' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Suggestions</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pendingSuggestions.toLocaleString()}</p>
              {pendingSuggestions > 0
                ? <Badge variant="destructive" className="text-xs mt-1">Needs review</Badge>
                : <p className="text-xs text-muted-foreground mt-1">all reviewed</p>}
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/capstone">
          <Card className={`hover:border-primary/50 transition-colors cursor-pointer ${pendingCapstones > 0 ? 'border-amber-300 dark:border-amber-700' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Capstones to Review</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pendingCapstones.toLocaleString()}</p>
              {pendingCapstones > 0
                ? <Badge variant="destructive" className="text-xs mt-1">Needs review</Badge>
                : <p className="text-xs text-muted-foreground mt-1">all reviewed</p>}
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button asChild variant="outline" size="sm" className="justify-start gap-2">
            <Link href="/admin/curriculum">
              <Layers className="h-4 w-4" />Curriculum
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="justify-start gap-2">
            <Link href="/admin/courses">
              <BookOpen className="h-4 w-4" />Courses
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="justify-start gap-2">
            <Link href="/admin/departments">
              <Building2 className="h-4 w-4" />Departments
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="justify-start gap-2">
            <Link href="/admin/users">
              <Users className="h-4 w-4" />Users
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
