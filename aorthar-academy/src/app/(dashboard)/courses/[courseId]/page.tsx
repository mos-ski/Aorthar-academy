import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import CourseViewer from '@/components/courses/CourseViewer';
import { getDemoCourseDetail } from '@/lib/demo/studentSnapshot';
import { healCourseLessons } from '@/lib/demo/youtubeLinkResolver';

interface Props {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

export default async function CourseDetailPage({ params, searchParams }: Props) {
  const { user } = await requireAuth();
  const { courseId } = await params;
  const { lesson: lessonId } = await searchParams;

  const supabase = await createClient();

  // Fetch course with lessons and resources
  const { data: dbCourse } = await supabase
    .from('courses')
    .select(`
      id, code, name, description, credit_units, pass_mark, is_premium,
      semesters!inner(id, number, years!inner(id, level)),
      lessons(id, title, description, sort_order, duration_minutes,
        resources(id, type, title, url, sort_order)
      )
    `)
    .eq('id', courseId)
    .single();

  const course = dbCourse ?? getDemoCourseDetail(courseId);
  if (!course) notFound();

  // Check premium gate
  if (course.is_premium && dbCourse) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!sub) redirect('/pricing');
  }

  // Fetch user's progress for this course
  const { data: progress } = await supabase
    .from('user_progress')
    .select('status, last_lesson_id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle();

  // Fetch best quiz attempt
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('id, score, passed, created_at, assessment_type')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .order('score', { ascending: false });

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
  const activeLessonId = lessonId ?? lessons[0]?.id;

  const sem = course.semesters as unknown as { number: number; years: { level: number } };
  const yearLevel = sem?.years?.level ?? 0;
  const semNumber = sem?.number ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Course Header */}
      <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">{course.code}</Badge>
            <span className="text-xs text-muted-foreground">Year {yearLevel} · Sem {semNumber}</span>
            {course.is_premium && <Crown className="h-4 w-4 text-yellow-500" />}
          </div>
          <h1 className="text-2xl font-bold">{course.name}</h1>
          {course.description && (
            <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {course.credit_units} credits · Pass mark: {course.pass_mark}%
          </p>
        </div>
      </div>

      {/* Main Viewer */}
      <CourseViewer
        courseId={courseId}
        lessons={lessons}
        completedLessons={Array.from(completedLessons)}
        activeLessonId={activeLessonId}
        attempts={attempts ?? []}
      />
    </div>
  );
}
