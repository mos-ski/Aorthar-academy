import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';

interface Props {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

export default async function CourseDetailPage({ params, searchParams }: Props) {
  await requireAuth();
  const { courseId } = await params;
  const { lesson: lessonId } = await searchParams;
  const target = lessonId
    ? `/classroom/${courseId}?lesson=${encodeURIComponent(lessonId)}`
    : `/classroom/${courseId}`;
  redirect(target);
}
