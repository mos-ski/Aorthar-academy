/**
 * Aorthar University Curriculum Seed Script
 *
 * Reads all department markdown files from _source-departments/ and inserts
 * the curriculum into Supabase via the admin client.
 *
 * Run: bun run scripts/seed-curriculum.ts
 *
 * Safe to re-run — uses upsert/dedup where possible, skips existing records.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// ── Supabase admin client ─────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ── Types ─────────────────────────────────────────────────────────────────────

interface ParsedClass {
  title: string;
  url: string | null; // null if [FIND: ...] placeholder
}

interface ParsedQuizQuestion {
  question: string;
  answer: string;
}

interface ParsedCourse {
  code: string;
  name: string;
  description: string;
  credits: number;
  isPremium: boolean;
  aiSummary: string;
  classes: ParsedClass[];
  articles: { title: string; url: string }[];
  quiz: ParsedQuizQuestion[];
}

interface ParsedSemester {
  number: 1 | 2;
  courses: ParsedCourse[];
}

interface ParsedYear {
  level: 100 | 200 | 300 | 400;
  goal: string;
  semesters: ParsedSemester[];
}

interface ParsedDepartment {
  name: string;
  years: ParsedYear[];
}

// ── Parser ────────────────────────────────────────────────────────────────────

function parseDepartmentFile(content: string): ParsedDepartment {
  const lines = content.split('\n');
  const dept: ParsedDepartment = { name: '', years: [] };

  let currentYear: ParsedYear | null = null;
  let currentSemester: ParsedSemester | null = null;
  let currentCourse: ParsedCourse | null = null;
  let mode: 'none' | 'classes' | 'articles' | 'quiz' = 'none';

  // Extract department name from first H1
  for (const line of lines) {
    const h1 = line.match(/^#\s+(.+)/);
    if (h1) {
      dept.name = h1[1].replace(' Curriculum', '').trim();
      break;
    }
  }

  function saveCourse() {
    if (currentCourse && currentSemester) {
      currentSemester.courses.push(currentCourse);
    }
    currentCourse = null;
    mode = 'none';
  }

  function saveSemester() {
    saveCourse();
    if (currentSemester && currentYear) {
      currentYear.semesters.push(currentSemester);
    }
    currentSemester = null;
  }

  function saveYear() {
    saveSemester();
    if (currentYear) {
      dept.years.push(currentYear);
    }
    currentYear = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // YEAR header: ## YEAR 100 — ...
    const yearMatch = trimmed.match(/^##\s+YEAR\s+(\d+)/i);
    if (yearMatch) {
      saveYear();
      const level = parseInt(yearMatch[1]) as 100 | 200 | 300 | 400;
      // Look ahead for Goal line
      let goal = '';
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const goalMatch = lines[j].match(/\*\*Goal:\*\*\s*(.+)/);
        if (goalMatch) { goal = goalMatch[1].trim(); break; }
      }
      currentYear = { level, goal, semesters: [] };
      continue;
    }

    // Semester header: ### Semester 1
    const semMatch = trimmed.match(/^###\s+Semester\s+(\d+)/i);
    if (semMatch) {
      saveSemester();
      const num = parseInt(semMatch[1]) as 1 | 2;
      currentSemester = { number: num, courses: [] };
      continue;
    }

    // Course header: **CODE101 — Course Name** *(3 Credits)*
    const courseMatch = trimmed.match(/^\*\*([A-Z]{1,5}\d+[A-Z]?)\s*[–—]\s*(.+?)\*\*(?:\s*\*\((\d+)\s+Credits?\)\*)?/);
    if (courseMatch && currentSemester) {
      saveCourse();
      const code = courseMatch[1].trim();
      const name = courseMatch[2].trim();
      const credits = courseMatch[3] ? parseInt(courseMatch[3]) : 3;
      const isPremium = currentYear ? currentYear.level >= 400 : false;

      // Look ahead for description
      let description = '';
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const descMatch = lines[j].match(/^\*Description:\*\s*(.+)/);
        if (descMatch) { description = descMatch[1].trim(); break; }
      }

      currentCourse = {
        code, name, description, credits, isPremium,
        aiSummary: '', classes: [], articles: [], quiz: [],
      };
      mode = 'none';
      continue;
    }

    if (!currentCourse) continue;

    // Section markers
    if (trimmed === '*Classes:*') { mode = 'classes'; continue; }
    if (trimmed === '*Related Articles:*') { mode = 'articles'; continue; }
    if (trimmed.startsWith('*Quiz')) { mode = 'quiz'; continue; }
    if (trimmed.startsWith('*AI Summary:*')) {
      mode = 'none';
      currentCourse.aiSummary = trimmed.replace(/^\*AI Summary:\*\s*/, '').trim();
      continue;
    }

    // Numbered list item: "1. Title — url"
    if (mode === 'classes') {
      const classMatch = trimmed.match(/^\d+\.\s+(.+?)\s+[–—]\s+(.+)/);
      if (classMatch) {
        const title = classMatch[1].trim();
        const urlPart = classMatch[2].trim();
        const url = urlPart.startsWith('[FIND:') ? null : urlPart;
        currentCourse.classes.push({ title, url });
      }
    }
    else if (mode === 'articles') {
      const artMatch = trimmed.match(/^-\s+(.+?):\s+(https?:\/\/.+)/);
      if (artMatch) {
        currentCourse.articles.push({ title: artMatch[1].trim(), url: artMatch[2].trim() });
      }
    }
    else if (mode === 'quiz') {
      const quizMatch = trimmed.match(/^\d+\.\s+(.+?)\s+[–—]\s+\*\*Answer:\*\*\s*(.+)/);
      if (quizMatch) {
        currentCourse.quiz.push({
          question: quizMatch[1].trim(),
          answer: quizMatch[2].trim(),
        });
      }
    }
  }

  saveYear();
  return dept;
}

// ── DB helpers ────────────────────────────────────────────────────────────────

async function getOrCreateYear(level: number, name: string): Promise<string> {
  const { data: existing } = await supabase
    .from('years').select('id').eq('level', level).maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('years').insert({ level, name }).select('id').single();
  if (error) throw new Error(`Year insert failed: ${error.message}`);
  return data.id;
}

async function getOrCreateSemester(yearId: string, number: number): Promise<string> {
  const { data: existing } = await supabase
    .from('semesters').select('id').eq('year_id', yearId).eq('number', number).maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('semesters').insert({ year_id: yearId, number }).select('id').single();
  if (error) throw new Error(`Semester insert failed: ${error.message}`);
  return data.id;
}

async function getOrCreateCourse(yearId: string, semesterId: string, course: ParsedCourse, sortOrder: number): Promise<string> {
  const { data: existing } = await supabase
    .from('courses').select('id').eq('code', course.code).maybeSingle();
  if (existing) {
    console.log(`    ↩ Course exists: ${course.code}`);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('courses')
    .insert({
      year_id: yearId,
      semester_id: semesterId,
      code: course.code.toUpperCase(),
      name: course.name,
      description: course.description || '',
      credit_units: course.credits,
      pass_mark: course.isPremium ? 70 : 60,
      sort_order: sortOrder,
      is_premium: course.isPremium,
      status: 'published',
    })
    .select('id')
    .single();

  if (error) throw new Error(`Course insert failed for ${course.code}: ${error.message}`);
  return data.id;
}

async function seedLessons(courseId: string, course: ParsedCourse): Promise<void> {
  // Check if lessons already exist
  const { data: existing } = await supabase
    .from('lessons').select('id').eq('course_id', courseId).limit(1);
  if (existing && existing.length > 0) {
    console.log(`      ↩ Lessons already seeded for ${course.code}`);
    return;
  }

  // Insert AI Summary as first "lesson" if it exists
  if (course.aiSummary) {
    const { data: summaryLesson, error: sErr } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        title: 'Course Overview & Summary',
        content: course.aiSummary,
        sort_order: 1,
        is_published: true,
      })
      .select('id')
      .single();

    if (sErr) console.warn(`      ⚠ Summary lesson failed for ${course.code}: ${sErr.message}`);

    // Attach articles as resources to summary lesson
    if (summaryLesson && course.articles.length > 0) {
      for (let i = 0; i < course.articles.length; i++) {
        const art = course.articles[i];
        await supabase.from('resources').insert({
          lesson_id: summaryLesson.id,
          type: 'article',
          title: art.title,
          url: art.url,
          sort_order: i + 1,
        });
      }
    }
  }

  // Insert each class as a lesson with its video resource
  for (let i = 0; i < course.classes.length; i++) {
    const cls = course.classes[i];
    const { data: lesson, error: lErr } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        title: cls.title,
        content: null,
        sort_order: i + 2,  // +2 because sort_order 1 is the summary lesson
        is_published: true,
      })
      .select('id')
      .single();

    if (lErr) {
      console.warn(`      ⚠ Lesson insert failed "${cls.title}": ${lErr.message}`);
      continue;
    }

    // Attach YouTube video resource if URL is real
    if (cls.url) {
      await supabase.from('resources').insert({
        lesson_id: lesson.id,
        type: 'youtube',
        title: cls.title,
        url: cls.url,
        sort_order: 1,
      });
    }
  }
}

async function seedQuestions(courseId: string, course: ParsedCourse): Promise<void> {
  if (course.quiz.length === 0) return;

  // Check if questions already exist
  const { data: existing } = await supabase
    .from('questions').select('id').eq('course_id', courseId).limit(1);
  if (existing && existing.length > 0) {
    console.log(`      ↩ Questions already seeded for ${course.code}`);
    return;
  }

  for (const q of course.quiz) {
    // Store as multiple choice with correct answer + placeholder wrong options
    // Admin can add real distractors later via the admin panel
    const options = [
      { text: q.answer, is_correct: true },
      { text: '(Add option B)', is_correct: false },
      { text: '(Add option C)', is_correct: false },
      { text: '(Add option D)', is_correct: false },
    ];

    const { error } = await supabase.from('questions').insert({
      course_id: courseId,
      type: 'multiple_choice',
      question_text: q.question,
      options,
      points: 1,
      shuffle_options: true,
      is_exam_question: false,
      difficulty: 1,
    });

    if (error) console.warn(`      ⚠ Question insert failed "${q.question}": ${error.message}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const SOURCE_DIR = join(
  process.cwd(),
  'docs/products/university/curriculum/_source-departments',
);

// Which files to seed — skip legacy/planning docs
const SEED_FILES = [
  'product-management.md',
  'product-design.md',
  'frontend.md',
  'backend.md',
  'scrum.md',
  'ops.md',
  'quality-analytics.md',
  'growth-marketing.md',
];

async function main() {
  console.log('🎓 Aorthar University Curriculum Seed\n');

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
    process.exit(1);
  }

  // Ensure year/semester scaffold exists (shared across all departments)
  console.log('📐 Ensuring year/semester scaffold…');
  const yearIds: Record<number, string> = {};
  const semesterIds: Record<string, string> = {};

  for (const level of [100, 200, 300, 400]) {
    const yearId = await getOrCreateYear(level, `Year ${level}`);
    yearIds[level] = yearId;
    for (const sem of [1, 2]) {
      const semId = await getOrCreateSemester(yearId, sem);
      semesterIds[`${level}-${sem}`] = semId;
    }
  }
  console.log('✅ Scaffold ready\n');

  for (const file of SEED_FILES) {
    const filePath = join(SOURCE_DIR, file);
    let content: string;
    try {
      content = readFileSync(filePath, 'utf-8');
    } catch {
      console.warn(`⚠ Skipping ${file} — file not found`);
      continue;
    }

    const dept = parseDepartmentFile(content);
    console.log(`\n📚 Seeding: ${dept.name} (${dept.years.length} years)`);

    for (const year of dept.years) {
      console.log(`\n  📅 Year ${year.level}`);
      const yearId = yearIds[year.level];
      if (!yearId) { console.warn(`  ⚠ No year ID for level ${year.level}`); continue; }

      for (const semester of year.semesters) {
        console.log(`    📖 Semester ${semester.number} (${semester.courses.length} courses)`);
        const semId = semesterIds[`${year.level}-${semester.number}`];
        if (!semId) { console.warn(`    ⚠ No semester ID for ${year.level}-${semester.number}`); continue; }

        for (let i = 0; i < semester.courses.length; i++) {
          const course = semester.courses[i];
          console.log(`      ➕ ${course.code} — ${course.name}`);

          const courseId = await getOrCreateCourse(yearId, semId, course, i + 1);
          await seedLessons(courseId, course);
          await seedQuestions(courseId, course);
        }
      }
    }

    console.log(`\n  ✅ ${dept.name} done`);
  }

  console.log('\n\n✅ All departments seeded successfully!');
  console.log('ℹ Quiz options labelled "(Add option B/C/D)" need real distractors — edit in admin panel.');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
