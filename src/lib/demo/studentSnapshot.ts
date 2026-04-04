import fs from 'node:fs';
import path from 'node:path';

export type DemoCourse = {
  id: string;
  name: string;
  code: string;
  is_premium: boolean;
  credit_units: number;
};

type DemoResource = {
  id: string;
  type: string;
  title: string;
  url: string;
  sort_order: number;
};

type DemoLesson = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  duration_minutes: number;
  resources: DemoResource[];
};

export type DemoSemester = {
  id: string;
  number: number;
  courses: DemoCourse[];
};

export type DemoYear = {
  id: string;
  level: number;
  semesters: DemoSemester[];
};

type CurriculumCourseMeta = {
  id: string;
  code: string;
  name: string;
  description: string;
  videos: { title: string; url: string }[];
  yearLevel: number;
  semesterNumber: number;
  isPremium: boolean;
};

type CurriculumData = {
  years: DemoYear[];
  coursesById: Map<string, CurriculumCourseMeta>;
  coursesByCode: Map<string, CurriculumCourseMeta>;
};

function parseCurriculumMarkdown(markdown: string): CurriculumData {
  const years = new Map<number, DemoYear>();
  const coursesById = new Map<string, CurriculumCourseMeta>();
  const coursesByCode = new Map<string, CurriculumCourseMeta>();

  const lines = markdown.split(/\r?\n/);
  let currentYear: number | null = null;
  let currentSemester: number | null = null;
  let currentCourse: CurriculumCourseMeta | null = null;

  const yearRegex = /^##\s+YEAR\s+(\d{3})\b/i;
  const semesterRegex = /^###\s+Semester\s+(\d+)\b/i;
  const courseRegex = /^\*\*([A-Z]{2,5}\d{3})\s+—\s+(.+?)\*\*\s*$/;
  const descriptionRegex = /^\*Description:\*\s*(.+)\s*$/;
  const videoRegex = /^-\s*(.+?):\s*(https?:\/\/\S+)\s*$/;

  for (const line of lines) {
    const yearMatch = line.match(yearRegex);
    if (yearMatch) {
      currentYear = Number(yearMatch[1]);
      currentSemester = null;
      currentCourse = null;

      if (!years.has(currentYear)) {
        years.set(currentYear, {
          id: `year-${currentYear}`,
          level: currentYear,
          semesters: [],
        });
      }
      continue;
    }

    const semesterMatch = line.match(semesterRegex);
    if (semesterMatch && currentYear !== null) {
      currentSemester = Number(semesterMatch[1]);
      currentCourse = null;

      const yearRef = years.get(currentYear);
      if (yearRef && !yearRef.semesters.some((s) => s.number === currentSemester)) {
        yearRef.semesters.push({
          id: `sem-${currentYear}-${currentSemester}`,
          number: currentSemester,
          courses: [],
        });
      }
      continue;
    }

    const courseMatch = line.match(courseRegex);
    if (courseMatch && currentYear !== null && currentSemester !== null) {
      const code = courseMatch[1].toUpperCase();
      const name = courseMatch[2].trim();
      const id = code.toLowerCase();
      const isPremium = currentYear >= 400;

      const course: DemoCourse = {
        id,
        code,
        name,
        is_premium: isPremium,
        credit_units: 3,
      };

      const yearRef = years.get(currentYear);
      const semesterRef = yearRef?.semesters.find((s) => s.number === currentSemester);
      semesterRef?.courses.push(course);

      currentCourse = {
        id,
        code,
        name,
        description: '',
        videos: [],
        yearLevel: currentYear,
        semesterNumber: currentSemester,
        isPremium,
      };
      coursesById.set(id, currentCourse);
      coursesByCode.set(code, currentCourse);
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

  const normalizedYears = Array.from(years.values())
    .sort((a, b) => a.level - b.level)
    .map((year) => ({
      ...year,
      semesters: year.semesters.sort((a, b) => a.number - b.number),
    }));

  return {
    years: normalizedYears,
    coursesById,
    coursesByCode,
  };
}

function loadCurriculumData(): CurriculumData {
  const candidatePaths = [
    path.resolve(process.cwd(), 'docs/products/university/curriculum/product-management.md'),
    path.resolve(process.cwd(), '../docs/products/university/curriculum/product-management.md'),
  ];

  for (const filePath of candidatePaths) {
    if (!fs.existsSync(filePath)) continue;
    const markdown = fs.readFileSync(filePath, 'utf8');
    const parsed = parseCurriculumMarkdown(markdown);
    if (parsed.years.length > 0) return parsed;
  }

  return {
    years: [],
    coursesById: new Map(),
    coursesByCode: new Map(),
  };
}

const curriculum = loadCurriculumData();
const years: DemoYear[] = curriculum.years;

const level100Courses = years
  .find((year) => year.level === 100)
  ?.semesters.flatMap((semester) => semester.courses)
  .map((course) => course.id) ?? [];

const level200Courses = years
  .find((year) => year.level === 200)
  ?.semesters.flatMap((semester) => semester.courses)
  .map((course) => course.id) ?? [];

const passedCourseIds = new Set(level100Courses);
const inProgressCourseIds = new Set(level200Courses.slice(0, 2));
const failedCourseIds = new Set(level200Courses.slice(2, 3));

const unlockedSemesterIds = new Set(
  years
    .filter((year) => year.level <= 200)
    .flatMap((year) => year.semesters.map((semester) => semester.id)),
);

const completedSemesterIds = new Set(
  years
    .filter((year) => year.level === 100)
    .flatMap((year) => year.semesters.map((semester) => semester.id)),
);

const recentCourses = [
  ...Array.from(inProgressCourseIds).map((id) => {
    const course = curriculum.coursesById.get(id);
    return {
      status: 'in_progress',
      courses: {
        id,
        name: course?.name ?? id.toUpperCase(),
        code: course?.code ?? id.toUpperCase(),
        years: { level: course?.yearLevel ?? 200 },
      },
    };
  }),
  ...Array.from(failedCourseIds).map((id) => {
    const course = curriculum.coursesById.get(id);
    return {
      status: 'failed',
      courses: {
        id,
        name: course?.name ?? id.toUpperCase(),
        code: course?.code ?? id.toUpperCase(),
        years: { level: course?.yearLevel ?? 200 },
      },
    };
  }),
  ...Array.from(passedCourseIds)
    .slice(-2)
    .map((id) => {
      const course = curriculum.coursesById.get(id);
      return {
        status: 'passed',
        courses: {
          id,
          name: course?.name ?? id.toUpperCase(),
          code: course?.code ?? id.toUpperCase(),
          years: { level: course?.yearLevel ?? 100 },
        },
      };
    }),
];

const semesterGpas = [
  { id: 'gpa-100-1', gpa: 4.35, total_credits: 15, years: { level: 100 }, semesters: { number: 1 } },
  { id: 'gpa-100-2', gpa: 4.12, total_credits: 15, years: { level: 100 }, semesters: { number: 2 } },
];

const gradeSeed = Array.from(passedCourseIds).slice(0, 4);
const grades = gradeSeed.map((courseId, idx) => {
  const course = curriculum.coursesById.get(courseId);
  const score = [86, 81, 77, 73][idx] ?? 75;

  return {
    id: `cg-${idx + 1}`,
    quiz_score: score - 4,
    exam_score: score + 2,
    final_score: score,
    grade: score >= 85 ? 'A' : score >= 80 ? 'B+' : score >= 75 ? 'B' : 'C+',
    passed: true,
    grade_points: score >= 85 ? 4.5 : score >= 80 ? 4.0 : score >= 75 ? 3.5 : 3.0,
    courses: {
      name: course?.name ?? courseId.toUpperCase(),
      code: course?.code ?? courseId.toUpperCase(),
      credit_units: 3,
    },
    created_at: new Date(2025, 8, 1 + idx * 7).toISOString(),
  };
});

export function getDemoStudentSnapshot() {
  return {
    years,
    passedCourseIds,
    inProgressCourseIds,
    failedCourseIds,
    unlockedSemesterIds,
    completedSemesterIds,
    progressRows: [
      ...Array.from(passedCourseIds).map((course_id) => ({ course_id, status: 'passed' })),
      ...Array.from(inProgressCourseIds).map((course_id) => ({ course_id, status: 'in_progress' })),
      ...Array.from(failedCourseIds).map((course_id) => ({ course_id, status: 'failed' })),
    ],
    recentCourses,
    cumulativeGpa: { cumulative_gpa: 4.21, total_credits_earned: passedCourseIds.size * 3 },
    semesterGpas,
    grades,
    profile: {
      full_name: 'Returning Student',
      role: 'student',
      created_at: '2025-01-10T09:00:00.000Z',
    },
    subscription: null,
  };
}

function buildDemoLessons(course: CurriculumCourseMeta): DemoLesson[] {
  const resources = course.videos.length > 0
    ? course.videos
    : [{ title: 'Class Resource', url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE' }];

  return resources.map((resource, index) => ({
    id: `${course.id}-lesson-${index + 1}`,
    title: `Lesson ${index + 1}: ${resource.title}`,
    description: course.description || 'Class walkthrough and guided practice.',
    sort_order: index + 1,
    duration_minutes: 20 + (index % 3) * 8,
    resources: [
      {
        id: `${course.id}-lesson-${index + 1}-res-1`,
        type: 'youtube',
        title: resource.title,
        url: resource.url,
        sort_order: 1,
      },
    ],
  }));
}

export function getDemoCourseDetail(courseId: string) {
  const courseMeta = curriculum.coursesById.get(courseId);
  if (!courseMeta) return null;

  return {
    id: courseMeta.id,
    code: courseMeta.code,
    name: courseMeta.name,
    description: courseMeta.description,
    credit_units: 3,
    pass_mark: 60,
    is_premium: courseMeta.isPremium,
    semesters: {
      number: courseMeta.semesterNumber,
      years: { level: courseMeta.yearLevel },
    },
    lessons: buildDemoLessons(courseMeta),
  };
}
