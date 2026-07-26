export const dynamic = 'force-dynamic';

import OverviewDashboard from '@/components/admin/OverviewDashboard';
import {
  buildDailySeries,
  calculatePercentageChange,
  summarizeRevenueBySource,
} from '@/lib/admin/dashboard';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatCurrency } from '@/utils/formatters';

import type {
  DashboardActivity,
  DashboardProductPulse,
  OverviewDashboardData,
} from '@/components/admin/OverviewDashboard';
import type { RevenueEvent } from '@/lib/admin/dashboard';

type DashboardRevenueEvent = RevenueEvent & {
  href: string;
  id: string;
};

type ProfileRow = {
  created_at: string;
  full_name: string | null;
  id: string;
};

type RecentContractRow = {
  id: string;
  recipient_name: string | null;
  status: string;
  title: string;
  updated_at: string;
};

const productDefinitions = [
  { source: 'University', href: '/admin/payments?module=university' },
  { source: 'Bootcamps', href: '/admin/payments?module=courses' },
  { source: 'Internship', href: '/admin/internship/transactions' },
  { source: 'Marketplace', href: '/admin/marketplace/transactions' },
  { source: 'Webinars', href: '/admin/webinars/attendees' },
  { source: 'Contracts', href: '/admin/contracts' },
] as const;

export default async function AdminDashboardPage(): Promise<React.ReactNode> {
  const admin = createAdminClient();
  const now = new Date();
  const currentStart = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  ));
  currentStart.setUTCDate(currentStart.getUTCDate() - 29);
  const previousStart = new Date(currentStart);
  previousStart.setUTCDate(previousStart.getUTCDate() - 30);

  const [
    profilesResult,
    activeSubscriptionsResult,
    transactionsResult,
    standalonePurchasesResult,
    internshipRevenueResult,
    marketplaceRevenueResult,
    webinarRevenueResult,
    contractRevenueResult,
    recentContractsResult,
  ] = await Promise.all([
    admin
      .from('profiles')
      .select('id, full_name, created_at')
      .gte('created_at', previousStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(500),
    admin
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    admin
      .from('transactions')
      .select('id, amount, paid_at, created_at')
      .eq('status', 'success')
      .gte('created_at', previousStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(500),
    admin
      .from('standalone_purchases')
      .select('id, amount_paid_ngn, purchased_at')
      .gte('purchased_at', previousStart.toISOString())
      .order('purchased_at', { ascending: false })
      .limit(500),
    admin
      .from('internship_applications')
      .select('id, amount_paid_ngn, paid_at')
      .eq('payment_status', 'paid')
      .gte('paid_at', previousStart.toISOString())
      .order('paid_at', { ascending: false })
      .limit(500),
    admin
      .from('marketplace_purchases')
      .select('id, amount_paid_ngn, paid_at')
      .eq('payment_status', 'paid')
      .gte('paid_at', previousStart.toISOString())
      .order('paid_at', { ascending: false })
      .limit(500),
    admin
      .from('webinar_registrations')
      .select('id, amount_paid_ngn, registered_at')
      .gte('registered_at', previousStart.toISOString())
      .order('registered_at', { ascending: false })
      .limit(500),
    admin
      .from('contract_payments')
      .select('id, contract_id, amount_ngn, paid_at')
      .in('status', ['paid', 'manual_paid'])
      .gte('paid_at', previousStart.toISOString())
      .order('paid_at', { ascending: false })
      .limit(500),
    admin
      .from('contracts')
      .select('id, title, recipient_name, status, updated_at')
      .order('updated_at', { ascending: false })
      .limit(4),
  ]);

  const revenueEvents: DashboardRevenueEvent[] = [
    ...((transactionsResult.data ?? []) as Array<{
      amount: number | string;
      created_at: string;
      id: string;
      paid_at: string | null;
    }>).map((row) => ({
      amount: Number(row.amount ?? 0),
      href: '/admin/payments?module=university',
      id: row.id,
      occurredAt: row.paid_at ?? row.created_at,
      source: 'University',
    })),
    ...((standalonePurchasesResult.data ?? []) as Array<{
      amount_paid_ngn: number;
      id: string;
      purchased_at: string;
    }>).map((row) => ({
      amount: Number(row.amount_paid_ngn ?? 0),
      href: '/admin/payments?module=courses',
      id: row.id,
      occurredAt: row.purchased_at,
      source: 'Bootcamps',
    })),
    ...((internshipRevenueResult.data ?? []) as Array<{
      amount_paid_ngn: number | null;
      id: string;
      paid_at: string;
    }>).map((row) => ({
      amount: Number(row.amount_paid_ngn ?? 0),
      href: '/admin/internship/transactions',
      id: row.id,
      occurredAt: row.paid_at,
      source: 'Internship',
    })),
    ...((marketplaceRevenueResult.data ?? []) as Array<{
      amount_paid_ngn: number | null;
      id: string;
      paid_at: string;
    }>).map((row) => ({
      amount: Number(row.amount_paid_ngn ?? 0),
      href: '/admin/marketplace/transactions',
      id: row.id,
      occurredAt: row.paid_at,
      source: 'Marketplace',
    })),
    ...((webinarRevenueResult.data ?? []) as Array<{
      amount_paid_ngn: number;
      id: string;
      registered_at: string;
    }>).map((row) => ({
      amount: Number(row.amount_paid_ngn ?? 0),
      href: '/admin/webinars/attendees',
      id: row.id,
      occurredAt: row.registered_at,
      source: 'Webinars',
    })),
    ...((contractRevenueResult.data ?? []) as Array<{
      amount_ngn: number;
      contract_id: string;
      id: string;
      paid_at: string;
    }>).map((row) => ({
      amount: Number(row.amount_ngn ?? 0),
      href: `/admin/contracts/${row.contract_id}`,
      id: row.id,
      occurredAt: row.paid_at,
      source: 'Contracts',
    })),
  ].filter((event) => Number.isFinite(event.amount) && event.amount >= 0);

  const currentRevenueEvents = revenueEvents.filter((event) => (
    event.amount > 0 && new Date(event.occurredAt).getTime() >= currentStart.getTime()
  ));
  const previousRevenueEvents = revenueEvents.filter((event) => {
    const occurredAt = new Date(event.occurredAt).getTime();
    return event.amount > 0
      && occurredAt >= previousStart.getTime()
      && occurredAt < currentStart.getTime();
  });
  const currentRevenue = currentRevenueEvents.reduce((sum, event) => sum + event.amount, 0);
  const previousRevenue = previousRevenueEvents.reduce((sum, event) => sum + event.amount, 0);

  const profiles = (profilesResult.data ?? []) as ProfileRow[];
  const currentProfiles = profiles.filter((profile) => (
    new Date(profile.created_at).getTime() >= currentStart.getTime()
  ));
  const previousProfiles = profiles.filter((profile) => {
    const createdAt = new Date(profile.created_at).getTime();
    return createdAt >= previousStart.getTime() && createdAt < currentStart.getTime();
  });

  const productPulse: DashboardProductPulse[] = productDefinitions.map((product) => {
    const productEvents = currentRevenueEvents.filter((event) => event.source === product.source);
    return {
      href: product.href,
      revenue: productEvents.reduce((sum, event) => sum + event.amount, 0),
      sales: productEvents.length,
      source: product.source,
    };
  });

  const paymentActivities: DashboardActivity[] = [...currentRevenueEvents]
    .sort((left, right) => (
      new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
    ))
    .slice(0, 5)
    .map((event) => ({
      detail: `${formatCurrency(event.amount, 'NGN').replace('.00', '')} received`,
      href: event.href,
      id: event.id,
      occurredAt: event.occurredAt,
      title: `${event.source} payment`,
      type: 'payment',
    }));
  const contractActivities: DashboardActivity[] = (
    (recentContractsResult.data ?? []) as RecentContractRow[]
  ).map((contract) => ({
    detail: `${contract.recipient_name || 'No recipient'} · ${contract.status}`,
    href: `/admin/contracts/${contract.id}`,
    id: contract.id,
    occurredAt: contract.updated_at,
    title: contract.title,
    type: 'contract',
  }));
  const userActivities: DashboardActivity[] = profiles.slice(0, 4).map((profile) => ({
    detail: 'Joined the Aorthar platform',
    href: '/admin/users',
    id: profile.id,
    occurredAt: profile.created_at,
    title: profile.full_name || 'New user',
    type: 'user',
  }));
  const activities = [
    ...paymentActivities,
    ...contractActivities,
    ...userActivities,
  ]
    .sort((left, right) => (
      new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
    ))
    .slice(0, 7);

  const queryErrors = [
    profilesResult.error,
    activeSubscriptionsResult.error,
    transactionsResult.error,
    standalonePurchasesResult.error,
    internshipRevenueResult.error,
    marketplaceRevenueResult.error,
    webinarRevenueResult.error,
    contractRevenueResult.error,
    recentContractsResult.error,
  ].filter(Boolean);

  const dashboardData: OverviewDashboardData = {
    activeSubscriptions: activeSubscriptionsResult.count ?? 0,
    activities,
    newUsers: currentProfiles.length,
    newUsersChange: calculatePercentageChange(currentProfiles.length, previousProfiles.length),
    paymentChange: calculatePercentageChange(
      currentRevenueEvents.length,
      previousRevenueEvents.length,
    ),
    productPulse,
    revenue: currentRevenue,
    revenueBreakdown: summarizeRevenueBySource(currentRevenueEvents),
    revenueChange: calculatePercentageChange(currentRevenue, previousRevenue),
    revenueSeries: buildDailySeries(currentRevenueEvents, 30, now),
    successfulPayments: currentRevenueEvents.length,
    userSeries: buildDailySeries(
      currentProfiles.map((profile) => ({ amount: 1, occurredAt: profile.created_at })),
      30,
      now,
    ),
    warning: queryErrors.length > 0
      ? 'Some live metrics could not be loaded. The available dashboard data is shown below.'
      : undefined,
  };

  return <OverviewDashboard data={dashboardData} />;
}
