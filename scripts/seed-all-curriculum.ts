/**
 * Aorthar University — Fast Curriculum Seed Script
 *
 * Parses all 15 department markdown files and batch-inserts into Supabase.
 * Uses batch inserts instead of individual calls — 100x faster.
 *
 * Run:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... bun run scripts/seed-all-curriculum.ts
 *
 * Idempotent — skips existing records. Safe to re-run.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// ── Supabase admin client ─────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Department files ──────────────────────────────────────────────────────────

const DEPT_FILES = [
  'product-management.md',
  'product-design.md',
  'frontend.md',
  'backend.md',
  'qa.md',
  'scrum.md',
  'operations.md',
  'growth.md',
  'social-media.md',
  'video-editing.md',
  'content.md',
  'hr.md',
  'project-manager.md',
  'ceo.md',
  'devops.md',
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface ParsedClass {
  title: string;
  url: string | null;
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

    const yearMatch = trimmed.match(/^##\s+YEAR\s+(\d+)/i);
    if (yearMatch) {
      saveYear();
      const level = parseInt(yearMatch[1]) as 100 | 200 | 300 | 400;
      if ([100, 200, 300, 400].includes(level)) {
        currentYear = { level, semesters: [] };
      }
      continue;
    }

    const semMatch = trimmed.match(/^###\s+Semester\s+(\d+)/i);
    if (semMatch && currentYear) {
      saveSemester();
      const num = parseInt(semMatch[1]) as 1 | 2;
      currentSemester = { number: num, courses: [] };
      continue;
    }

    if (trimmed.startsWith('*See:')) continue;

    const courseMatch = trimmed.match(/^\*\*([A-Z]{1,5}\d+[A-Z]?)\s*[–—]\s*(.+?)\*\*(?:\s*\*\((\d+)\s+Credits?\)\*)?/);
    if (courseMatch && currentSemester) {
      saveCourse();
      const code = courseMatch[1].trim();
      const name = courseMatch[2].trim();
      const credits = courseMatch[3] ? parseInt(courseMatch[3]) : 3;
      const isPremium = currentYear ? currentYear.level >= 400 : false;

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

    if (trimmed === '*Classes:*') { mode = 'classes'; continue; }
    if (trimmed === '*Related Articles:*') { mode = 'articles'; continue; }
    if (trimmed.startsWith('*Quiz')) { mode = 'quiz'; continue; }
    if (trimmed.startsWith('*AI Summary:*')) {
      mode = 'none';
      currentCourse.aiSummary = trimmed.replace(/^\*AI Summary:\*\s*/, '').trim();
      continue;
    }

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

// ── Batch Helpers ─────────────────────────────────────────────────────────────

async function getExistingCodes(): Promise<Set<string>> {
  const { data } = await supabase.from('courses').select('code');
  return new Set(data?.map((c: { code: string }) => c.code) || []);
}

async function getExistingLessonCourseIds(): Promise<Set<string>> {
  const { data } = await supabase.from('lessons').select('course_id');
  return new Set(data?.map((l: { course_id: string }) => l.course_id) || []);
}

async function getExistingQuestionCourseIds(): Promise<Set<string>> {
  const { data } = await supabase.from('questions').select('course_id');
  return new Set(data?.map((q: { course_id: string }) => q.course_id) || []);
}

// Batch insert in chunks of 100
async function batchInsert(table: string, rows: Record<string, unknown>[], chunkSize = 100): Promise<number> {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) {
      console.warn(`      ⚠ Batch insert failed on ${table} (chunk ${i}): ${error.message}`);
    } else {
      inserted += chunk.length;
    }
  }
  return inserted;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const CURRICULUM_DIR = join(process.cwd(), 'docs/products/university/curriculum');

async function main() {
  console.log('🎓 Aorthar University — Fast Curriculum Seed\n');

  // 1. Ensure year/semester scaffold
  console.log('📐 Ensuring year/semester scaffold…');
  const yearNames: Record<number, string> = {
    100: 'Foundations',
    200: 'Intermediate',
    300: 'Advanced',
    400: 'Professional Practice',
  };

  const yearIds: Record<number, string> = {};
  const semesterIds: Record<string, string> = {};

  for (const level of [100, 200, 300, 400]) {
    const { data: existingYear } = await supabase
      .from('years').select('id').eq('level', level).maybeSingle();
    if (existingYear) {
      yearIds[level] = existingYear.id;
    } else {
      const { data } = await supabase
        .from('years').insert({ level, name: yearNames[level], sort_order: level / 100 }).select('id').single();
      if (data) yearIds[level] = data.id;
    }

    for (const sem of [1, 2]) {
      const { data: existingSem } = await supabase
        .from('semesters').select('id').eq('year_id', yearIds[level]).eq('number', sem).maybeSingle();
      if (existingSem) {
        semesterIds[`${level}-${sem}`] = existingSem.id;
      } else {
        const { data } = await supabase
          .from('semesters').insert({
            year_id: yearIds[level],
            number: sem,
            name: sem === 1 ? 'First Semester' : 'Second Semester',
          }).select('id').single();
        if (data) semesterIds[`${level}-${sem}`] = data.id;
      }
    }
  }
  console.log('✅ Scaffold ready\n');

  // 2. Parse all departments
  console.log('📂 Parsing markdown files…');
  const allCourses: Array<{
    yearId: string;
    semesterId: string;
    code: string;
    name: string;
    description: string;
    credit_units: number;
    is_premium: boolean;
    department: string;
    sort_order: number;
    aiSummary: string;
    classes: ParsedClass[];
    articles: { title: string; url: string }[];
    quiz: ParsedQuizQuestion[];
  }> = [];

  let skippedFiles = 0;

  for (const file of DEPT_FILES) {
    const filePath = join(CURRICULUM_DIR, file);
    let content: string;
    try {
      content = readFileSync(filePath, 'utf-8');
    } catch {
      console.warn(`⚠ Skipping ${file} — not found`);
      skippedFiles++;
      continue;
    }

    const dept = parseDepartmentFile(content);
    if (!dept.name || dept.years.length === 0) {
      console.warn(`⚠ Skipping ${file} — no valid data`);
      skippedFiles++;
      continue;
    }

    console.log(`   ✅ ${dept.name}: ${dept.years.reduce((a, y) => a + y.semesters.reduce((b, s) => b + s.courses.length, 0), 0)} courses`);

    for (const year of dept.years) {
      const yearId = yearIds[year.level];
      if (!yearId) continue;

      for (const semester of year.semesters) {
        const semId = semesterIds[`${year.level}-${semester.number}`];
        if (!semId) continue;

        for (let i = 0; i < semester.courses.length; i++) {
          const course = semester.courses[i];
          allCourses.push({
            yearId,
            semesterId: semId,
            code: course.code.toUpperCase(),
            name: course.name,
            description: course.description || '',
            credit_units: Math.min(course.credits, 6),
            is_premium: course.isPremium,
            department: dept.name,
            sort_order: i + 1,
            aiSummary: course.aiSummary,
            classes: course.classes,
            articles: course.articles,
            quiz: course.quiz,
          });
        }
      }
    }
  }

  console.log(`\n📊 Total courses parsed: ${allCourses.length}\n`);

  // 3. Batch insert courses (skip existing)
  console.log('📝 Inserting courses…');
  const existingCodes = await getExistingCodes();
  const newCourses = allCourses.filter(c => !existingCodes.has(c.code));

  const courseInserts = newCourses.map(c => ({
    year_id: c.yearId,
    semester_id: c.semesterId,
    code: c.code,
    name: c.name,
    description: c.description,
    credit_units: c.credit_units,
    pass_mark: c.is_premium ? 70 : 60,
    sort_order: c.sort_order,
    is_premium: c.is_premium,
    status: 'published' as const,
    department: c.department,
  }));

  const coursesInserted = await batchInsert('courses', courseInserts);
  console.log(`   ✅ ${coursesInserted} new courses inserted (${existingCodes.size} skipped)`);

  // 4. Get all course IDs (existing + new)
  console.log('\n📝 Inserting lessons…');
  const { data: allCourseData } = await supabase
    .from('courses').select('id, code');
  const courseMap = new Map<string, string>();
  for (const c of (allCourseData || [])) {
    courseMap.set(c.code, c.id);
  }

  // Check which courses already have lessons (even partially)
  // Fetch ALL lessons (no filter) to avoid IN clause limits
  const { data: existingLessons } = await supabase
    .from('lessons').select('course_id');
  const coursesWithLessons = new Set<string>();
  for (const l of (existingLessons || [])) {
    coursesWithLessons.add(l.course_id);
  }

  // Only seed courses that have NO lessons at all
  const coursesNeedingLessons = allCourses.filter(
    c => !coursesWithLessons.has(courseMap.get(c.code) || '')
  );

  let lessonsInserted = 0;
  let resourcesInserted = 0;

  for (const course of coursesNeedingLessons) {
    const courseId = courseMap.get(course.code);
    if (!courseId) continue;

    const lessonRows: Record<string, unknown>[] = [];
    const resourceRows: Record<string, unknown>[] = [];
    let lessonOrder = 1;
    const lessonIdMap = new Map<number, string>(); // sort_order → temp key

    // Summary lesson
    if (course.aiSummary) {
      const summaryKey = `summary_${courseId}`;
      lessonRows.push({
        course_id: courseId,
        title: 'Course Overview & Summary',
        content: course.aiSummary,
        sort_order: lessonOrder,
        is_published: true,
      });
      lessonIdMap.set(lessonOrder, summaryKey);

      // Article resources
      for (let i = 0; i < course.articles.length; i++) {
        const art = course.articles[i];
        resourceRows.push({
          lesson_sort_order: lessonOrder,
          course_code: course.code,
          type: 'link',
          title: art.title,
          url: art.url,
          sort_order: i + 1,
        });
      }
      lessonOrder++;
    }

    // Class lessons
    for (let i = 0; i < course.classes.length; i++) {
      const cls = course.classes[i];
      lessonRows.push({
        course_id: courseId,
        title: cls.title,
        content: null,
        sort_order: lessonOrder,
        is_published: true,
      });

      if (cls.url && cls.url.startsWith('http')) {
        resourceRows.push({
          lesson_sort_order: lessonOrder,
          course_code: course.code,
          type: 'youtube',
          title: cls.title,
          url: cls.url,
          sort_order: 1,
        });
      }
      lessonOrder++;
    }

    // Insert lessons
    if (lessonRows.length > 0) {
      const { error } = await supabase.from('lessons').insert(lessonRows);
      if (error) {
        console.warn(`      ⚠ Lessons failed for ${course.code}: ${error.message}`);
      } else {
        lessonsInserted += lessonRows.length;

        // Now insert resources — need to look up lesson IDs by sort_order
        if (resourceRows.length > 0) {
          const { data: insertedLessons } = await supabase
            .from('lessons')
            .select('id, sort_order')
            .eq('course_id', courseId);

          const lessonIdByOrder = new Map<number, string>();
          for (const l of (insertedLessons || [])) {
            lessonIdByOrder.set(l.sort_order, l.id);
          }

          const actualResourceRows = resourceRows.map(r => ({
            lesson_id: lessonIdByOrder.get((r as any).lesson_sort_order),
            type: (r as any).type,
            title: (r as any).title,
            url: (r as any).url,
            sort_order: (r as any).sort_order,
          })).filter(r => r.lesson_id);

          if (actualResourceRows.length > 0) {
            const { error: rErr } = await supabase.from('resources').insert(actualResourceRows);
            if (rErr) {
              console.warn(`      ⚠ Resources failed for ${course.code}: ${rErr.message}`);
            } else {
              resourcesInserted += actualResourceRows.length;
            }
          }
        }
      }
    }
  }

  console.log(`   ✅ ${lessonsInserted} lessons, ${resourcesInserted} resources inserted`);

  // 5. Batch insert questions
  console.log('\n📝 Inserting questions…');
  const existingQuestionCourseIds = await getExistingQuestionCourseIds();
  const coursesNeedingQuestions = allCourses.filter(
    c => c.quiz.length > 0 && !existingQuestionCourseIds.has(courseMap.get(c.code) || '')
  );

  let questionsInserted = 0;
  for (const course of coursesNeedingQuestions) {
    const courseId = courseMap.get(course.code);
    if (!courseId) continue;

    const questionRows = course.quiz.map(q => ({
      course_id: courseId,
      type: 'multiple_choice' as const,
      question_text: q.question,
      options: [
        { text: q.answer, is_correct: true },
        { text: '(Add option B)', is_correct: false },
        { text: '(Add option C)', is_correct: false },
        { text: '(Add option D)', is_correct: false },
      ],
      explanation: q.answer,
      points: 1,
      shuffle_options: true,
      is_exam_question: false,
      difficulty: 1,
    }));

    const inserted = await batchInsert('questions', questionRows);
    questionsInserted += inserted;
  }

  console.log(`   ✅ ${questionsInserted} questions inserted`);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 SEED COMPLETE');
  console.log('='.repeat(60));
  console.log(`   Courses:    ${courseInserts.length} new`);
  console.log(`   Lessons:    ${lessonsInserted}`);
  console.log(`   Resources:  ${resourcesInserted}`);
  console.log(`   Questions:  ${questionsInserted}`);
  console.log(`   Skipped:    ${skippedFiles} files`);
  console.log('='.repeat(60));
  console.log('\nℹ Quiz options labelled "(Add option B/C/D)" need real distractors.');
  console.log('   Edit questions via the admin panel at /admin/courses/[id].');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
