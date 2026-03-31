import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatGPA,
  formatScore,
  formatDate,
  formatDateTime,
  formatCurrency,
  formatCredits,
  formatYearLabel,
  formatSemesterLabel,
  formatMinutes,
  formatCooldown,
} from '@/utils/formatters';

describe('formatGPA', () => {
  it('formats to 2 decimal places', () => {
    expect(formatGPA(3.5)).toBe('3.50');
    expect(formatGPA(4.0)).toBe('4.00');
    expect(formatGPA(2.333)).toBe('2.33');
  });

  it('handles zero', () => {
    expect(formatGPA(0)).toBe('0.00');
  });
});

describe('formatScore', () => {
  it('rounds and appends percent sign', () => {
    expect(formatScore(85)).toBe('85%');
    expect(formatScore(85.6)).toBe('86%');
    expect(formatScore(0)).toBe('0%');
    expect(formatScore(100)).toBe('100%');
  });

  it('rounds 0.5 up', () => {
    expect(formatScore(84.5)).toBe('85%');
  });
});

describe('formatDate', () => {
  it('returns dash for null/undefined', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });

  it('returns dash for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('formats a valid ISO date', () => {
    const result = formatDate('2024-01-15T00:00:00.000Z');
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/15/);
  });
});

describe('formatDateTime', () => {
  it('returns dash for null/undefined', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime(undefined)).toBe('—');
  });

  it('returns dash for invalid date', () => {
    expect(formatDateTime('bad')).toBe('—');
  });

  it('formats a valid ISO datetime', () => {
    const result = formatDateTime('2024-06-01T14:30:00.000Z');
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/Jun/);
  });
});

describe('formatCurrency', () => {
  it('formats NGN by default', () => {
    const result = formatCurrency(20000);
    expect(result).toContain('20,000');
  });

  it('accepts a custom currency', () => {
    const result = formatCurrency(100, 'USD');
    expect(result).toContain('100');
  });
});

describe('formatCredits', () => {
  it('uses singular for 1 credit', () => {
    expect(formatCredits(1)).toBe('1 credit');
  });

  it('uses plural for other amounts', () => {
    expect(formatCredits(0)).toBe('0 credits');
    expect(formatCredits(3)).toBe('3 credits');
  });
});

describe('formatYearLabel', () => {
  it('maps numeric levels to year names', () => {
    expect(formatYearLabel(100)).toBe('First Year');
    expect(formatYearLabel(200)).toBe('Second Year');
    expect(formatYearLabel(300)).toBe('Third Year');
    expect(formatYearLabel(400)).toBe('Fourth Year');
  });

  it('falls back for unknown levels', () => {
    expect(formatYearLabel(500)).toBe('Year 500');
  });
});

describe('formatSemesterLabel', () => {
  it('returns First Semester for 1', () => {
    expect(formatSemesterLabel(1)).toBe('First Semester');
  });

  it('returns Second Semester for anything else', () => {
    expect(formatSemesterLabel(2)).toBe('Second Semester');
  });
});

describe('formatMinutes', () => {
  it('formats minutes only when under 60', () => {
    expect(formatMinutes(45)).toBe('45m');
    expect(formatMinutes(0)).toBe('0m');
  });

  it('formats hours only when no remainder', () => {
    expect(formatMinutes(60)).toBe('1h');
    expect(formatMinutes(120)).toBe('2h');
  });

  it('formats hours and minutes', () => {
    expect(formatMinutes(90)).toBe('1h 30m');
    expect(formatMinutes(185)).toBe('3h 5m');
  });
});

describe('formatCooldown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Ready" when cooldown has passed', () => {
    expect(formatCooldown('2024-01-01T11:00:00.000Z')).toBe('Ready');
  });

  it('returns hours and minutes remaining', () => {
    const result = formatCooldown('2024-01-01T14:30:00.000Z');
    expect(result).toBe('2h 30m remaining');
  });

  it('returns 0h Nm for less than 1 hour', () => {
    const result = formatCooldown('2024-01-01T12:45:00.000Z');
    expect(result).toBe('0h 45m remaining');
  });
});
