import fs from 'node:fs';
import path from 'node:path';
import { canonicalYouTubeWatchUrl, isPlayableYouTubeUrl, searchYouTubeCandidateUrls } from '@/lib/youtube';

type CacheEntry = {
  resolvedUrl: string;
  checkedAt: number;
  wasHealed: boolean;
};

type LessonResource = {
  id: string;
  type: string;
  title: string;
  url: string;
  sort_order: number;
};

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  duration_minutes: number;
  resources: LessonResource[];
};

const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
const cachePath = path.resolve(process.cwd(), '.cache/youtube-link-cache.json');

let cacheLoaded = false;
const cache = new Map<string, CacheEntry>();

function ensureCacheLoaded() {
  if (cacheLoaded) return;
  cacheLoaded = true;

  if (!fs.existsSync(cachePath)) return;

  try {
    const parsed = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Record<string, CacheEntry>;
    for (const [key, value] of Object.entries(parsed)) {
      if (value?.resolvedUrl) cache.set(key, value);
    }
  } catch {
    // Ignore malformed cache files; runtime will repopulate.
  }
}

function persistCache() {
  try {
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(Object.fromEntries(cache), null, 2));
  } catch {
    // Non-fatal in readonly/serverless contexts.
  }
}

export async function resolveYouTubeUrl(originalUrl: string, query: string): Promise<{ url: string; wasHealed: boolean }> {
  ensureCacheLoaded();

  const key = `${canonicalYouTubeWatchUrl(originalUrl)}::${query}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.checkedAt < CACHE_TTL_MS) {
    return { url: cached.resolvedUrl, wasHealed: cached.wasHealed };
  }

  const originalPlayable = await isPlayableYouTubeUrl(originalUrl);
  if (originalPlayable) {
    const value: CacheEntry = {
      resolvedUrl: canonicalYouTubeWatchUrl(originalUrl),
      checkedAt: Date.now(),
      wasHealed: false,
    };
    cache.set(key, value);
    persistCache();
    return { url: value.resolvedUrl, wasHealed: false };
  }

  const candidates = await searchYouTubeCandidateUrls(query, 5);
  const fallback = candidates[0];
  if (fallback && await isPlayableYouTubeUrl(fallback)) {
    const value: CacheEntry = {
      resolvedUrl: fallback,
      checkedAt: Date.now(),
      wasHealed: true,
    };
    console.info('[link-healer] replaced broken link', { originalUrl, fallback, query });
    cache.set(key, value);
    persistCache();
    return { url: value.resolvedUrl, wasHealed: true };
  }

  const value: CacheEntry = {
    resolvedUrl: canonicalYouTubeWatchUrl(originalUrl),
    checkedAt: Date.now(),
    wasHealed: false,
  };
  console.warn('[link-healer] unable to heal link', { originalUrl, query });
  cache.set(key, value);
  persistCache();
  return { url: value.resolvedUrl, wasHealed: false };
}

export async function healCourseLessons(
  lessons: Lesson[],
  context: { courseCode: string; courseName: string },
): Promise<{ lessons: Lesson[]; healedCount: number }> {
  let healedCount = 0;
  let checkedCount = 0;
  const maxChecksPerRequest = 12;

  const healedLessons = await Promise.all(
    lessons.map(async (lesson, lessonIndex) => {
      const healedResources = await Promise.all(
        lesson.resources.map(async (resource) => {
          if (resource.type !== 'youtube') return resource;
          if (checkedCount >= maxChecksPerRequest) return resource;
          checkedCount += 1;

          const query = `${context.courseCode} ${context.courseName} ${lesson.title} ${resource.title} tutorial`;
          const resolved = await resolveYouTubeUrl(resource.url, query);
          if (resolved.wasHealed && resolved.url !== resource.url) healedCount += 1;

          return {
            ...resource,
            url: resolved.url,
            title: resolved.wasHealed ? `${resource.title} (Auto-fixed)` : resource.title,
            sort_order: resource.sort_order || lessonIndex + 1,
          };
        }),
      );

      return {
        ...lesson,
        resources: healedResources,
      };
    }),
  );

  return { lessons: healedLessons, healedCount };
}

export function getLinkRepairCacheSize() {
  ensureCacheLoaded();
  return cache.size;
}
