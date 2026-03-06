import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatGPA } from '@/utils/formatters';
import { TrendingUp } from 'lucide-react';

interface GPACardProps {
  cumulative_gpa: number;
  total_credits: number;
}

export default function GPACard({ cumulative_gpa, total_credits }: GPACardProps) {
  const pct = (cumulative_gpa / 5.0) * 100;

  const color =
    cumulative_gpa >= 4.5
      ? 'text-green-500'
      : cumulative_gpa >= 3.5
      ? 'text-blue-500'
      : cumulative_gpa >= 2.0
      ? 'text-yellow-500'
      : 'text-red-500';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Cumulative GPA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-2">
          <span className={`text-5xl font-bold ${color}`}>{formatGPA(cumulative_gpa)}</span>
          <span className="text-muted-foreground mb-1">/ 5.0</span>
        </div>
        <Progress value={pct} className="h-3" />
        <p className="text-sm text-muted-foreground">{total_credits} credit units earned</p>
      </CardContent>
    </Card>
  );
}
