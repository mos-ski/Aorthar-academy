export type DatedValue = {
  amount: number;
  occurredAt: string;
};

export type RevenueEvent = DatedValue & {
  source: string;
};

export type DailySeriesPoint = {
  date: string;
  label: string;
  value: number;
};

export type RevenueSourceSummary = {
  source: string;
  value: number;
  share: number;
};

function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildDailySeries(
  events: DatedValue[],
  days: number,
  now: Date = new Date(),
): DailySeriesPoint[] {
  if (days <= 0) return [];

  const valuesByDate = new Map<string, number>();
  for (const event of events) {
    const date = new Date(event.occurredAt);
    if (Number.isNaN(date.getTime()) || !Number.isFinite(event.amount)) continue;
    const key = toUtcDateKey(date);
    valuesByDate.set(key, (valuesByDate.get(key) ?? 0) + event.amount);
  }

  const currentDay = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  ));
  const firstDay = new Date(currentDay);
  firstDay.setUTCDate(firstDay.getUTCDate() - (days - 1));

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(firstDay);
    date.setUTCDate(firstDay.getUTCDate() + index);
    const key = toUtcDateKey(date);
    return {
      date: key,
      label: new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
      }).format(date),
      value: valuesByDate.get(key) ?? 0,
    };
  });
}

export function calculatePercentageChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export function summarizeRevenueBySource(
  events: RevenueEvent[],
): RevenueSourceSummary[] {
  const totals = new Map<string, number>();
  for (const event of events) {
    if (!Number.isFinite(event.amount) || event.amount < 0) continue;
    totals.set(event.source, (totals.get(event.source) ?? 0) + event.amount);
  }

  const totalRevenue = Array.from(totals.values()).reduce((sum, value) => sum + value, 0);
  return Array.from(totals.entries())
    .map(([source, value]) => ({
      source,
      value,
      share: totalRevenue === 0 ? 0 : Math.round((value / totalRevenue) * 100),
    }))
    .sort((left, right) => right.value - left.value);
}
