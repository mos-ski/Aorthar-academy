import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDemoCourseDetail } from '@/lib/demo/studentSnapshot';
import { getDemoStudentSnapshot } from '@/lib/demo/studentSnapshot';
import { healCourseLessons } from '@/lib/demo/youtubeLinkResolver';

type QueryParams = { lesson?: string };

export async function loadCourseViewerData(courseId: string, userId: string, searchParams: QueryParams) {
  const supabase = await createClient();

  const { data: dbCourseBase } = await supabase
    .from('courses')
    .select('id, code, name, description, credit_units, pass_mark, is_premium, semester_id')
    .eq('id', courseId)
    .maybeSingle();

  const [{ data: semesterData }, { data: lessonsData }] = await Promise.all([
    dbCourseBase?.semester_id
      ? supabase
          .from('semesters')
          .select('id, number, years(level)')
          .eq('id', dbCourseBase.semester_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    dbCourseBase
      ? supabase
          .from('lessons')
          .select(`
            id, title, description:content, sort_order, duration_minutes,
            resources(id, type, title, url, sort_order)
          `)
          .eq('course_id', dbCourseBase.id)
          .eq('is_published', true)
          .order('sort_order', { ascending: true })
      : Promise.resolve({ data: null }),
  ]);

  const dbCourse = dbCourseBase
    ? {
        ...dbCourseBase,
        semesters: semesterData ?? null,
        lessons: lessonsData ?? [],
      }
    : null;

  const course = dbCourse ?? getDemoCourseDetail(courseId);
  if (!course) redirect('/courses');

  if (course.is_premium && dbCourse) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (!sub) redirect('/pricing');
  }

  // Check semester unlock: student must have completed all prior semesters
  if (dbCourse?.semesters) {
    const yearsArr = dbCourse.semesters.years as { level: number }[] | undefined;
    const yearData = yearsArr?.[0];
    if (yearData) {
      const yearLevel = yearData.level;
      const semNumber = dbCourse.semesters.number;

      // Year 100 Semester 1 is always unlocked
      if (!(yearLevel === 100 && semNumber === 1)) {
        // Check if all prior semesters are completed
        const { data: allSemesterProgress } = await supabase
          .from('semester_progress')
          .select('semester_id, is_completed, semesters(year_id, number, years(level))')
          .eq('user_id', userId)
          .order('semesters(year_id)', { ascending: true })
          .order('semesters(number)', { ascending: true });

        const completedSemesters = new Set(
          (allSemesterProgress ?? [])
            .filter((sp: any) => sp.is_completed && sp.semesters)
            .map((sp: any) => `${sp.semesters.years.level}-${sp.semesters.number}`)
        );

        // Check all semesters before current one
        let isLocked = false;
        for (const y of [100, 200, 300, 400]) {
          for (const s of [1, 2]) {
            if (y === yearLevel && s === semNumber) break;
            if (!completedSemesters.has(`${y}-${s}`)) {
              isLocked = true;
              break;
            }
          }
          if (isLocked) break;
        }

        if (isLocked) redirect('/courses');
      }
    }
  }

  const [{ data: progress }, { data: attempts }, { count: enrolledCount }] = await Promise.all([
    supabase
      .from('user_progress')
      .select('status, last_lesson_id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle(),
    supabase
      .from('quiz_attempts')
      .select('id, score, passed, created_at, assessment_type')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .order('score', { ascending: false }),
    supabase
      .from('user_progress')
      .select('user_id', { count: 'exact', head: true })
      .eq('course_id', courseId),
  ]);

  let lessons = [...(course.lessons ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  if (!dbCourse && lessons.length > 0) {
    const healed = await healCourseLessons(lessons, {
      courseCode: course.code,
      courseName: course.name,
    });
    lessons = healed.lessons;
  }

  const completedLessons = new Set<string>();
  if (progress?.last_lesson_id) {
    const idx = lessons.findIndex((l) => l.id === progress.last_lesson_id);
    if (idx >= 0) {
      lessons.slice(0, idx + 1).forEach((l) => completedLessons.add(l.id));
    }
  }

  const activeLessonId = searchParams.lesson ?? lessons[0]?.id;
  const sem = course.semesters as unknown as { number: number; years: { level: number } };
  const yearLevel = sem?.years?.level ?? 0;
  const semNumber = sem?.number ?? 0;

  let prevCourse: { id: string; code: string; name: string } | null = null;
  let nextCourse: { id: string; code: string; name: string } | null = null;

  if (dbCourse) {
    if (dbCourse.semester_id) {
      const { data: siblingCourses } = await supabase
        .from('courses')
        .select('id, code, name, sort_order')
        .eq('semester_id', dbCourse.semester_id)
        .order('sort_order', { ascending: true });

      const siblings = siblingCourses ?? [];
      const idx = siblings.findIndex((c) => c.id === courseId);
      if (idx > 0) {
        prevCourse = { id: siblings[idx - 1].id, code: siblings[idx - 1].code, name: siblings[idx - 1].name };
      }
      if (idx >= 0 && idx < siblings.length - 1) {
        nextCourse = { id: siblings[idx + 1].id, code: siblings[idx + 1].code, name: siblings[idx + 1].name };
      }
    }
  } else {
    const demo = getDemoStudentSnapshot();
    const flat = demo.years.flatMap((y) => y.semesters.flatMap((s) => s.courses));
    const idx = flat.findIndex((c) => c.id === courseId);
    if (idx > 0) prevCourse = { id: flat[idx - 1].id, code: flat[idx - 1].code, name: flat[idx - 1].name };
    if (idx >= 0 && idx < flat.length - 1) nextCourse = { id: flat[idx + 1].id, code: flat[idx + 1].code, name: flat[idx + 1].name };
  }

  return {
    course,
    lessons,
    attempts: attempts ?? [],
    completedLessons: Array.from(completedLessons),
    activeLessonId,
    yearLevel,
    semNumber,
    enrolledCount: enrolledCount ?? 0,
    prevCourse,
    nextCourse,
  };
}
