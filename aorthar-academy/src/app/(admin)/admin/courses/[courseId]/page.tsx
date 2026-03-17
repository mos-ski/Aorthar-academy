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
import { Trash2, Plus, ChevronLeft, ExternalLink, Pencil, Check, X, Settings } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type Resource = { id: string; type: string; title: string; url: string; sort_order: number };
type Lesson = {
  id: string; title: string; sort_order: number; duration_minutes: number;
  is_published: boolean; content: string | null; resources: Resource[];
};
type Option = { id: string; text: string; is_correct: boolean };
type Question = {
  id: string; question_text: string; options: Option[];
  points: number; is_exam_question: boolean; difficulty: number;
};
type Course = {
  id: string; code: string; name: string; description: string;
  credit_units: number; status: string; is_premium: boolean;
  pass_mark: number; quiz_weight: number; exam_weight: number;
  quiz_attempt_limit: number; exam_attempt_limit: number;
  cooldown_hours: number; exam_duration_minutes: number; sort_order: number;
};

export default function AdminCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Edit state ──────────────────────────────────────────────────────
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonDraft, setLessonDraft] = useState<Partial<Lesson>>({});
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [resourceDraft, setResourceDraft] = useState<Partial<Resource>>({});
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionDraft, setQuestionDraft] = useState<Partial<Question>>({});
  const [settingsDraft, setSettingsDraft] = useState<Partial<Course>>({});
  const [savingSettings, setSavingSettings] = useState(false);

  // ── Fetch ───────────────────────────────────────────────────────────
  const fetchCourseData = useCallback(async () => {
    const res = await fetch(`/api/admin/courses/${courseId}`);
    const json = await res.json();
    if (json.data) {
      setCourse(json.data);
      setSettingsDraft(json.data);
    }
  }, [courseId]);

  const fetchLessons = useCallback(async () => {
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
    Promise.all([fetchCourseData(), fetchLessons(), fetchQuestions()]).finally(() => setLoading(false));
  }, [fetchCourseData, fetchLessons, fetchQuestions]);

  // ── Status toggle ───────────────────────────────────────────────────
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

  // ── Settings save ───────────────────────────────────────────────────
  async function saveSettings() {
    setSavingSettings(true);
    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsDraft),
    });
    setSavingSettings(false);
    if (res.ok) {
      const json = await res.json();
      setCourse(json.data);
      toast.success('Settings saved');
    } else toast.error('Failed to save settings');
  }

  // ── Lesson CRUD ─────────────────────────────────────────────────────
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
      fetchLessons();
    } else toast.error('Failed to add lesson');
  }

  function startEditLesson(lesson: Lesson) {
    setEditingLessonId(lesson.id);
    setLessonDraft({
      title: lesson.title,
      duration_minutes: lesson.duration_minutes,
      sort_order: lesson.sort_order,
      is_published: lesson.is_published,
      content: lesson.content ?? '',
    });
  }

  async function saveLesson(lessonId: string) {
    const res = await fetch(`/api/admin/lessons/${lessonId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lessonDraft),
    });
    if (res.ok) {
      setEditingLessonId(null);
      toast.success('Lesson updated');
      fetchLessons();
    } else toast.error('Failed to update lesson');
  }

  async function deleteLesson(lessonId: string) {
    const res = await fetch(`/api/admin/lessons/${lessonId}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Lesson deleted'); fetchLessons(); }
    else toast.error('Failed to delete lesson');
  }

  // ── Resource CRUD ───────────────────────────────────────────────────
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
      fetchLessons();
    } else toast.error('Failed to add resource');
  }

  function startEditResource(resource: Resource) {
    setEditingResourceId(resource.id);
    setResourceDraft({ type: resource.type, title: resource.title, url: resource.url });
  }

  async function saveResource(resourceId: string) {
    const res = await fetch(`/api/admin/resources/${resourceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resourceDraft),
    });
    if (res.ok) {
      setEditingResourceId(null);
      toast.success('Resource updated');
      fetchLessons();
    } else toast.error('Failed to update resource');
  }

  async function deleteResource(resourceId: string) {
    const res = await fetch(`/api/admin/resources/${resourceId}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Resource deleted'); fetchLessons(); }
    else toast.error('Failed to delete resource');
  }

  // ── Question CRUD ───────────────────────────────────────────────────
  const emptyOptions = [
    { id: 'a', text: '', is_correct: true },
    { id: 'b', text: '', is_correct: false },
    { id: 'c', text: '', is_correct: false },
    { id: 'd', text: '', is_correct: false },
  ];
  const [newQ, setNewQ] = useState({ question_text: '', options: emptyOptions, difficulty: 1 });

  function startEditQuestion(q: Question) {
    setEditingQuestionId(q.id);
    setQuestionDraft({
      question_text: q.question_text,
      options: q.options.map((o) => ({ ...o })),
      difficulty: q.difficulty,
    });
  }

  async function saveQuestion(questionId: string) {
    const res = await fetch(`/api/admin/questions/${questionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionDraft),
    });
    if (res.ok) {
      setEditingQuestionId(null);
      toast.success('Question updated');
      fetchQuestions();
    } else toast.error('Failed to update question');
  }

  async function addQuestion(isExam: boolean) {
    if (!newQ.question_text.trim()) return toast.error('Question text is required');
    if (newQ.options.some((o) => !o.text.trim())) return toast.error('All 4 options must have text');
    const res = await fetch(`/api/admin/courses/${courseId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newQ, is_exam_question: isExam }),
    });
    if (res.ok) {
      setNewQ({ question_text: '', options: emptyOptions, difficulty: 1 });
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
      {/* Header */}
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
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings className="h-3.5 w-3.5" />Settings
          </TabsTrigger>
        </TabsList>

        {/* ── LESSONS TAB ── */}
        <TabsContent value="lessons" className="space-y-4 mt-4">
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
              <CardHeader className="py-3">
                {editingLessonId === lesson.id ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Title"
                        className="flex-1"
                        value={lessonDraft.title ?? ''}
                        onChange={(e) => setLessonDraft((p) => ({ ...p, title: e.target.value }))}
                      />
                      <Input
                        type="number"
                        placeholder="Minutes"
                        className="w-24"
                        value={lessonDraft.duration_minutes ?? 45}
                        onChange={(e) => setLessonDraft((p) => ({ ...p, duration_minutes: Number(e.target.value) }))}
                      />
                      <Input
                        type="number"
                        placeholder="Order"
                        className="w-20"
                        value={lessonDraft.sort_order ?? 1}
                        onChange={(e) => setLessonDraft((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lessonDraft.is_published ?? true}
                        onChange={(e) => setLessonDraft((p) => ({ ...p, is_published: e.target.checked }))}
                        className="h-4 w-4"
                      />
                      Published
                    </label>
                    <Textarea
                      placeholder="Lesson content (Markdown)"
                      rows={4}
                      value={lessonDraft.content ?? ''}
                      onChange={(e) => setLessonDraft((p) => ({ ...p, content: e.target.value }))}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => setEditingLessonId(null)}>
                        <X className="h-4 w-4 mr-1" />Cancel
                      </Button>
                      <Button size="sm" onClick={() => saveLesson(lesson.id)}>
                        <Check className="h-4 w-4 mr-1" />Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{lesson.sort_order}. {lesson.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {lesson.duration_minutes} min · {lesson.resources.length} resource(s) · {lesson.is_published ? 'Published' : 'Draft'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => startEditLesson(lesson)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteLesson(lesson.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardHeader>

              {editingLessonId !== lesson.id && (
                <CardContent className="space-y-2">
                  {lesson.resources.map((r) => (
                    <div key={r.id} className="bg-muted/40 rounded px-3 py-1.5">
                      {editingResourceId === r.id ? (
                        <div className="flex gap-2 items-center flex-wrap">
                          <Select
                            value={resourceDraft.type ?? 'youtube'}
                            onValueChange={(v) => setResourceDraft((p) => ({ ...p, type: v }))}
                          >
                            <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="link">Link</SelectItem>
                              <SelectItem value="document">Document</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Title"
                            className="h-7 text-xs flex-1 min-w-[120px]"
                            value={resourceDraft.title ?? ''}
                            onChange={(e) => setResourceDraft((p) => ({ ...p, title: e.target.value }))}
                          />
                          <Input
                            placeholder="URL"
                            className="h-7 text-xs flex-1 min-w-[150px]"
                            value={resourceDraft.url ?? ''}
                            onChange={(e) => setResourceDraft((p) => ({ ...p, url: e.target.value }))}
                          />
                          <Button size="sm" className="h-7" onClick={() => saveResource(r.id)}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingResourceId(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{r.type}</Badge>
                            <span>{r.title}</span>
                            <a href={r.url} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </a>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEditResource(r)}>
                              <Pencil className="h-3 w-3 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteResource(r.id)}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      )}
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
                    <Button size="sm" className="h-8" onClick={() => addResource(lesson.id)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {lessons.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No lessons yet. Add one above.</p>
          )}
        </TabsContent>

        {/* ── QUIZ / EXAM TABS ── */}
        {(['quiz', 'exam'] as const).map((tab) => {
          const tabQs = tab === 'quiz' ? quizQs : examQs;
          return (
            <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Add {tab === 'quiz' ? 'Quiz' : 'Exam'} Question</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Question text"
                    value={newQ.question_text}
                    onChange={(e) => setNewQ((p) => ({ ...p, question_text: e.target.value }))}
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
                    <Button size="sm" onClick={() => addQuestion(tab === 'exam')}>
                      <Plus className="h-4 w-4 mr-1" />Add Question
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {tabQs.map((q, i) => (
                <Card key={q.id}>
                  <CardContent className="py-3">
                    {editingQuestionId === q.id ? (
                      <div className="space-y-3">
                        <Textarea
                          rows={2}
                          value={questionDraft.question_text ?? ''}
                          onChange={(e) => setQuestionDraft((p) => ({ ...p, question_text: e.target.value }))}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          {(questionDraft.options ?? []).map((opt, idx) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setQuestionDraft((p) => ({
                                  ...p,
                                  options: (p.options ?? []).map((o, oi) => ({ ...o, is_correct: oi === idx })),
                                }))}
                                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${opt.is_correct ? 'border-primary bg-primary' : 'border-muted-foreground'}`}
                              />
                              <Input
                                placeholder={`Option ${opt.id.toUpperCase()}`}
                                className="h-8 text-xs"
                                value={opt.text}
                                onChange={(e) => setQuestionDraft((p) => ({
                                  ...p,
                                  options: (p.options ?? []).map((o, oi) => oi === idx ? { ...o, text: e.target.value } : o),
                                }))}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 justify-between">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Difficulty</Label>
                            <Select
                              value={String(questionDraft.difficulty ?? 1)}
                              onValueChange={(v) => setQuestionDraft((p) => ({ ...p, difficulty: Number(v) }))}
                            >
                              <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Easy</SelectItem>
                                <SelectItem value="2">Medium</SelectItem>
                                <SelectItem value="3">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setEditingQuestionId(null)}>
                              <X className="h-4 w-4 mr-1" />Cancel
                            </Button>
                            <Button size="sm" onClick={() => saveQuestion(q.id)}>
                              <Check className="h-4 w-4 mr-1" />Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
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
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => startEditQuestion(q)}>
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteQuestion(q.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {tabQs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No {tab} questions yet.</p>
              )}
            </TabsContent>
          );
        })}

        {/* ── SETTINGS TAB ── */}
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Course Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Course Code</Label>
                  <Input
                    value={settingsDraft.code ?? ''}
                    onChange={(e) => setSettingsDraft((p) => ({ ...p, code: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Course Name</Label>
                  <Input
                    value={settingsDraft.name ?? ''}
                    onChange={(e) => setSettingsDraft((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea
                  rows={3}
                  value={settingsDraft.description ?? ''}
                  onChange={(e) => setSettingsDraft((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Credit Units</Label>
                  <Input
                    type="number"
                    value={settingsDraft.credit_units ?? 3}
                    onChange={(e) => setSettingsDraft((p) => ({ ...p, credit_units: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Pass Mark (%)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={settingsDraft.pass_mark ?? 60}
                    onChange={(e) => setSettingsDraft((p) => ({ ...p, pass_mark: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Sort Order</Label>
                  <Input
                    type="number"
                    value={settingsDraft.sort_order ?? 1}
                    onChange={(e) => setSettingsDraft((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Quiz Weight (0–1)</Label>
                  <Input
                    type="number"
                    step={0.1}
                    min={0}
                    max={1}
                    value={settingsDraft.quiz_weight ?? 0.4}
                    onChange={(e) => setSettingsDraft((p) => ({ ...p, quiz_weight: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Exam Weight (0–1)</Label>
                  <Input
                    type="number"
                    step={0.1}
                    min={0}
                    max={1}
                    value={settingsDraft.exam_weight ?? 0.6}
                    onChange={(e) => setSettingsDraft((p) => ({ ...p, exam_weight: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Quiz Attempt Limit</Label>
                  <Input
                    type="number"
                    value={settingsDraft.quiz_attempt_limit ?? 3}
                    onChange={(e) => setSettingsDraft((p) => ({ ...p, quiz_attempt_limit: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Exam Attempt Limit</Label>
                  <Input
                    type="number"
                    value={settingsDraft.exam_attempt_limit ?? 1}
                    onChange={(e) => setSettingsDraft((p) => ({ ...p, exam_attempt_limit: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Cooldown Hours</Label>
                  <Input
                    type="number"
                    value={settingsDraft.cooldown_hours ?? 24}
                    onChange={(e) => setSettingsDraft((p) => ({ ...p, cooldown_hours: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Exam Duration (minutes)</Label>
                <Input
                  type="number"
                  className="w-40"
                  value={settingsDraft.exam_duration_minutes ?? 60}
                  onChange={(e) => setSettingsDraft((p) => ({ ...p, exam_duration_minutes: Number(e.target.value) }))}
                />
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsDraft.is_premium ?? false}
                  onChange={(e) => setSettingsDraft((p) => ({ ...p, is_premium: e.target.checked }))}
                  className="h-4 w-4"
                />
                Premium course
              </label>

              <div className="flex justify-end">
                <Button onClick={saveSettings} disabled={savingSettings}>
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
