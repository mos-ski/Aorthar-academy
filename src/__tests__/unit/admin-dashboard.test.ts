import {
  buildDailySeries,
  calculatePercentageChange,
  summarizeRevenueBySource,
} from '@/lib/admin/dashboard';

describe('admin dashboard analytics', () => {
  const now = new Date('2026-07-18T12:00:00.000Z');

  test('builds a continuous daily series and fills missing days with zero', () => {
    const series = buildDailySeries([
      { amount: 12_000, occurredAt: '2026-07-16T08:00:00.000Z' },
      { amount: 8_000, occurredAt: '2026-07-18T09:00:00.000Z' },
      { amount: 2_000, occurredAt: '2026-07-18T10:00:00.000Z' },
    ], 3, now);

    expect(series.map((point) => point.value)).toEqual([12_000, 0, 10_000]);
    expect(series.map((point) => point.date)).toEqual([
      '2026-07-16',
      '2026-07-17',
      '2026-07-18',
    ]);
  });

  test('calculates period change and handles an empty previous period', () => {
    expect(calculatePercentageChange(120, 100)).toBe(20);
    expect(calculatePercentageChange(80, 100)).toBe(-20);
    expect(calculatePercentageChange(0, 0)).toBe(0);
    expect(calculatePercentageChange(40, 0)).toBeNull();
  });

  test('summarizes and sorts revenue sources by value', () => {
    const breakdown = summarizeRevenueBySource([
      { amount: 10_000, occurredAt: '2026-07-18T09:00:00.000Z', source: 'University' },
      { amount: 30_000, occurredAt: '2026-07-18T10:00:00.000Z', source: 'Bootcamps' },
      { amount: 10_000, occurredAt: '2026-07-18T11:00:00.000Z', source: 'University' },
    ]);

    expect(breakdown).toEqual([
      { source: 'Bootcamps', value: 30_000, share: 60 },
      { source: 'University', value: 20_000, share: 40 },
    ]);
  });
});
