import { NextResponse } from 'next/server';
import { getDemoStudentSnapshot, getDemoCourseDetail } from '@/lib/demo/studentSnapshot';
import { healCourseLessons, getLinkRepairCacheSize } from '@/lib/demo/youtubeLinkResolver';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  const expected = process.env.CRON_SECRET;

  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const snapshot = getDemoStudentSnapshot();
  const courseIds = snapshot.years.flatMap((year) =>
    year.semesters.flatMap((semester) => semester.courses.map((course) => course.id)),
  );

  let healedLinks = 0;

  for (const courseId of courseIds) {
    const course = getDemoCourseDetail(courseId);
    if (!course) continue;

    const healed = await healCourseLessons(course.lessons ?? [], {
      courseCode: course.code,
      courseName: course.name,
    });
    healedLinks += healed.healedCount;
  }

  return NextResponse.json({
    ok: true,
    coursesScanned: courseIds.length,
    healedLinks,
    cacheSize: getLinkRepairCacheSize(),
    checkedAt: new Date().toISOString(),
  });
}
