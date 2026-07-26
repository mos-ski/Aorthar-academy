import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  FileSignature,
  GraduationCap,
  Plus,
  Radio,
  ScrollText,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/formatters';

import type {
  DailySeriesPoint,
  RevenueSourceSummary,
} from '@/lib/admin/dashboard';
import type { LucideIcon } from 'lucide-react';

export type DashboardActivity = {
  detail: string;
  href: string;
  id: string;
  occurredAt: string;
  title: string;
  type: 'contract' | 'payment' | 'user';
};

export type DashboardProductPulse = {
  href: string;
  revenue: number;
  sales: number;
  source: string;
};

export type OverviewDashboardData = {
  activeSubscriptions: number;
  activities: DashboardActivity[];
  newUsers: number;
  newUsersChange: number | null;
  paymentChange: number | null;
  productPulse: DashboardProductPulse[];
  revenue: number;
  revenueBreakdown: RevenueSourceSummary[];
  revenueChange: number | null;
  revenueSeries: DailySeriesPoint[];
  successfulPayments: number;
  userSeries: DailySeriesPoint[];
  warning?: string;
};

const sourceColors: Record<string, string> = {
  Bootcamps: '#b9e85b',
  Contracts: '#e5e7eb',
  Internship: '#f59e0b',
  Marketplace: '#38bdf8',
  University: '#34d399',
  Webinars: '#f472b6',
};

const sourceIcons: Record<string, LucideIcon> = {
  Bootcamps: BookOpen,
  Contracts: FileSignature,
  Internship: BriefcaseBusiness,
  Marketplace: ShoppingBag,
  University: GraduationCap,
  Webinars: Radio,
};

function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}m`;
  if (value >= 1_000) return `₦${(value / 1_000).toFixed(value >= 100_000 ? 0 : 1)}k`;
  return `₦${Math.round(value).toLocaleString('en-US')}`;
}

function ChangeBadge({ value }: { value: number | null }): React.ReactNode {
  if (value === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-[#b9e85b]/10 px-2 py-1 text-[11px] font-semibold text-[#b9e85b]">
        New this period
      </span>
    );
  }

  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold',
      positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400',
    )}>
      <Icon className="h-3 w-3" />
      {positive ? '+' : ''}{value}%
    </span>
  );
}

function MetricCard({
  change,
  detail,
  icon: Icon,
  label,
  value,
}: {
  change?: number | null;
  detail: string;
  icon: LucideIcon;
  label: string;
  value: string;
}): React.ReactNode {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#b9e85b]/35">
      <div className="absolute inset-x-0 top-0 h-px bg-[#b9e85b] opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
          <p className="mt-3 font-mono text-3xl font-semibold tracking-[-0.05em] text-foreground">{value}</p>
        </div>
        <div className="grid size-9 place-items-center rounded-lg border border-border bg-background text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4 flex min-h-6 items-center justify-between gap-2">
        <p className="truncate text-xs text-muted-foreground">{detail}</p>
        {change !== undefined && <ChangeBadge value={change} />}
      </div>
    </div>
  );
}

function RevenueTrendChart({ points }: { points: DailySeriesPoint[] }): React.ReactNode {
  const width = 720;
  const height = 220;
  const inset = 18;
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const coordinates = points.map((point, index) => {
    const x = points.length <= 1
      ? inset
      : inset + (index / (points.length - 1)) * (width - inset * 2);
    const y = height - inset - (point.value / maxValue) * (height - inset * 2);
    return { ...point, x, y };
  });
  const linePath = coordinates
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
  const areaPath = coordinates.length > 0
    ? `${linePath} L ${coordinates.at(-1)?.x.toFixed(2)} ${height - inset} L ${coordinates[0]?.x.toFixed(2)} ${height - inset} Z`
    : '';
  const labelIndexes = [0, Math.floor((points.length - 1) / 2), points.length - 1];

  return (
    <div>
      <svg
        aria-label="Daily revenue for the last 30 days"
        className="h-[220px] w-full overflow-visible"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        <title>Daily revenue for the last 30 days</title>
        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = height - inset - ratio * (height - inset * 2);
          return (
            <line
              key={ratio}
              stroke="currentColor"
              strokeDasharray="3 6"
              strokeOpacity="0.12"
              x1={inset}
              x2={width - inset}
              y1={y}
              y2={y}
            />
          );
        })}
        {areaPath && <path d={areaPath} fill="#b9e85b" fillOpacity="0.06" />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#b9e85b"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
        )}
        {coordinates.filter((point) => point.value > 0).map((point) => (
          <circle
            key={point.date}
            cx={point.x}
            cy={point.y}
            fill="#111411"
            r="3.5"
            stroke="#b9e85b"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {labelIndexes.map((index) => (
          <span key={points[index]?.date ?? index}>{points[index]?.label ?? '—'}</span>
        ))}
      </div>
    </div>
  );
}

function UserGrowthChart({ points }: { points: DailySeriesPoint[] }): React.ReactNode {
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  return (
    <div className="flex h-28 items-end gap-1" aria-label="New users for the last 30 days" role="img">
      {points.map((point) => (
        <div
          key={point.date}
          className="group relative flex h-full min-w-0 flex-1 items-end"
          title={`${point.label}: ${point.value} new user${point.value === 1 ? '' : 's'}`}
        >
          <div
            className="w-full rounded-t-sm bg-foreground/15 transition-colors group-hover:bg-[#b9e85b]"
            style={{ height: `${Math.max((point.value / maxValue) * 100, point.value > 0 ? 10 : 2)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function activityIcon(type: DashboardActivity['type']): LucideIcon {
  if (type === 'contract') return FileSignature;
  if (type === 'user') return UserPlus;
  return CircleDollarSign;
}

export default function OverviewDashboard({ data }: { data: OverviewDashboardData }): React.ReactNode {
  const maxProductRevenue = Math.max(...data.productPulse.map((item) => item.revenue), 1);

  return (
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-[#101210] px-5 py-5 text-white sm:px-6">
        <div className="pointer-events-none absolute right-0 top-0 size-44 translate-x-1/3 -translate-y-1/3 rounded-full border border-[#b9e85b]/20" />
        <div className="pointer-events-none absolute right-8 top-0 size-28 -translate-y-1/2 rounded-full border border-white/5" />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Welcome, Admin</h1>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/contracts/new" className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white transition-colors hover:bg-white/10">
              <Plus className="h-3.5 w-3.5" /> Agreement
            </Link>
            <Link href="/admin/contracts/new?type=nda" className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white transition-colors hover:bg-white/10">
              <ScrollText className="h-3.5 w-3.5" /> NDA
            </Link>
            <Link href="/admin/webinars" className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white transition-colors hover:bg-white/10">
              <CalendarDays className="h-3.5 w-3.5" /> Webinar
            </Link>
            <Link href="/admin/standalone-courses" className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#b9e85b] px-3 text-xs font-bold text-[#111411] transition-colors hover:bg-[#c8f56d]">
              <BookOpen className="h-3.5 w-3.5" /> Add bootcamp
            </Link>
          </div>
        </div>
      </section>

      {data.warning && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300">
          {data.warning}
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          change={data.revenueChange}
          detail="vs previous 30 days"
          icon={WalletCards}
          label="30-day revenue"
          value={formatCompactCurrency(data.revenue)}
        />
        <MetricCard
          change={data.paymentChange}
          detail="paid transactions"
          icon={CircleDollarSign}
          label="Successful payments"
          value={data.successfulPayments.toLocaleString()}
        />
        <MetricCard
          change={data.newUsersChange}
          detail="joined in 30 days"
          icon={Users}
          label="New users"
          value={data.newUsers.toLocaleString()}
        />
        <MetricCard
          detail="premium university students"
          icon={TrendingUp}
          label="Active subscriptions"
          value={data.activeSubscriptions.toLocaleString()}
        />
      </section>

      <section>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Cash movement</p>
              <h2 className="mt-1 text-lg font-semibold">Revenue velocity</h2>
            </div>
            <span className="rounded-md border border-border bg-background px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Last 30 days</span>
          </div>
          <div className="mt-5">
            <RevenueTrendChart points={data.revenueSeries} />
          </div>
        </div>
      </section>

      <section className="grid items-stretch gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Revenue mix</p>
              <h2 className="mt-1 text-lg font-semibold">By business line</h2>
            </div>
            <CircleDollarSign className="h-5 w-5 text-[#b9e85b]" />
          </div>
          <div className="mt-6 space-y-4">
            {data.revenueBreakdown.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">No paid activity in this period.</div>
            ) : data.revenueBreakdown.map((item) => (
              <div key={item.source}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-foreground">{item.source}</span>
                  <span className="font-mono text-muted-foreground">{formatCompactCurrency(item.value)} · {item.share}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ backgroundColor: sourceColors[item.source] ?? '#b9e85b', width: `${Math.max(item.share, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Audience</p>
              <h2 className="mt-1 text-lg font-semibold">User growth</h2>
            </div>
            <UserPlus className="h-5 w-5 text-[#b9e85b]" />
          </div>
          <div className="mt-7">
            <UserGrowthChart points={data.userSeries} />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">Last 30 days</span>
            <span className="font-mono text-sm font-semibold">+{data.newUsers} users</span>
          </div>
        </div>
      </section>

      <section>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Product pulse</p>
              <h2 className="mt-1 text-lg font-semibold">Every business line, one view</h2>
            </div>
            <Link href="/admin/payments" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground">
              Payments <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-5 divide-y divide-border">
            {data.productPulse.map((item) => {
              const Icon = sourceIcons[item.source] ?? CircleDollarSign;
              return (
                <Link key={item.source} href={item.href} className="group grid grid-cols-[minmax(120px,1fr)_minmax(120px,1.3fr)_auto] items-center gap-4 py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground group-hover:text-[#b9e85b]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="truncate text-sm font-semibold">{item.source}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[#b9e85b] transition-[width]"
                      style={{ width: `${Math.max((item.revenue / maxProductRevenue) * 100, item.revenue > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold">{formatCompactCurrency(item.revenue)}</p>
                    <p className="text-[11px] text-muted-foreground">{item.sales} sale{item.sales === 1 ? '' : 's'}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Live feed</p>
              <h2 className="mt-1 text-lg font-semibold">Recent activity</h2>
            </div>
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
          </div>
          <div className="mt-4 grid gap-1 md:grid-cols-2 md:gap-x-6">
            {data.activities.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">Activity will appear here as the platform moves.</div>
            ) : data.activities.map((activity) => {
              const Icon = activityIcon(activity.type);
              return (
                <Link key={`${activity.type}-${activity.id}`} href={activity.href} className="group flex items-start gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/50">
                  <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground group-hover:text-[#b9e85b]">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{activity.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{activity.detail}</p>
                  </div>
                  <time className="mt-1 shrink-0 font-mono text-[10px] text-muted-foreground" dateTime={activity.occurredAt}>
                    {formatDate(activity.occurredAt).split(',')[0]}
                  </time>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
