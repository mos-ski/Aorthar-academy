import { requireAuth } from '@/lib/auth';
import QuizRunner from '@/components/courses/QuizRunner';

interface Props {
  params: Promise<{ courseId: string; attemptId: string }>;
}

export default async function ClassroomQuizPage({ params }: Props) {
  await requireAuth();
  const { courseId, attemptId } = await params;

  return <QuizRunner courseId={courseId} attemptId={attemptId} mode="classroom" />;
}

