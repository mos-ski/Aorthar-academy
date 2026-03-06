import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type QuestionOption = { id: string; text: string; is_correct: boolean };

export default async function AdminQuestionsPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from('courses')
    .select('id, code, name, semesters!inner(years!inner(level))')
    .order('code', { ascending: true });

  // Get question counts per course
  const { data: questionCounts } = await supabase
    .from('questions')
    .select('course_id, id');

  const countMap: Record<string, number> = {};
  (questionCounts ?? []).forEach((q) => {
    countMap[q.course_id] = (countMap[q.course_id] ?? 0) + 1;
  });

  // Get a sample of questions for the selected course (first course by default)
  const firstCourse = courses?.[0];
  const { data: sampleQuestions } = firstCourse
    ? await supabase
        .from('questions')
        .select('*')
        .eq('course_id', firstCourse.id)
        .limit(5)
    : { data: [] };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Questions</h2>
        <span className="text-sm text-muted-foreground">
          {Object.values(countMap).reduce((a, b) => a + b, 0)} total
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {(courses ?? []).map((course) => {
          const sem = course.semesters as unknown as { years: { level: number } };
          const yearLevel = sem?.years?.level ?? 0;
          const count = countMap[course.id] ?? 0;
          const expected = 20;
          return (
            <Card
              key={course.id}
              className={count < expected ? 'border-destructive/40' : ''}
            >
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-sm font-mono">{course.code}</CardTitle>
                <p className="text-xs text-muted-foreground truncate">Year {yearLevel}</p>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{count}</span>
                  <Badge variant={count >= expected ? 'default' : 'destructive'} className="text-xs">
                    {count >= expected ? 'Complete' : `${expected - count} missing`}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {firstCourse && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold">Sample — {firstCourse.code}</h3>
          {(sampleQuestions ?? []).map((q) => {
            const options = q.options as QuestionOption[];
            return (
              <Card key={q.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs shrink-0">
                      {q.is_exam_question ? 'Exam' : 'Quiz'} · Diff {q.difficulty}
                    </Badge>
                    <p className="text-sm font-medium">{q.question_text}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`text-xs px-2 py-1 rounded ${
                          opt.is_correct
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-medium'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {opt.id}. {opt.text}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
