import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';

interface Props {
  params: Promise<{ courseId: string; attemptId: string }>;
}

export default async function CourseQuizPage({ params }: Props) {
  await requireAuth();
  const { courseId, attemptId } = await params;

  redirect(`/classroom/${courseId}/quiz/${attemptId}`);
}
