import { extractYouTubeId } from '@/lib/youtube';

function parseTimedText(xml: string) {
  const matches = Array.from(xml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g));
  if (matches.length === 0) return '';
  return matches
    .map((m) =>
      m[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean)
    .join(' ');
}

export async function fetchYouTubeTranscript(url: string): Promise<string | null> {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  const endpoints = [
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=srv3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const text = parseTimedText(await res.text());
      if (text.length > 30) return text.slice(0, 10000);
    } catch {
      // continue fallback
    }
  }

  return null;
}

