import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

type VideoResource = {
  title: string;
  url: string;
};

type ParsedCourse = {
  plannedCode: string;
  dbCode: string;
  name: string;
  description: string;
  videos: VideoResource[];
  yearLevel: number;
  semesterNumber: number;
  sourceFile: string;
  sourceLine: number;
};

type YearRow = {
  id: string;
  level: number;
};

type SemesterRow = {
  id: string;
  year_id: string;
  number: number;
};

type CourseRow = {
  id: string;
  code: string;
};

type LessonRow = {
  id: string;
  course_id: string;
  sort_order: number;
};

type ResourceRow = {
  lesson_id: string;
  title: string;
  url: string;
};

function stableUuid(input: string): string {
  const hash = crypto.createHash('md5').update(input).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20)}`;
}

function normalizeCourseCode(plannedCode: string): string {
  const match = plannedCode.match(/^([A-Z]{2,6})(\d{3})$/);
  if (!match) {
    throw new Error(`Invalid planned course code format: ${plannedCode}`);
  }

  const letters = match[1];
  const digits = match[2];

  if (letters.length === 3) {
    return `${letters}${digits}`;
  }

  if (letters.length < 3) {
    return `${letters.padEnd(3, 'X')}${digits}`;
  }

  return `${letters.slice(0, 3)}${digits}`;
}

function walkMarkdownFiles(rootDir: string): string[] {
  const ignoredDirectories = new Set([
    '.cache',
    '.git',
    '.next',
    '.temp',
    'build',
    'dist',
    'node_modules',
  ]);

  const output: string[] = [];

  function visit(currentDir: string): void {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name === '.DS_Store') continue;
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (ignoredDirectories.has(entry.name)) continue;
        visit(fullPath);
        continue;
      }

      if (!entry.isFile()) continue;
      if (!entry.name.toLowerCase().endsWith('.md')) continue;
      output.push(fullPath);
    }
  }

  visit(rootDir);
  return output.sort((leftPath, rightPath) => leftPath.localeCompare(rightPath));
}

function parseCourseMarkdown(markdown: string, sourceFile: string): ParsedCourse[] {
  const lines = markdown.split(/\r?\n/);

  const yearRegex = /^##\s+YEAR\s+(\d{3})\b/i;
  const semesterRegex = /^###\s+Semester\s+(\d+)\b/i;
  const courseRegex = /^\*\*([A-Z]{2,6}\d{3})\s+—\s+(.+?)\*\*\s*$/;
  const descriptionRegex = /^\*Description:\*\s*(.+)\s*$/;
  const videoRegex = /^-\s*(.+?):\s*(https?:\/\/\S+)\s*$/;

  const courses: ParsedCourse[] = [];
  let currentYear: number | null = null;
  let currentSemester: number | null = null;
  let currentCourse: ParsedCourse | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';

    const yearMatch = line.match(yearRegex);
    if (yearMatch) {
      currentYear = Number(yearMatch[1]);
      currentSemester = null;
      currentCourse = null;
      continue;
    }

    const semesterMatch = line.match(semesterRegex);
    if (semesterMatch && currentYear !== null) {
      currentSemester = Number(semesterMatch[1]);
      currentCourse = null;
      continue;
    }

    const courseMatch = line.match(courseRegex);
    if (courseMatch && currentYear !== null && currentSemester !== null) {
      const plannedCode = courseMatch[1].toUpperCase();
      currentCourse = {
        plannedCode,
        dbCode: normalizeCourseCode(plannedCode),
        name: courseMatch[2].trim(),
        description: '',
        videos: [],
        yearLevel: currentYear,
        semesterNumber: currentSemester,
        sourceFile,
        sourceLine: index + 1,
      };
      courses.push(currentCourse);
      continue;
    }

    if (!currentCourse) continue;

    const descriptionMatch = line.match(descriptionRegex);
    if (descriptionMatch) {
      currentCourse.description = descriptionMatch[1].trim();
      continue;
    }

    const videoMatch = line.match(videoRegex);
    if (videoMatch) {
      currentCourse.videos.push({
        title: videoMatch[1].trim(),
        url: videoMatch[2].trim(),
      });
    }
  }

  return courses;
}

function chooseBetterCourse(existingCourse: ParsedCourse, nextCourse: ParsedCourse): ParsedCourse {
  const existingScore = existingCourse.description.length + existingCourse.videos.length * 100;
  const nextScore = nextCourse.description.length + nextCourse.videos.length * 100;

  if (nextScore > existingScore) {
    return nextCourse;
  }

  return existingCourse;
}

function loadPlannedCourses(markdownRoot: string): { courses: ParsedCourse[]; filesScanned: number } {
  const markdownFiles = walkMarkdownFiles(markdownRoot);
  const byPlannedCode = new Map<string, ParsedCourse>();

  for (const filePath of markdownFiles) {
    const markdown = fs.readFileSync(filePath, 'utf8');
    const parsedCourses = parseCourseMarkdown(markdown, filePath);

    for (const course of parsedCourses) {
      const existingCourse = byPlannedCode.get(course.plannedCode);
      if (!existingCourse) {
        byPlannedCode.set(course.plannedCode, course);
        continue;
      }

      byPlannedCode.set(course.plannedCode, chooseBetterCourse(existingCourse, course));
    }
  }

  const sortedCourses = Array.from(byPlannedCode.values()).sort((leftCourse, rightCourse) => {
    if (leftCourse.yearLevel !== rightCourse.yearLevel) {
      return leftCourse.yearLevel - rightCourse.yearLevel;
    }

    if (leftCourse.semesterNumber !== rightCourse.semesterNumber) {
      return leftCourse.semesterNumber - rightCourse.semesterNumber;
    }

    return leftCourse.plannedCode.localeCompare(rightCourse.plannedCode);
  });

  return {
    courses: sortedCourses,
    filesScanned: markdownFiles.length,
  };
}

async function main(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE URL or service role key. Set SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/SERVICE_ROLE_KEY.',
    );
  }

  const markdownRoot = path.resolve(process.cwd(), '..');
  const { courses, filesScanned } = loadPlannedCourses(markdownRoot);

  if (courses.length === 0) {
    throw new Error(`No curriculum courses found in markdown files under ${markdownRoot}.`);
  }

  const plannedCodeByDbCode = new Map<string, string>();
  const normalizedMappings: Array<{ plannedCode: string; dbCode: string }> = [];

  for (const course of courses) {
    const existingPlannedCode = plannedCodeByDbCode.get(course.dbCode);

    if (existingPlannedCode && existingPlannedCode !== course.plannedCode) {
      throw new Error(
        `Normalized code collision: ${existingPlannedCode} and ${course.plannedCode} both map to ${course.dbCode}.`,
      );
    }

    plannedCodeByDbCode.set(course.dbCode, course.plannedCode);

    if (course.plannedCode !== course.dbCode) {
      normalizedMappings.push({ plannedCode: course.plannedCode, dbCode: course.dbCode });
    }
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const yearLevels = Array.from(new Set(courses.map((course) => course.yearLevel))).sort(
    (leftLevel, rightLevel) => leftLevel - rightLevel,
  );

  const yearUpserts = yearLevels.map((yearLevel) => ({
    level: yearLevel,
    name: `Year ${yearLevel}`,
    description: `Aorthar curriculum year ${yearLevel}`,
    sort_order: yearLevel,
  }));

  const { error: yearUpsertError } = await supabase
    .from('years')
    .upsert(yearUpserts, { onConflict: 'level' });

  if (yearUpsertError) {
    throw new Error(`Failed to upsert years: ${yearUpsertError.message}`);
  }

  const { data: years, error: yearSelectError } = await supabase
    .from('years')
    .select('id, level')
    .in('level', yearLevels);

  if (yearSelectError || !years) {
    throw new Error(`Failed to read years: ${yearSelectError?.message ?? 'No year data returned.'}`);
  }

  const yearIdByLevel = new Map<number, string>(
    (years as YearRow[]).map((year) => [year.level, year.id]),
  );

  const semesterPairs = new Map<string, { yearLevel: number; number: number }>();
  for (const course of courses) {
    const key = `${course.yearLevel}-${course.semesterNumber}`;
    if (!semesterPairs.has(key)) {
      semesterPairs.set(key, { yearLevel: course.yearLevel, number: course.semesterNumber });
    }
  }

  const semesterUpserts = Array.from(semesterPairs.values()).map((semester) => {
    const yearId = yearIdByLevel.get(semester.yearLevel);
    if (!yearId) {
      throw new Error(`Missing year id for level ${semester.yearLevel}.`);
    }

    return {
      year_id: yearId,
      number: semester.number,
      name: `Semester ${semester.number}`,
    };
  });

  const { error: semesterUpsertError } = await supabase
    .from('semesters')
    .upsert(semesterUpserts, { onConflict: 'year_id,number' });

  if (semesterUpsertError) {
    throw new Error(`Failed to upsert semesters: ${semesterUpsertError.message}`);
  }

  const yearIds = Array.from(yearIdByLevel.values());
  const { data: semesters, error: semesterSelectError } = await supabase
    .from('semesters')
    .select('id, year_id, number')
    .in('year_id', yearIds);

  if (semesterSelectError || !semesters) {
    throw new Error(`Failed to read semesters: ${semesterSelectError?.message ?? 'No semester data returned.'}`);
  }

  const yearLevelByYearId = new Map<string, number>(
    yearLevels.map((yearLevel) => {
      const yearId = yearIdByLevel.get(yearLevel);
      if (!yearId) {
        throw new Error(`Missing year id for level ${yearLevel}.`);
      }

      return [yearId, yearLevel];
    }),
  );

  const semesterIdByKey = new Map<string, string>();
  for (const semester of semesters as SemesterRow[]) {
    const yearLevel = yearLevelByYearId.get(semester.year_id);
    if (!yearLevel) continue;
    semesterIdByKey.set(`${yearLevel}-${semester.number}`, semester.id);
  }

  const courseUpserts = courses.map((course) => {
    const yearId = yearIdByLevel.get(course.yearLevel);
    const semesterId = semesterIdByKey.get(`${course.yearLevel}-${course.semesterNumber}`);

    if (!yearId || !semesterId) {
      throw new Error(`Missing placement for course ${course.plannedCode}.`);
    }

    const description =
      (course.plannedCode === course.dbCode
        ? course.description
        : `[Planned code: ${course.plannedCode}] ${course.description}`).trim() ||
      `${course.name} course content imported from curriculum markdown.`;

    return {
      id: stableUuid(`aorthar-course-${course.dbCode}`),
      code: course.dbCode,
      name: course.name,
      description,
      year_id: yearId,
      semester_id: semesterId,
      credit_units: 3,
      is_premium: course.yearLevel >= 400,
      status: 'published',
    };
  });

  const { error: courseUpsertError } = await supabase
    .from('courses')
    .upsert(courseUpserts, { onConflict: 'code' });

  if (courseUpsertError) {
    throw new Error(`Failed to upsert courses: ${courseUpsertError.message}`);
  }

  const dbCodes = courses.map((course) => course.dbCode);
  const { data: courseRows, error: courseSelectError } = await supabase
    .from('courses')
    .select('id, code')
    .in('code', dbCodes);

  if (courseSelectError || !courseRows) {
    throw new Error(`Failed to read courses after upsert: ${courseSelectError?.message ?? 'No course data returned.'}`);
  }

  const courseIdByCode = new Map<string, string>(
    (courseRows as CourseRow[]).map((courseRow) => [courseRow.code, courseRow.id]),
  );

  const courseIds = Array.from(courseIdByCode.values());
  const { data: existingLessons, error: lessonSelectError } = await supabase
    .from('lessons')
    .select('id, course_id, sort_order')
    .in('course_id', courseIds)
    .eq('sort_order', 1);

  if (lessonSelectError) {
    throw new Error(`Failed to read existing lessons: ${lessonSelectError.message}`);
  }

  const existingLessonIdByCourseId = new Map<string, string>(
    ((existingLessons ?? []) as LessonRow[]).map((lesson) => [lesson.course_id, lesson.id]),
  );

  const lessonUpserts = courses.map((course) => {
    const courseId = courseIdByCode.get(course.dbCode);
    if (!courseId) {
      throw new Error(`Missing course id for code ${course.dbCode}.`);
    }

    const lessonId = existingLessonIdByCourseId.get(courseId) ?? stableUuid(`aorthar-lesson-${course.dbCode}-1`);
    return {
      id: lessonId,
      course_id: courseId,
      title: `${course.name} Overview`,
      content:
        course.plannedCode === course.dbCode
          ? course.description
          : `Planned code: ${course.plannedCode}\n\n${course.description}`,
      sort_order: 1,
      is_published: true,
    };
  });

  const { error: lessonUpsertError } = await supabase
    .from('lessons')
    .upsert(lessonUpserts, { onConflict: 'id' });

  if (lessonUpsertError) {
    throw new Error(`Failed to upsert lessons: ${lessonUpsertError.message}`);
  }

  const lessonIdByCourseCode = new Map<string, string>(
    lessonUpserts.map((lesson, index) => [courses[index]?.dbCode ?? '', lesson.id]),
  );

  const lessonIds = lessonUpserts.map((lesson) => lesson.id);
  const { data: existingResources, error: resourceSelectError } = await supabase
    .from('resources')
    .select('lesson_id, title, url')
    .in('lesson_id', lessonIds);

  if (resourceSelectError) {
    throw new Error(`Failed to read existing resources: ${resourceSelectError.message}`);
  }

  const existingResourceKeys = new Set<string>(
    ((existingResources ?? []) as ResourceRow[]).map(
      (resource) => `${resource.lesson_id}||${resource.title}||${resource.url}`,
    ),
  );

  const resourcesToInsert = courses.flatMap((course) => {
    const lessonId = lessonIdByCourseCode.get(course.dbCode);
    if (!lessonId) {
      throw new Error(`Missing lesson id for course ${course.dbCode}.`);
    }

    return course.videos
      .map((video, index) => ({
        id: stableUuid(`aorthar-resource-${course.dbCode}-1-${index + 1}`),
        lesson_id: lessonId,
        type: video.url.includes('youtube.com') || video.url.includes('youtu.be') ? 'youtube' : 'link',
        title: video.title,
        url: video.url,
        sort_order: index + 1,
      }))
      .filter((resource) => !existingResourceKeys.has(`${resource.lesson_id}||${resource.title}||${resource.url}`));
  });

  if (resourcesToInsert.length > 0) {
    const { error: resourceInsertError } = await supabase
      .from('resources')
      .insert(resourcesToInsert);

    if (resourceInsertError) {
      throw new Error(`Failed to insert resources: ${resourceInsertError.message}`);
    }
  }

  console.log(`Scanned ${filesScanned} markdown files under ${markdownRoot}.`);
  console.log(`Loaded ${courses.length} courses into production-ready tables.`);
  console.log(`Upserted ${lessonUpserts.length} lessons and inserted ${resourcesToInsert.length} resources.`);

  if (normalizedMappings.length > 0) {
    console.log(
      `Normalized ${normalizedMappings.length} course codes for DB constraint: ${normalizedMappings.map((entry) => `${entry.plannedCode}->${entry.dbCode}`).join(', ')}`,
    );
  }

  const sample = courses
    .slice(0, 5)
    .map((course) => `${course.plannedCode}/${course.dbCode} (${course.yearLevel}/S${course.semesterNumber})`);
  console.log(`Sample courses: ${sample.join(', ')}`);
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
    process.exit(1);
  }

  console.error('Unknown error while seeding curriculum from markdown.');
  process.exit(1);
});
