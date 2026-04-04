/**
 * One-time curriculum seed endpoint.
 * Call via browser: fetch('/api/admin/seed-curriculum', { method: 'POST' })
 * Uses the server's Supabase admin client (service role key).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { readFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

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

interface ParsedClass { title: string; url: string | null; }
interface ParsedQuiz { question: string; answer: string; }
interface ParsedCourse {
  code: string; name: string; description: string; credits: number;
  isPremium: boolean; aiSummary: string;
  classes: ParsedClass[]; articles: { title: string; url: string }[]; quiz: ParsedQuiz[];
}
interface ParsedSemester { number: 1 | 2; courses: ParsedCourse[]; }
interface ParsedYear { level: 100 | 200 | 300 | 400; semesters: ParsedSemester[]; }
interface ParsedDept { name: string; years: ParsedYear[]; }

function parse(content: string): ParsedDept {
  const lines = content.split('\n');
  const dept: ParsedDept = { name: '', years: [] };
  let cy: ParsedYear | null = null, cs: ParsedSemester | null = null, cc: ParsedCourse | null = null;
  let mode: 'none' | 'classes' | 'articles' | 'quiz' = 'none';

  for (const line of lines) {
    const h1 = line.match(/^#\s+(.+)/);
    if (h1) { dept.name = h1[1].replace(' Curriculum', '').trim(); }

    const ym = line.trim().match(/^##\s+YEAR\s+(\d+)/i);
    if (ym) {
      if (cc && cs) cs.courses.push(cc);
      if (cs && cy) cy.semesters.push(cs);
      if (cy) dept.years.push(cy);
      cc = null; cs = null; mode = 'none';
      const lvl = parseInt(ym[1]) as 100 | 200 | 300 | 400;
      if ([100, 200, 300, 400].includes(lvl)) cy = { level: lvl, semesters: [] };
      continue;
    }

    const sm = line.trim().match(/^###\s+Semester\s+(\d+)/i);
    if (sm && cy) {
      if (cc && cs) cs.courses.push(cc);
      cc = null; mode = 'none';
      cs = { number: parseInt(sm[1]) as 1 | 2, courses: [] };
      continue;
    }

    const cm = line.trim().match(/^\*\*([A-Z]{1,5}\d+[A-Z]?)\s*[–—]\s*(.+?)\*\*(?:\s*\*\((\d+)\s+Credits?\)\*)?/);
    if (cm && cs) {
      if (cc) cs.courses.push(cc);
      cc = null; mode = 'none';
      let desc = '';
      const idx = lines.indexOf(line);
      for (let j = idx + 1; j < Math.min(idx + 4, lines.length); j++) {
        const dm = lines[j].match(/^\*Description:\*\s*(.+)/);
        if (dm) { desc = dm[1].trim(); break; }
      }
      cc = {
        code: cm[1].trim(), name: cm[2].trim(),
        credits: cm[3] ? parseInt(cm[3]) : 3,
        isPremium: cy ? cy.level >= 400 : false,
        description: desc, aiSummary: '', classes: [], articles: [], quiz: [],
      };
      continue;
    }

    if (!cc) continue;
    const t = line.trim();
    if (t === '*Classes:*') { mode = 'classes'; continue; }
    if (t === '*Related Articles:*') { mode = 'articles'; continue; }
    if (t.startsWith('*Quiz')) { mode = 'quiz'; continue; }
    if (t.startsWith('*AI Summary:*')) {
      mode = 'none';
      cc.aiSummary = t.replace(/^\*AI Summary:\*\s*/, '').trim();
      continue;
    }

    if (mode === 'classes') {
      const m = t.match(/^\d+\.\s+(.+?)\s+[–—]\s+(.+)/);
      if (m) cc.classes.push({ title: m[1].trim(), url: m[2].trim().startsWith('[FIND:') ? null : m[2].trim() });
    } else if (mode === 'articles') {
      const m = t.match(/^-\s+(.+?):\s+(https?:\/\/.+)/);
      if (m) cc.articles.push({ title: m[1].trim(), url: m[2].trim() });
    } else if (mode === 'quiz') {
      const m = t.match(/^\d+\.\s+(.+?)\s+[–—]\s+\*\*Answer:\*\*\s*(.+)/);
      if (m) cc.quiz.push({ question: m[1].trim(), answer: m[2].trim() });
    }
  }

  if (cc && cs) cs.courses.push(cc);
  if (cs && cy) cy.semesters.push(cs);
  if (cy) dept.years.push(cy);
  return dept;
}

export async function POST() {
  return seed();
}

export async function GET() {
  return seed();
}

async function seed() {
  const supabase = createAdminClient();

  // 1. Ensure years/semesters
  const yearIds: Record<number, string> = {};
  const semIds: Record<string, string> = {};
  const names: Record<number, string> = { 100: 'Foundations', 200: 'Intermediate', 300: 'Advanced', 400: 'Professional Practice' };

  for (const lvl of [100, 200, 300, 400]) {
    let { data: y } = await supabase.from('years').select('id').eq('level', lvl).maybeSingle();
    if (!y) {
      const { data } = await supabase.from('years').insert({ level: lvl, name: names[lvl], sort_order: lvl / 100 }).select('id').single();
      y = data;
    }
    if (!y) continue;
    yearIds[lvl] = y.id;
    for (const s of [1, 2]) {
      let { data: sem } = await supabase.from('semesters').select('id').eq('year_id', y.id).eq('number', s).maybeSingle();
      if (!sem) {
        const { data } = await supabase.from('semesters').insert({ year_id: y.id, number: s, name: s === 1 ? 'First Semester' : 'Second Semester' }).select('id').single();
        sem = data;
      }
      if (!sem) continue;
      semIds[`${lvl}-${s}`] = sem.id;
    }
  }

  // 2. Get existing course codes
  const { data: existingCourses } = await supabase.from('courses').select('code');
  const existingCodes = new Set(existingCourses?.map((c: { code: string }) => c.code) || []);

  // 3. Parse and insert
  const CURRICULUM_DIR = join(process.cwd(), 'docs/products/university/curriculum');
  let totalCourses = 0, totalLessons = 0, totalResources = 0, totalQuestions = 0;

  for (const file of DEPT_FILES) {
    let content: string;
    try { content = readFileSync(join(CURRICULUM_DIR, file), 'utf-8'); } catch { continue; }

    const dept = parse(content);
    if (!dept.name) continue;

    for (const year of dept.years) {
      for (const semester of year.semesters) {
        const yearId = yearIds[year.level];
        const semId = semIds[`${year.level}-${semester.number}`];
        if (!yearId || !semId) continue;

        for (let i = 0; i < semester.courses.length; i++) {
          const course = semester.courses[i];
          if (existingCodes.has(course.code)) continue;

          const { data: courseData } = await supabase.from('courses').insert({
            year_id: yearId, semester_id: semId,
            code: course.code.toUpperCase(), name: course.name,
            description: course.description || '',
            credit_units: Math.min(course.credits, 6),
            pass_mark: course.isPremium ? 70 : 60,
            sort_order: i + 1, is_premium: course.isPremium,
            status: 'published', department: dept.name,
          }).select('id').single();

          if (!courseData) continue;
          totalCourses++;
          const courseId = courseData.id;

          // Lessons
          let order = 1;
          if (course.aiSummary) {
            const { data: lesson } = await supabase.from('lessons').insert({
              course_id: courseId, title: 'Course Overview & Summary',
              content: course.aiSummary, sort_order: order++, is_published: true,
            }).select('id').single();
            if (lesson) {
              for (let j = 0; j < course.articles.length; j++) {
                await supabase.from('resources').insert({
                  lesson_id: lesson.id, type: 'link',
                  title: course.articles[j].title, url: course.articles[j].url,
                  sort_order: j + 1,
                });
                totalResources++;
              }
            }
          }

          for (const cls of course.classes) {
            const { data: lesson } = await supabase.from('lessons').insert({
              course_id: courseId, title: cls.title,
              content: null, sort_order: order++, is_published: true,
            }).select('id').single();
            if (lesson) {
              totalLessons++;
              if (cls.url && cls.url.startsWith('http')) {
                await supabase.from('resources').insert({
                  lesson_id: lesson.id, type: 'youtube',
                  title: cls.title, url: cls.url, sort_order: 1,
                });
                totalResources++;
              }
            }
          }

          // Questions
          for (const q of course.quiz) {
            await supabase.from('questions').insert({
              course_id: courseId, type: 'multiple_choice',
              question_text: q.question,
              options: [
                { text: q.answer, is_correct: true },
                { text: '(Add option B)', is_correct: false },
                { text: '(Add option C)', is_correct: false },
                { text: '(Add option D)', is_correct: false },
              ],
              explanation: q.answer, points: 1,
              shuffle_options: true, is_exam_question: false, difficulty: 1,
            });
            totalQuestions++;
          }
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    courses: totalCourses,
    lessons: totalLessons,
    resources: totalResources,
    questions: totalQuestions,
  });
}
