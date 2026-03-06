// ─────────────────────────────────────────────
// FORMATTERS
// ─────────────────────────────────────────────

export function formatGPA(gpa: number): string {
  return gpa.toFixed(2);
}

export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatCurrency(
  amount: number,
  currency = 'USD',
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatCredits(units: number): string {
  return `${units} credit${units !== 1 ? 's' : ''}`;
}

/** e.g. 100 → "First Year" */
export function formatYearLabel(level: number): string {
  const labels: Record<number, string> = {
    100: 'First Year',
    200: 'Second Year',
    300: 'Third Year',
    400: 'Fourth Year',
  };
  return labels[level] ?? `Year ${level}`;
}

/** e.g. 1 → "First Semester" */
export function formatSemesterLabel(n: number): string {
  return n === 1 ? 'First Semester' : 'Second Semester';
}

/** e.g. 185 → "3h 5m" */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Countdown from a future timestamp */
export function formatCooldown(until: string): string {
  const diff = new Date(until).getTime() - Date.now();
  if (diff <= 0) return 'Ready';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return `${h}h ${m}m remaining`;
}
