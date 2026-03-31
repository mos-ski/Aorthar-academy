'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Lesson {
  id: string;
  title: string;
  youtube_url: string;
  sort_order: number;
  is_published: boolean;
}

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  long_description: string;
  thumbnail_url: string | null;
  price_ngn: number;
  instructor_name: string;
  instructor_avatar_url: string | null;
  status: 'draft' | 'published';
}

export default function StandaloneCourseEditor({
  course,
  lessons: initialLessons,
}: {
  course: Course;
  lessons: Lesson[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState({
    title: course.title,
    slug: course.slug,
    description: course.description,
    long_description: course.long_description,
    thumbnail_url: course.thumbnail_url ?? '',
    price_ngn: String(course.price_ngn),
    instructor_name: course.instructor_name,
    instructor_avatar_url: course.instructor_avatar_url ?? '',
    status: course.status,
  });

  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [addingLesson, setAddingLesson] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: '', youtube_url: '' });
  const [lessonSaving, setLessonSaving] = useState<string | null>(null);

  async function saveCourse(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/standalone-courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, price_ngn: Number(fields.price_ngn) }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? 'Save failed');
        return;
      }
      toast.success('Course saved');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function addLesson(e: React.FormEvent) {
    e.preventDefault();
    setLessonSaving('new');
    try {
      const res = await fetch(`/api/admin/standalone-courses/${course.id}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newLesson.title,
          youtube_url: newLesson.youtube_url,
          sort_order: lessons.length + 1,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? 'Failed to add lesson');
        return;
      }
      const created: Lesson = await res.json();
      setLessons((prev) => [...prev, created]);
      setNewLesson({ title: '', youtube_url: '' });
      setAddingLesson(false);
      toast.success('Lesson added');
    } finally {
      setLessonSaving(null);
    }
  }

  async function updateLesson(lessonId: string, patch: Partial<Lesson>) {
    setLessonSaving(lessonId);
    try {
      const res = await fetch(`/api/admin/standalone-courses/${course.id}/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        toast.error('Failed to update lesson');
        return;
      }
      setLessons((prev) => prev.map((l) => (l.id === lessonId ? { ...l, ...patch } : l)));
    } finally {
      setLessonSaving(null);
    }
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm('Delete this lesson?')) return;
    setLessonSaving(lessonId);
    try {
      await fetch(`/api/admin/standalone-courses/${course.id}/lessons/${lessonId}`, { method: 'DELETE' });
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
      toast.success('Lesson deleted');
    } finally {
      setLessonSaving(null);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/standalone-courses" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-xl font-bold truncate">{course.title}</h1>
      </div>

      {/* Course details form */}
      <section className="mb-10">
        <h2 className="text-base font-semibold mb-4">Course Details</h2>
        <form onSubmit={saveCourse} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title">
              <input className="input" value={fields.title} onChange={(e) => setFields((f) => ({ ...f, title: e.target.value }))} required />
            </Field>
            <Field label="Slug (URL)">
              <input className="input font-mono" value={fields.slug} onChange={(e) => setFields((f) => ({ ...f, slug: e.target.value }))} required />
            </Field>
            <Field label="Price (₦ NGN)">
              <input className="input" type="number" min="0" value={fields.price_ngn} onChange={(e) => setFields((f) => ({ ...f, price_ngn: e.target.value }))} required />
            </Field>
            <Field label="Status">
              <select className="input" value={fields.status} onChange={(e) => setFields((f) => ({ ...f, status: e.target.value as 'draft' | 'published' }))}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
            <Field label="Instructor Name">
              <input className="input" value={fields.instructor_name} onChange={(e) => setFields((f) => ({ ...f, instructor_name: e.target.value }))} />
            </Field>
            <Field label="Instructor Avatar URL">
              <input className="input" type="url" value={fields.instructor_avatar_url} onChange={(e) => setFields((f) => ({ ...f, instructor_avatar_url: e.target.value }))} placeholder="https://…" />
            </Field>
            <Field label="Thumbnail URL" className="sm:col-span-2">
              <input className="input" type="url" value={fields.thumbnail_url} onChange={(e) => setFields((f) => ({ ...f, thumbnail_url: e.target.value }))} placeholder="https://…" />
            </Field>
          </div>
          <Field label="Short Description">
            <textarea className="input min-h-[72px] resize-y" value={fields.description} onChange={(e) => setFields((f) => ({ ...f, description: e.target.value }))} />
          </Field>
          <Field label="Full Description (shown on detail page)">
            <textarea className="input min-h-[120px] resize-y" value={fields.long_description} onChange={(e) => setFields((f) => ({ ...f, long_description: e.target.value }))} />
          </Field>
          <div>
            <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>

      {/* Lessons */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Lessons ({lessons.length})</h2>
          <button onClick={() => setAddingLesson(true)} className="text-sm px-3 py-1.5 rounded border hover:bg-muted">
            + Add Lesson
          </button>
        </div>

        {/* Add lesson form */}
        {addingLesson && (
          <form onSubmit={addLesson} className="mb-4 p-4 rounded-lg border bg-muted/20 flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Lesson Title">
                <input className="input" value={newLesson.title} onChange={(e) => setNewLesson((n) => ({ ...n, title: e.target.value }))} required placeholder="Welcome!" />
              </Field>
              <Field label="YouTube URL">
                <input className="input" value={newLesson.youtube_url} onChange={(e) => setNewLesson((n) => ({ ...n, youtube_url: e.target.value }))} placeholder="https://youtu.be/…" />
              </Field>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={lessonSaving === 'new'} className="px-4 py-1.5 text-sm font-semibold rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {lessonSaving === 'new' ? 'Adding…' : 'Add'}
              </button>
              <button type="button" onClick={() => setAddingLesson(false)} className="px-4 py-1.5 text-sm rounded border hover:bg-muted">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Lesson rows */}
        {lessons.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No lessons yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {lessons.map((lesson, i) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                index={i}
                saving={lessonSaving === lesson.id}
                onUpdate={(patch) => updateLesson(lesson.id, patch)}
                onDelete={() => deleteLesson(lesson.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ''}`}>
      <label className="text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function LessonRow({
  lesson,
  index,
  saving,
  onUpdate,
  onDelete,
}: {
  lesson: Lesson;
  index: number;
  saving: boolean;
  onUpdate: (patch: Partial<Lesson>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [youtubeUrl, setYoutubeUrl] = useState(lesson.youtube_url);

  function save() {
    onUpdate({ title, youtube_url: youtubeUrl });
    setEditing(false);
  }

  return (
    <div className="rounded-lg border p-4 bg-card">
      {editing ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Title">
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="YouTube URL">
              <input className="input" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtu.be/…" />
            </Field>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="px-3 py-1.5 text-xs font-semibold rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs rounded border hover:bg-muted">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-6 shrink-0">{index + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{lesson.title}</p>
            {lesson.youtube_url && (
              <p className="text-xs text-muted-foreground truncate font-mono">{lesson.youtube_url}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onUpdate({ is_published: !lesson.is_published })}
              disabled={saving}
              className={`text-xs px-2 py-1 rounded border ${lesson.is_published ? 'border-green-500/40 text-green-600' : 'border-yellow-500/40 text-yellow-600'}`}
            >
              {lesson.is_published ? 'Published' : 'Draft'}
            </button>
            <button onClick={() => setEditing(true)} className="text-xs text-muted-foreground hover:text-foreground">Edit</button>
            <button onClick={onDelete} disabled={saving} className="text-xs text-red-500 hover:text-red-600">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}
