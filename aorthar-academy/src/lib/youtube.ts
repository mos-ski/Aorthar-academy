export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? null;
}

export function canonicalYouTubeWatchUrl(input: string): string {
  const id = extractYouTubeId(input);
  return id ? `https://www.youtube.com/watch?v=${id}` : input;
}

export async function isPlayableYouTubeUrl(url: string): Promise<boolean> {
  const normalized = canonicalYouTubeWatchUrl(url);
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(normalized)}&format=json`;

  try {
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(7000),
      headers: { 'User-Agent': 'aorthar-youtube-validator/1.0' },
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchYouTubeOembedTitle(url: string): Promise<string | null> {
  const normalized = canonicalYouTubeWatchUrl(url);
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(normalized)}&format=json`;

  try {
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(7000),
      headers: { 'User-Agent': 'aorthar-youtube-oembed/1.0' },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const data = await res.json() as { title?: string };
    return data.title?.trim() || null;
  } catch {
    return null;
  }
}

export async function searchYouTubeCandidateUrls(query: string, limit = 8): Promise<string[]> {
  const endpoint = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(9000),
      headers: { 'User-Agent': 'aorthar-youtube-search/1.0' },
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const html = await res.text();
    const ids = Array.from(html.matchAll(/\/watch\?v=([A-Za-z0-9_-]{11})/g)).map((m) => m[1]);
    const unique = Array.from(new Set(ids)).slice(0, limit);
    return unique.map((id) => `https://www.youtube.com/watch?v=${id}`);
  } catch {
    return [];
  }
}
