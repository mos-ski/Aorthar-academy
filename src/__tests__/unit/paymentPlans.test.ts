import { describe, it, expect } from 'vitest';
import {
  calculateSplit,
  isValidPlanPercent,
  calculateDeadline,
  decidePlanDeadlineAction,
} from '@/lib/paymentPlans';

describe('calculateSplit', () => {
  it('splits an even percentage with no rounding remainder', () => {
    const result = calculateSplit(20000, 50);
    expect(result).toEqual({ firstPaymentNgn: 10000, balanceNgn: 10000 });
  });

  it('rounds the first payment and keeps the balance exact (no money lost)', () => {
    const result = calculateSplit(10000, 33);
    expect(result.firstPaymentNgn).toBe(3300);
    expect(result.balanceNgn).toBe(6700);
    expect(result.firstPaymentNgn + result.balanceNgn).toBe(10000);
  });
});

describe('isValidPlanPercent', () => {
  it('accepts a percent equal to the minimum', () => {
    expect(isValidPlanPercent(50, 50)).toBe(true);
  });

  it('rejects a percent below the minimum', () => {
    expect(isValidPlanPercent(40, 50)).toBe(false);
  });

  it('rejects 100 percent (that is just paying in full)', () => {
    expect(isValidPlanPercent(100, 50)).toBe(false);
  });

  it('rejects non-finite input', () => {
    expect(isValidPlanPercent(NaN, 50)).toBe(false);
  });
});

describe('calculateDeadline', () => {
  it('adds the given number of days to the start date', () => {
    const start = new Date('2026-06-19T00:00:00.000Z');
    const deadline = calculateDeadline(start, 30);
    expect(deadline.toISOString()).toBe('2026-07-19T00:00:00.000Z');
  });
});

describe('decidePlanDeadlineAction', () => {
  const now = new Date('2026-06-19T12:00:00.000Z');
  const hoursFromNow = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();

  it('forfeits once the deadline has passed, even if reminders were already sent', () => {
    const action = decidePlanDeadlineAction(
      { deadlineAt: hoursFromNow(-1), reminder7dSentAt: hoursFromNow(-200), reminder1dSentAt: hoursFromNow(-30) },
      now,
    );
    expect(action).toBe('forfeit');
  });

  it('forfeits exactly at the deadline instant', () => {
    const action = decidePlanDeadlineAction(
      { deadlineAt: now.toISOString(), reminder7dSentAt: null, reminder1dSentAt: null },
      now,
    );
    expect(action).toBe('forfeit');
  });

  it('sends the 1-day reminder when within 24 hours and not yet sent', () => {
    const action = decidePlanDeadlineAction(
      { deadlineAt: hoursFromNow(20), reminder7dSentAt: hoursFromNow(-100), reminder1dSentAt: null },
      now,
    );
    expect(action).toBe('remind_1d');
  });

  it('does not resend the 1-day reminder', () => {
    const action = decidePlanDeadlineAction(
      { deadlineAt: hoursFromNow(20), reminder7dSentAt: hoursFromNow(-100), reminder1dSentAt: hoursFromNow(-2) },
      now,
    );
    expect(action).toBe('none');
  });

  it('sends the 7-day reminder when between 1 and 7 days out and not yet sent', () => {
    const action = decidePlanDeadlineAction(
      { deadlineAt: hoursFromNow(96), reminder7dSentAt: null, reminder1dSentAt: null },
      now,
    );
    expect(action).toBe('remind_7d');
  });

  it('does not resend the 7-day reminder', () => {
    const action = decidePlanDeadlineAction(
      { deadlineAt: hoursFromNow(96), reminder7dSentAt: hoursFromNow(-50), reminder1dSentAt: null },
      now,
    );
    expect(action).toBe('none');
  });

  it('does nothing when more than 7 days remain', () => {
    const action = decidePlanDeadlineAction(
      { deadlineAt: hoursFromNow(24 * 10), reminder7dSentAt: null, reminder1dSentAt: null },
      now,
    );
    expect(action).toBe('none');
  });

  it('never falls back to the 7-day reminder once inside the 1-day window', () => {
    const action = decidePlanDeadlineAction(
      { deadlineAt: hoursFromNow(5), reminder7dSentAt: null, reminder1dSentAt: hoursFromNow(-1) },
      now,
    );
    expect(action).toBe('none');
  });
});
