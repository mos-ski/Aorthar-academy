import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatGPA } from '@/utils/formatters';
import { TrendingUp } from 'lucide-react';

interface GPACardProps {
  cumulative_gpa: number;
  total_credits: number;
}

function getClassification(gpa: number): { label: string; color: string } {
  if (gpa >= 4.5) return { label: 'First Class Honour', color: 'text-green-500' };
  if (gpa >= 3.5) return { label: 'Second Class Upper', color: 'text-blue-500' };
  if (gpa >= 2.4) return { label: 'Second Class Lower', color: 'text-yellow-500' };
  if (gpa >= 2.0) return { label: 'Pass', color: 'text-orange-500' };
  return { label: 'Fail', color: 'text-red-500' };
}

export default function GPACard({ cumulative_gpa, total_credits }: GPACardProps) {
  const pct = (cumulative_gpa / 5.0) * 100;
  const { label, color } = getClassification(cumulative_gpa);

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
        <p className={`text-sm font-medium ${color}`}>{label}</p>
        <Progress value={pct} className="h-3" />
        <p className="text-sm text-muted-foreground">{total_credits} credit units earned</p>
      </CardContent>
    </Card>
  );
}
