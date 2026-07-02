export type EventAccessState = 'registration' | 'live' | 'replay';

export const LIVE_JOIN_WINDOW_MS = 3 * 60 * 60 * 1000;

export function getEventAccessState({
  scheduledAt,
  durationMinutes,
  now = new Date(),
  hasJoinUrl,
}: {
  scheduledAt: string;
  durationMinutes: number;
  now?: Date;
  hasJoinUrl: boolean;
}): EventAccessState {
  const startsAtMs = new Date(scheduledAt).getTime();
  const durationMs = Math.max(1, durationMinutes) * 60 * 1000;
  const endsAtMs = startsAtMs + durationMs;
  const nowMs = now.getTime();

  if (nowMs >= endsAtMs) return 'replay';
  if (hasJoinUrl && nowMs >= startsAtMs - LIVE_JOIN_WINDOW_MS) return 'live';
  return 'registration';
}

export function getEventReplayUrl(slug: string): string {
  const replayOverrides: Record<string, string> = {
    SLTWX: 'https://youtu.be/5boUdgMli64',
  };

  return replayOverrides[slug] ?? '';
}
