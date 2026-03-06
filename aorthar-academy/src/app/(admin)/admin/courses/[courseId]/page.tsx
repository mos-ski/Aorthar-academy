'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, ChevronLeft, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type Resource = { id: string; type: string; title: string; url: string; sort_order: number };
type Lesson = { id: string; title: string; sort_order: number; duration_minutes: number; is_published: boolean; resources: Resource[] };
type Option = { id: string; text: string; is_correct: boolean };
type Question = { id: string; question_text: string; options: Option[]; points: number; is_exam_question: boolean; difficulty: number };
type Course = { id: string; code: string; name: string; description: string; credit_units: number; status: string; is_premium: boolean; pass_mark: number };

export default function AdminCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourse = useCallback(async () => {
    const res = await fetch(`/api/admin/courses/${courseId}/lessons`);
    const json = await res.json();
    setLessons(json.data ?? []);
  }, [courseId]);

  const fetchQuestions = useCallback(async () => {
    const res = await fetch(`/api/admin/courses/${courseId}/questions`);
    const json = await res.json();
    setQuestions(json.data ?? []);
  }, [courseId]);

  useEffect(() => {
    Promise.all([fetchCourse(), fetchQuestions()]).finally(() => setLoading(false));
  }, [fetchCourse, fetchQuestions]);

  // ── Course status toggle ─────────────────────────────────────────
  async function toggleStatus() {
    if (!course) return;
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setCourse((c) => c ? { ...c, status: newStatus } : c);
      toast.success(`Course ${newStatus}`);
    } else toast.error('Failed to update status');
  }

  // ── Add lesson ───────────────────────────────────────────────────
  const [newLesson, setNewLesson] = useState({ title: '', duration_minutes: 45 });
  async function addLesson() {
    if (!newLesson.title.trim()) return toast.error('Title is required');
    const res = await fetch(`/api/admin/courses/${courseId}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newLesson, sort_order: lessons.length + 1 }),
    });
    if (res.ok) {
      setNewLesson({ title: '', duration_minutes: 45 });
      toast.success('Lesson added');
      fetchCourse();
    } else toast.error('Failed to add lesson');
  }

  // ── Delete lesson ────────────────────────────────────────────────
  async function deleteLesson(lessonId: string) {
    const res = await fetch(`/api/admin/lessons/${lessonId}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Lesson deleted'); fetchCourse(); }
    else toast.error('Failed to delete lesson');
  }

  // ── Add resource ─────────────────────────────────────────────────
  const [newResource, setNewResource] = useState<Record<string, { title: string; url: string; type: string }>>({});
  async function addResource(lessonId: string) {
    const r = newResource[lessonId];
    if (!r?.url?.trim() || !r?.title?.trim()) return toast.error('Title and URL required');
    const res = await fetch(`/api/admin/lessons/${lessonId}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...r, sort_order: 1 }),
    });
    if (res.ok) {
      setNewResource((prev) => ({ ...prev, [lessonId]: { title: '', url: '', type: 'youtube' } }));
      toast.success('Resource added');
      fetchCourse();
    } else toast.error('Failed to add resource');
  }

  // ── Delete resource ──────────────────────────────────────────────
  async function deleteResource(resourceId: string) {
    const res = await fetch(`/api/admin/resources/${resourceId}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Resource deleted'); fetchCourse(); }
    else toast.error('Failed to delete resource');
  }

  // ── Add question ─────────────────────────────────────────────────
  const [newQ, setNewQ] = useState({
    question_text: '',
    options: [
      { id: 'a', text: '', is_correct: true },
      { id: 'b', text: '', is_correct: false },
      { id: 'c', text: '', is_correct: false },
      { id: 'd', text: '', is_correct: false },
    ],
    is_exam_question: false,
    difficulty: 1,
  });

  async function addQuestion() {
    if (!newQ.question_text.trim()) return toast.error('Question text is required');
    if (newQ.options.some((o) => !o.text.trim())) return toast.error('All 4 options must have text');
    const res = await fetch(`/api/admin/courses/${courseId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newQ, options: newQ.options }),
    });
    if (res.ok) {
      setNewQ({
        question_text: '',
        options: [
          { id: 'a', text: '', is_correct: true },
          { id: 'b', text: '', is_correct: false },
          { id: 'c', text: '', is_correct: false },
          { id: 'd', text: '', is_correct: false },
        ],
        is_exam_question: false,
        difficulty: 1,
      });
      toast.success('Question added');
      fetchQuestions();
    } else toast.error('Failed to add question');
  }

  async function deleteQuestion(questionId: string) {
    const res = await fetch(`/api/admin/questions/${questionId}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Question deleted'); fetchQuestions(); }
    else toast.error('Failed to delete question');
  }

  if (loading) return <div className="text-muted-foreground text-sm p-4">Loading...</div>;

  const quizQs = questions.filter((q) => !q.is_exam_question);
  const examQs = questions.filter((q) => q.is_exam_question);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/courses">
          <Button variant="ghost" size="sm"><ChevronLeft className="h-4 w-4" /> Back</Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{course?.code} — {course?.name}</h2>
          <p className="text-sm text-muted-foreground">{course?.description}</p>
        </div>
        {course && (
          <Button
            variant={course.status === 'published' ? 'destructive' : 'default'}
            size="sm"
            onClick={toggleStatus}
          >
            {course.status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
        )}
      </div>

      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">Lessons ({lessons.length})</TabsTrigger>
          <TabsTrigger value="quiz">Quiz ({quizQs.length})</TabsTrigger>
          <TabsTrigger value="exam">Exam ({examQs.length})</TabsTrigger>
        </TabsList>

        {/* ── LESSONS TAB ── */}
        <TabsContent value="lessons" className="space-y-4 mt-4">
          {/* Add lesson form */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Add Lesson</CardTitle></CardHeader>
            <CardContent className="flex gap-2">
              <Input
                placeholder="Lesson title"
                value={newLesson.title}
                onChange={(e) => setNewLesson((p) => ({ ...p, title: e.target.value }))}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Minutes"
                value={newLesson.duration_minutes}
                onChange={(e) => setNewLesson((p) => ({ ...p, duration_minutes: Number(e.target.value) }))}
                className="w-24"
              />
              <Button onClick={addLesson} size="sm"><Plus className="h-4 w-4 mr-1" />Add</Button>
            </CardContent>
          </Card>

          {lessons.map((lesson) => (
            <Card key={lesson.id}>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">{lesson.sort_order}. {lesson.title}</p>
                  <p className="text-xs text-muted-foreground">{lesson.duration_minutes} min · {lesson.resources.length} resource(s)</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteLesson(lesson.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Resources */}
                {lesson.resources.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm bg-muted/40 rounded px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{r.type}</Badge>
                      <span>{r.title}</span>
                      <a href={r.url} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </a>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteResource(r.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
                {/* Add resource form */}
                <div className="flex gap-2 pt-1">
                  <Select
                    value={newResource[lesson.id]?.type ?? 'youtube'}
                    onValueChange={(v) => setNewResource((p) => ({ ...p, [lesson.id]: { ...p[lesson.id], type: v, title: p[lesson.id]?.title ?? '', url: p[lesson.id]?.url ?? '' } }))}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Title"
                    className="h-8 text-xs flex-1"
                    value={newResource[lesson.id]?.title ?? ''}
                    onChange={(e) => setNewResource((p) => ({ ...p, [lesson.id]: { ...p[lesson.id], title: e.target.value, url: p[lesson.id]?.url ?? '', type: p[lesson.id]?.type ?? 'youtube' } }))}
                  />
                  <Input
                    placeholder="URL"
                    className="h-8 text-xs flex-1"
                    value={newResource[lesson.id]?.url ?? ''}
                    onChange={(e) => setNewResource((p) => ({ ...p, [lesson.id]: { ...p[lesson.id], url: e.target.value, title: p[lesson.id]?.title ?? '', type: p[lesson.id]?.type ?? 'youtube' } }))}
                  />
                  <Button size="sm" className="h-8 text-xs" onClick={() => addResource(lesson.id)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {lessons.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No lessons yet. Add one above.</p>
          )}
        </TabsContent>

        {/* ── QUESTIONS TAB (shared for quiz / exam) ── */}
        {(['quiz', 'exam'] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
            {/* Add question form */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Add {tab === 'quiz' ? 'Quiz' : 'Exam'} Question</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Question text"
                  value={newQ.question_text}
                  onChange={(e) => setNewQ((p) => ({ ...p, question_text: e.target.value, is_exam_question: tab === 'exam' }))}
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-2">
                  {newQ.options.map((opt, i) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewQ((p) => ({
                          ...p,
                          options: p.options.map((o, idx) => ({ ...o, is_correct: idx === i })),
                        }))}
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${opt.is_correct ? 'border-primary bg-primary' : 'border-muted-foreground'}`}
                      />
                      <Input
                        placeholder={`Option ${opt.id.toUpperCase()}`}
                        className="h-8 text-xs"
                        value={opt.text}
                        onChange={(e) => setNewQ((p) => ({
                          ...p,
                          options: p.options.map((o, idx) => idx === i ? { ...o, text: e.target.value } : o),
                        }))}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Label className="text-xs">Difficulty</Label>
                  <Select
                    value={String(newQ.difficulty)}
                    onValueChange={(v) => setNewQ((p) => ({ ...p, difficulty: Number(v) }))}
                  >
                    <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Easy</SelectItem>
                      <SelectItem value="2">Medium</SelectItem>
                      <SelectItem value="3">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => { setNewQ((p) => ({ ...p, is_exam_question: tab === 'exam' })); addQuestion(); }}>
                    <Plus className="h-4 w-4 mr-1" />Add Question
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Question list */}
            {(tab === 'quiz' ? quizQs : examQs).map((q, i) => (
              <Card key={q.id}>
                <CardContent className="py-3 flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{i + 1}. {q.question_text}</p>
                    <div className="grid grid-cols-2 gap-1">
                      {q.options.map((o) => (
                        <p key={o.id} className={`text-xs px-2 py-0.5 rounded ${o.is_correct ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-medium' : 'text-muted-foreground'}`}>
                          {o.id.toUpperCase()}. {o.text}
                        </p>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteQuestion(q.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}

            {(tab === 'quiz' ? quizQs : examQs).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No {tab} questions yet.</p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
