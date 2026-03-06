import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown } from 'lucide-react';

interface CourseCardProps {
  course: {
    id: string;
    name: string;
    code: string;
    is_premium: boolean;
    credit_units?: number;
  };
  isPassed: boolean;
  disabled?: boolean;
}

export default function CourseCard({ course, isPassed, disabled = false }: CourseCardProps) {
  const content = (
    <Card className={`transition-all h-full border-border bg-card ${disabled ? 'opacity-85 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(24,25,26,0.08)] hover:bg-accent/15 cursor-pointer'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold leading-tight">{course.name}</CardTitle>
          <div className="flex gap-1 shrink-0">
            {course.is_premium && (
              <Crown className="h-4 w-4 text-yellow-500" />
            )}
            {isPassed && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs border-primary/25 text-primary bg-accent/20">{course.code}</Badge>
          {course.credit_units && (
            <span className="text-xs text-muted-foreground">{course.credit_units} credits</span>
          )}
          {course.is_premium && (
            <span className="text-xs text-primary font-semibold">Premium</span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (disabled) {
    return content;
  }

  return (
    <Link href={`/courses/${course.id}`}>
      {content}
    </Link>
  );
}
