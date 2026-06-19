export interface SplitResult {
  firstPaymentNgn: number;
  balanceNgn: number;
}

/**
 * Splits a price into a first payment and a balance for a given percentage.
 * The balance is derived by subtraction (not its own rounding) so the two
 * amounts always sum back to the original total price.
 */
export function calculateSplit(totalPriceNgn: number, percent: number): SplitResult {
  const firstPaymentNgn = Math.round(totalPriceNgn * (percent / 100));
  return { firstPaymentNgn, balanceNgn: totalPriceNgn - firstPaymentNgn };
}

export function isValidPlanPercent(percent: number, minPercent: number): boolean {
  return Number.isFinite(percent) && percent >= minPercent && percent < 100;
}

export function calculateDeadline(fromDate: Date, deadlineDays: number): Date {
  return new Date(fromDate.getTime() + deadlineDays * 24 * 60 * 60 * 1000);
}

export type PlanDeadlineAction = 'forfeit' | 'remind_1d' | 'remind_7d' | 'none';

export interface PlanDeadlineState {
  deadlineAt: string | Date;
  reminder7dSentAt: string | Date | null;
  reminder1dSentAt: string | Date | null;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Decides the next cron action for an awaiting-balance plan. Once inside the
 * 1-day window we never fall back to the 7-day reminder — sending a
 * "7 days left" email with 1 day actually left would be misleading.
 */
export function decidePlanDeadlineAction(plan: PlanDeadlineState, now: Date): PlanDeadlineAction {
  const deadline = new Date(plan.deadlineAt);
  const msLeft = deadline.getTime() - now.getTime();

  if (msLeft <= 0) return 'forfeit';
  if (msLeft <= ONE_DAY_MS) return plan.reminder1dSentAt ? 'none' : 'remind_1d';
  if (msLeft <= 7 * ONE_DAY_MS) return plan.reminder7dSentAt ? 'none' : 'remind_7d';
  return 'none';
}
