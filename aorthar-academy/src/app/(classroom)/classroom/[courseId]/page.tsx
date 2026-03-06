import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import CourseViewer from '@/components/courses/CourseViewer';
import { loadCourseViewerData } from '@/lib/courses/loadCourseViewerData';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Crown, X } from 'lucide-react';
import { getWeeklyPlanForCourse } from '@/lib/academics/weeklyPlan';

interface Props {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

export default async function ClassroomCoursePage({ params, searchParams }: Props) {
  const { user } = await requireAuth();
  const { courseId } = await params;
  const sp = await searchParams;

  const data = await loadCourseViewerData(courseId, user.id, sp);
  const activeLesson = data.lessons.find((l) => l.id === data.activeLessonId) ?? data.lessons[0];
  const weeklyPlanRows = getWeeklyPlanForCourse(data.course.code);

  return (
    <div className="min-h-screen bg-[#060708] text-white">
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-8 pt-4 md:px-6">
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0f1114] px-4 py-3">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-sm text-white/70">
              <Link href="/courses" className="inline-flex items-center gap-1 hover:text-white">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
              <span>/</span>
              <span>Courses</span>
              <span>/</span>
              <Link href={`/classroom/${courseId}`} className="font-medium text-white hover:underline">
                {data.course.code}
              </Link>
              {activeLesson ? (
                <>
                  <span>/</span>
                  <Link href={`/classroom/${courseId}?lesson=${activeLesson.id}`} className="truncate hover:underline">
                    {activeLesson.title}
                  </Link>
                </>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-[#a7d252]/30 text-[#a7d252] bg-[#a7d252]/10">{data.course.code}</Badge>
              <p className="truncate text-xl font-semibold">{data.course.name}</p>
              {data.course.is_premium && <Crown className="h-4 w-4 text-yellow-400" />}
            </div>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            <X className="h-4 w-4" /> Close
          </Link>
        </div>

        <div className="mb-4 flex items-center justify-between gap-2">
          {data.prevCourse ? (
            <Link
              href={`/classroom/${data.prevCourse.id}`}
              className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" /> Previous Course: {data.prevCourse.code}
            </Link>
          ) : <span />}
          {data.nextCourse ? (
            <Link
              href={`/classroom/${data.nextCourse.id}`}
              className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              Next Course: {data.nextCourse.code} <ArrowRight className="h-4 w-4" />
            </Link>
          ) : <span />}
        </div>

        <CourseViewer
          mode="classroom"
          courseId={courseId}
          courseCode={data.course.code}
          courseName={data.course.name}
          courseDescription={data.course.description ?? ''}
          enrolledCount={data.enrolledCount}
          weeklyPlanRows={weeklyPlanRows}
          lessons={data.lessons}
          completedLessons={data.completedLessons}
          activeLessonId={data.activeLessonId}
          attempts={data.attempts}
        />
      </div>
    </div>
  );
}
