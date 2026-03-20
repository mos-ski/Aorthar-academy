/**
 * Seeds 3 lessons per course — picking from 12-week lesson plans in department
 * markdown files where available, falling back to generated titles otherwise.
 *
 * Idempotent: skips lessons that already exist (checks by sort_order).
 * After running this, run `bun run refresh:videos` to fill in real YouTube URLs.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... bun run scripts/seed-lessons-per-course.ts
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// ──────────────────────────── Config ────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PLACEHOLDER_VIDEO_URL = 'https://www.youtube.com/watch?v=TBD';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ──────────────────────────── Types ─────────────────────────────

type WeekLesson = {
  week: number;
  topic: string;
  coreConcepts: string;
  youtubeUrl: string | null;
};

type DeepDiveCourse = {
  code: string;         // e.g. "DES101"
  name: string;
  description: string;
  lessons: WeekLesson[];
};

// ──────────────────────────── Helpers ───────────────────────────

function stableUuid(seed: string): string {
  const hash = crypto.createHash('md5').update(seed).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20)}`;
}

/** Extract the first YouTube URL from a markdown table cell (may have multiple links) */
function extractYouTubeUrl(resourceCell: string): string | null {
  const matches = resourceCell.matchAll(/\(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})[^\)]*\)/g);
  for (const match of matches) {
    return `https://www.youtube.com/watch?v=${match[1]}`;
  }
  return null;
}

/** Pick up to 3 evenly-spaced lessons from a 12-week plan */
function pickThreeLessons(weeks: WeekLesson[]): [WeekLesson, WeekLesson, WeekLesson] | [WeekLesson, WeekLesson] | [WeekLesson] {
  if (weeks.length === 0) return [] as unknown as [WeekLesson];
  if (weeks.length === 1) return [weeks[0]] as [WeekLesson];
  if (weeks.length === 2) return [weeks[0], weeks[1]] as [WeekLesson, WeekLesson];

  // Pick indices at 0%, 40%, 80% of the array
  const a = weeks[0]!;
  const bIdx = Math.floor(weeks.length * 0.4);
  const cIdx = Math.floor(weeks.length * 0.8);
  const b = weeks[bIdx]!;
  const c = weeks[cIdx === bIdx ? bIdx + 1 : cIdx]!;
  return [a, b, c] as [WeekLesson, WeekLesson, WeekLesson];
}

// ──────────────────────────── Markdown Parsing ──────────────────

/**
 * Parse all `### **Course Deep Dive: COURSECODE - Name**` sections from a markdown file.
 * Returns a map from normalised course code → DeepDiveCourse.
 */
function parseDeepDives(markdown: string): Map<string, DeepDiveCourse> {
  const result = new Map<string, DeepDiveCourse>();
  const lines = markdown.split(/\r?\n/);

  const deepDiveHeader = /^###\s+\*\*Course Deep Dive:\s+([A-Z]{2,6}\d{3})\s+-\s+(.+?)\*\*\s*$/;
  const descriptionLine = /^\*\*Description\*\*:\s*(.+)\s*$/;
  // Table row: | number | Topic text | Core Concepts | Resources |
  const tableRow = /^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/;

  let current: DeepDiveCourse | null = null;
  let inTable = false;

  for (const line of lines) {
    const headerMatch = line.match(deepDiveHeader);
    if (headerMatch) {
      current = {
        code: headerMatch[1].toUpperCase(),
        name: headerMatch[2].trim(),
        description: '',
        lessons: [],
      };
      result.set(current.code, current);
      inTable = false;
      continue;
    }

    if (!current) continue;

    const descMatch = line.match(descriptionLine);
    if (descMatch && !current.description) {
      current.description = descMatch[1].trim();
      continue;
    }

    // Detect the start of a lesson plan table (header row)
    if (/^\|\s*Week\s*\|/i.test(line)) {
      inTable = true;
      continue;
    }

    // Skip separator row
    if (inTable && /^\|\s*[-:]+\s*\|/.test(line)) {
      continue;
    }

    if (inTable) {
      const rowMatch = line.match(tableRow);
      if (rowMatch) {
        const week = parseInt(rowMatch[1], 10);
        const topic = rowMatch[2].replace(/\*\*/g, '').trim();
        const coreConcepts = rowMatch[3].replace(/\*\*/g, '').trim().slice(0, 200);
        const resourceCell = rowMatch[4].trim();
        const youtubeUrl = extractYouTubeUrl(resourceCell);

        current.lessons.push({ week, topic, coreConcepts, youtubeUrl });
      } else if (!line.trim().startsWith('|') && line.trim() !== '') {
        // We've left the table
        inTable = false;
      }
    }
  }

  return result;
}

function loadAllDeepDives(markdownRoot: string): Map<string, DeepDiveCourse> {
  const combined = new Map<string, DeepDiveCourse>();

  function visit(dir: string): void {
    const ignored = new Set(['.cache', '.git', '.next', 'build', 'dist', 'node_modules']);
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.DS_Store') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!ignored.has(entry.name)) visit(full);
        continue;
      }
      if (!entry.name.toLowerCase().endsWith('.md')) continue;

      const markdown = fs.readFileSync(full, 'utf8');
      const dives = parseDeepDives(markdown);

      for (const [code, dive] of dives) {
        const existing = combined.get(code);
        if (!existing || dive.lessons.length > existing.lessons.length) {
          combined.set(code, dive);
        }
      }
    }
  }

  visit(markdownRoot);
  return combined;
}

// ──────────────────────────── Lesson generation ─────────────────

const GENERIC_LESSON_TEMPLATES: Array<(courseName: string) => { title: string; content: string }> = [
  (name) => ({
    title: `${name} — Foundations`,
    content: `Core principles and foundational concepts for ${name}. Students will establish the essential knowledge framework required for this course.`,
  }),
  (name) => ({
    title: `${name} — Core Practice`,
    content: `Hands-on application of ${name} principles. Students will apply concepts through guided exercises and practical examples.`,
  }),
  (name) => ({
    title: `${name} — Applied Skills`,
    content: `Advanced application and real-world contexts for ${name}. Students will synthesise learning through project-based activities.`,
  }),
];

// ──────────────────────────── Main ──────────────────────────────

async function main() {
  const markdownRoot = path.resolve(process.cwd(), '..');

  console.log('Loading deep dive lesson plans from markdown files...');
  const deepDives = loadAllDeepDives(markdownRoot);
  console.log(`Found deep dive plans for ${deepDives.size} courses.`);

  // Fetch all courses with their existing lesson counts
  const { data: courses, error: courseErr } = await supabase
    .from('courses')
    .select('id, code, name');

  if (courseErr || !courses) {
    console.error('Failed to fetch courses:', courseErr?.message);
    process.exit(1);
  }

  console.log(`Found ${courses.length} courses in DB.`);

  // Fetch existing lessons to know which sort_orders already exist per course
  const courseIds = courses.map((c) => c.id);
  const { data: existingLessons, error: lessonErr } = await supabase
    .from('lessons')
    .select('id, course_id, sort_order')
    .in('course_id', courseIds);

  if (lessonErr) {
    console.error('Failed to fetch existing lessons:', lessonErr.message);
    process.exit(1);
  }

  // Map: courseId → Set<sort_order>
  const existingSortOrders = new Map<string, Set<number>>();
  for (const lesson of existingLessons ?? []) {
    let set = existingSortOrders.get(lesson.course_id);
    if (!set) { set = new Set(); existingSortOrders.set(lesson.course_id, set); }
    set.add(lesson.sort_order);
  }

  const lessonsToInsert: Array<{
    id: string;
    course_id: string;
    title: string;
    content: string;
    sort_order: number;
    is_published: boolean;
  }> = [];

  const resourcesToInsert: Array<{
    id: string;
    lesson_id: string;
    type: string;
    title: string;
    url: string;
    sort_order: number;
  }> = [];

  for (const course of courses as Array<{ id: string; code: string; name: string }>) {
    const existingOrders = existingSortOrders.get(course.id) ?? new Set<number>();

    // We want sort_orders 1, 2, 3. Determine which are missing.
    const needed = ([1, 2, 3] as const).filter((order) => !existingOrders.has(order));
    if (needed.length === 0) continue; // Already has ≥ 3 lessons

    // Build lesson data for needed sort orders
    const dive = deepDives.get(course.code);
    const pickedWeeks = dive ? pickThreeLessons(dive.lessons) : [];

    for (const order of needed) {
      const zeroIdx = order - 1; // 0, 1, 2

      let title: string;
      let content: string;
      let youtubeUrl: string | null = null;

      const weekLesson = pickedWeeks[zeroIdx];
      if (weekLesson) {
        title = weekLesson.topic;
        content = weekLesson.coreConcepts;
        youtubeUrl = weekLesson.youtubeUrl;
      } else {
        const template = GENERIC_LESSON_TEMPLATES[zeroIdx] ?? GENERIC_LESSON_TEMPLATES[2];
        const generated = template(course.name);
        title = generated.title;
        content = generated.content;
      }

      const lessonId = stableUuid(`aorthar-lesson-${course.code}-${order}`);
      lessonsToInsert.push({
        id: lessonId,
        course_id: course.id,
        title,
        content,
        sort_order: order,
        is_published: true,
      });

      resourcesToInsert.push({
        id: stableUuid(`aorthar-resource-${course.code}-${order}-1`),
        lesson_id: lessonId,
        type: 'youtube',
        title: `${title} — Video`,
        url: youtubeUrl ?? PLACEHOLDER_VIDEO_URL,
        sort_order: 1,
      });
    }
  }

  if (lessonsToInsert.length === 0) {
    console.log('All courses already have 3+ lessons. Nothing to do.');
    return;
  }

  console.log(`\nInserting ${lessonsToInsert.length} lessons across ${courses.length} courses...`);

  // Upsert in batches of 100
  for (let i = 0; i < lessonsToInsert.length; i += 100) {
    const batch = lessonsToInsert.slice(i, i + 100);
    const { error } = await supabase
      .from('lessons')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`Lesson batch ${i / 100 + 1} failed:`, error.message);
      process.exit(1);
    }
    process.stdout.write(`  Lessons batch ${Math.floor(i / 100) + 1}/${Math.ceil(lessonsToInsert.length / 100)} done\n`);
  }

  console.log(`\nInserting ${resourcesToInsert.length} YouTube resource records...`);

  for (let i = 0; i < resourcesToInsert.length; i += 100) {
    const batch = resourcesToInsert.slice(i, i + 100);
    const { error } = await supabase
      .from('resources')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`Resource batch ${i / 100 + 1} failed:`, error.message);
      process.exit(1);
    }
    process.stdout.write(`  Resources batch ${Math.floor(i / 100) + 1}/${Math.ceil(resourcesToInsert.length / 100)} done\n`);
  }

  const withDive = lessonsToInsert.filter((_, idx) => {
    const res = resourcesToInsert[idx];
    return res && res.url !== PLACEHOLDER_VIDEO_URL;
  }).length;

  const withPlaceholder = lessonsToInsert.length - withDive;

  console.log('\n────────────────────────────────────');
  console.log(`Done!`);
  console.log(`  Lessons seeded:       ${lessonsToInsert.length}`);
  console.log(`  With real YouTube URL: ${withDive}`);
  console.log(`  With placeholder URL:  ${withPlaceholder} (run \`bun run refresh:videos\` to fill these)`);
  console.log('────────────────────────────────────');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
