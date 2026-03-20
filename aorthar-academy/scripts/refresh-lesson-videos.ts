/**
 * One-time script to refresh YouTube video URLs in the resources table.
 * Fetches all lesson YouTube resources, searches for unique relevant videos
 * per lesson, and updates the DB rows so each lesson has a distinct video.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... bun run scripts/refresh-lesson-videos.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? null;
}

async function searchYouTubeCandidates(query: string, limit = 8): Promise<string[]> {
  const endpoint = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(9000),
      headers: { 'User-Agent': 'aorthar-video-refresh/1.0' },
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Fetching all YouTube resources...');

  // Fetch all youtube resources with their lesson title and course code
  const { data: rows, error } = await supabase
    .from('resources')
    .select(`
      id,
      url,
      title,
      lesson_id,
      lessons!inner(
        id,
        title,
        sort_order,
        courses!inner(code, name)
      )
    `)
    .eq('type', 'youtube')
    .order('lesson_id');

  if (error) {
    console.error('Failed to fetch resources:', error.message);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log('No YouTube resources found.');
    return;
  }

  console.log(`Found ${rows.length} YouTube resources. Starting refresh...\n`);

  const usedVideoIds = new Set<string>();
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] as unknown as {
      id: string;
      url: string;
      title: string;
      lesson_id: string;
      lessons: { id: string; title: string; sort_order: number; courses: { code: string; name: string } };
    };

    const lesson = row.lessons;
    const course = lesson.courses;
    const courseCode = course.code;
    const courseName = course.name;
    const lessonTitle = lesson.title;

    const currentId = extractVideoId(row.url);

    // If current video is already unique, mark it used and skip
    if (currentId && !usedVideoIds.has(currentId)) {
      usedVideoIds.add(currentId);
      skipped++;
      process.stdout.write(`[${i + 1}/${rows.length}] KEEP  ${courseCode} — ${lessonTitle}\n`);
      continue;
    }

    // Current video is duplicate or invalid — search for a unique replacement
    const query = `${courseCode} ${courseName} ${lessonTitle} tutorial`;
    const candidates = await searchYouTubeCandidates(query, 8);

    const chosen = candidates.find((url) => {
      const id = extractVideoId(url);
      return id && !usedVideoIds.has(id);
    });

    if (!chosen) {
      failed++;
      process.stdout.write(`[${i + 1}/${rows.length}] FAIL  ${courseCode} — ${lessonTitle} (no unique candidate found)\n`);
      await sleep(300);
      continue;
    }

    const chosenId = extractVideoId(chosen)!;
    usedVideoIds.add(chosenId);

    // Update the resource row
    const { error: updateError } = await supabase
      .from('resources')
      .update({ url: chosen })
      .eq('id', row.id);

    if (updateError) {
      failed++;
      console.error(`  -> update failed: ${updateError.message}`);
    } else {
      updated++;
      process.stdout.write(`[${i + 1}/${rows.length}] UPDATE ${courseCode} — ${lessonTitle}\n`);
    }

    // Throttle to avoid hammering YouTube search
    await sleep(350);
  }

  console.log(`\nDone! Updated: ${updated} | Kept: ${skipped} | Failed: ${failed} / ${rows.length} total`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
