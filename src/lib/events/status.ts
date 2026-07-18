export type EventAccessState = 'registration' | 'live' | 'replay';

export const LIVE_JOIN_WINDOW_MS = 3 * 60 * 60 * 1000;

export function normalizeEventUrl(url?: string | null): string {
  const trimmed = url?.trim() ?? '';
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function getSeededEventReplayUrl(slug: string): string {
  const replayUrls: Record<string, string> = {
    SLTWX: 'https://youtu.be/5boUdgMli64',
  };

  return replayUrls[slug] ?? '';
}

export function getYouTubeEmbedUrl(url?: string | null): string {
  const normalizedUrl = normalizeEventUrl(url);
  if (!normalizedUrl) return '';

  try {
    const parsedUrl = new URL(normalizedUrl);
    const host = parsedUrl.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const videoId = parsedUrl.pathname.split('/').filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const videoId = parsedUrl.searchParams.get('v') || parsedUrl.pathname.match(/^\/embed\/([^/?#]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }
  } catch {
    return '';
  }

  return '';
}

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
