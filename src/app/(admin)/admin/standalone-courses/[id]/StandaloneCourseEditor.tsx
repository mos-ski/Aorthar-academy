'use client';

import { useRef, useState } from 'react';
import { ChevronDown, ImagePlus, Upload } from 'lucide-react';
import Image from 'next/image';
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
  sale_type?: SaleType | null;
  status: 'draft' | 'published';
}

type SaleType = 'pre_sale' | 'live_class' | 'recorded_course';

type Instructor = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

type CourseFields = {
  title: string;
  slug: string;
  description: string;
  long_description: string;
  thumbnail_url: string;
  price_ngn: string;
  instructor_name: string;
  instructor_avatar_url: string;
  sale_type: SaleType;
  status: 'draft' | 'published';
};

const saleTypeOptions: { value: SaleType; label: string; description: string }[] = [
  {
    value: 'pre_sale',
    label: 'Pre-sale',
    description: 'Sell before the class is ready. Lessons are not needed yet.',
  },
  {
    value: 'live_class',
    label: 'Live class',
    description: 'Students join live first. Recordings can be added later.',
  },
  {
    value: 'recorded_course',
    label: 'Recorded course',
    description: 'Self-paced course. Upload lessons before publishing.',
  },
];

export default function StandaloneCourseEditor({
  course,
  instructors,
  lessons: initialLessons,
  purchaseCount,
}: {
  course: Course;
  instructors: Instructor[];
  lessons: Lesson[];
  purchaseCount: number;
}) {
  const router = useRouter();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [instructorMenuOpen, setInstructorMenuOpen] = useState(false);
  const [fields, setFields] = useState<CourseFields>({
    title: course.title,
    slug: course.slug,
    description: course.description,
    long_description: course.long_description,
    thumbnail_url: course.thumbnail_url ?? '',
    price_ngn: String(course.price_ngn),
    instructor_name: course.instructor_name,
    instructor_avatar_url: course.instructor_avatar_url ?? '',
    sale_type: course.sale_type ?? 'recorded_course',
    status: course.status,
  });

  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [addingLesson, setAddingLesson] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: '', youtube_url: '' });
  const [lessonSaving, setLessonSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const selectedSaleType = saleTypeOptions.find((option) => option.value === fields.sale_type) ?? saleTypeOptions[2];
  const lessonsAreExpected = fields.sale_type === 'recorded_course';

  async function saveCourse(e: React.FormEvent): Promise<void> {
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
      const data = await res.json() as { warning?: string; sale_type_persisted?: boolean };
      if (data.warning || data.sale_type_persisted === false) {
        toast.warning(data.warning ?? 'Course saved, but sale type could not be persisted yet.');
        return;
      }
      toast.success('Course saved');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function uploadThumbnail(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append('thumbnail', file);
      const res = await fetch(`/api/admin/standalone-courses/${course.id}/thumbnail`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json() as { thumbnail_url?: string; error?: string };
      if (!res.ok || !data.thumbnail_url) {
        toast.error(data.error ?? 'Thumbnail upload failed');
        return;
      }
      setFields((f) => ({ ...f, thumbnail_url: data.thumbnail_url ?? '' }));
      toast.success('Thumbnail uploaded');
      router.refresh();
    } finally {
      setUploadingThumbnail(false);
      e.target.value = '';
    }
  }

  function selectInstructor(instructor: Instructor): void {
    setFields((f) => ({
      ...f,
      instructor_name: instructor.full_name ?? instructor.email ?? 'Aorthar Instructor',
      instructor_avatar_url: instructor.avatar_url ?? '',
    }));
    setInstructorMenuOpen(false);
  }

  async function addLesson(e: React.FormEvent): Promise<void> {
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

  async function updateLesson(lessonId: string, patch: Partial<Lesson>): Promise<void> {
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

  async function deleteLesson(lessonId: string): Promise<void> {
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

  async function deleteCourse(): Promise<void> {
    const action = purchaseCount > 0 ? 'unpublish' : 'permanently delete';
    if (!confirm(`Are you sure you want to ${action} "${course.title}"?${purchaseCount > 0 ? ' This bootcamp has purchases, so it will be unpublished instead of deleted.' : ' This action cannot be undone.'}`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/standalone-courses/${course.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? 'Failed to delete bootcamp');
        return;
      }
      const data = await res.json() as { soft_deleted?: boolean };
      if (data.soft_deleted) {
        toast.success('Bootcamp unpublished (has existing purchases)');
        router.refresh();
      } else {
        toast.success('Bootcamp deleted');
        router.push('/admin/standalone-courses');
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-7xl">
      <div className="mb-8 flex items-center gap-3">
        <Link href="/admin/standalone-courses" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="truncate text-xl font-bold">{course.title}</h1>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          {/* Course details form */}
          <section className="mb-10">
            <h2 className="mb-4 text-base font-semibold">Course Details</h2>
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
            <Field label="Instructor">
              <div className="relative">
                <button
                  type="button"
                  className="input flex h-10 w-full items-center justify-between gap-3 text-left"
                  onClick={() => setInstructorMenuOpen((open) => !open)}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <AvatarPreview name={fields.instructor_name} avatarUrl={fields.instructor_avatar_url} className="size-6" />
                    <span className="truncate">{fields.instructor_name || 'Select instructor'}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                {instructorMenuOpen && (
                  <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-md border bg-background p-1 shadow-xl">
                    {instructors.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-muted-foreground">No instructors found. Add one in Bootcamps → Instructors.</p>
                    ) : (
                      instructors.map((instructor) => (
                        <button
                          key={instructor.id}
                          type="button"
                          className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm hover:bg-muted"
                          onClick={() => selectInstructor(instructor)}
                        >
                          <AvatarPreview
                            name={instructor.full_name ?? instructor.email ?? 'Instructor'}
                            avatarUrl={instructor.avatar_url}
                            className="size-8"
                          />
                          <span className="min-w-0">
                            <span className="block truncate font-medium">
                              {instructor.full_name ?? instructor.email ?? 'Unnamed instructor'}
                            </span>
                            {instructor.email && (
                              <span className="block truncate text-xs text-muted-foreground">{instructor.email}</span>
                            )}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </Field>
            <Field label="Sale Type">
              <select
                className="input"
                value={fields.sale_type}
                onChange={(e) => setFields((f) => ({ ...f, sale_type: e.target.value as SaleType }))}
              >
                {saleTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <p className="text-[11px] leading-4 text-muted-foreground">{selectedSaleType.description}</p>
            </Field>
            <Field label="Thumbnail" className="sm:col-span-2">
              <div className="flex flex-col gap-3 rounded-lg border border-dashed p-3 sm:flex-row sm:items-center">
                <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted sm:w-44">
                  {fields.thumbnail_url ? (
                    <Image src={fields.thumbnail_url} alt={fields.title} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImagePlus className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={uploadThumbnail}
                  />
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                    disabled={uploadingThumbnail}
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingThumbnail ? 'Uploading...' : 'Upload thumbnail'}
                  </button>
                  <p className="mt-2 truncate text-xs text-muted-foreground">
                    {fields.thumbnail_url || 'JPG, PNG, or WebP. This replaces the old URL field.'}
                  </p>
                </div>
              </div>
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
          {lessonsAreExpected && (
            <button type="button" onClick={() => setAddingLesson(true)} className="text-sm px-3 py-1.5 rounded border hover:bg-muted">
              + Add Lesson
            </button>
          )}
        </div>

        {!lessonsAreExpected && (
          <div className="mb-4 rounded-lg border bg-muted/20 p-4">
            <p className="text-sm font-medium">
              {fields.sale_type === 'pre_sale' ? 'Pre-sale bootcamp' : 'Live class bootcamp'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {fields.sale_type === 'pre_sale'
                ? 'You can publish and collect interest before uploading lessons.'
                : 'Recordings will be available later, so lesson uploads can wait until after the live sessions.'}
            </p>
          </div>
        )}

        {/* Add lesson form */}
        {addingLesson && lessonsAreExpected && (
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

      {/* Danger Zone */}
      <section className="mt-10 rounded-lg border border-destructive/30 bg-card p-6">
        <h2 className="font-semibold text-base text-destructive mb-2">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {purchaseCount > 0
            ? `This bootcamp has ${purchaseCount} purchase${purchaseCount !== 1 ? 's' : ''}. Deleting will unpublish it instead of permanently removing it, so existing students keep access.`
            : 'No purchases exist. This bootcamp can be permanently deleted.'}
        </p>
        <button
          type="button"
          onClick={deleteCourse}
          disabled={deleting}
          className="px-4 py-2 text-sm font-semibold rounded-md border border-destructive/50 text-destructive hover:bg-destructive/10 disabled:opacity-50"
        >
          {deleting ? 'Processing…' : purchaseCount > 0 ? 'Unpublish Bootcamp' : 'Delete Bootcamp'}
        </button>
      </section>
        </div>

        <CoursePreview
          fields={fields}
          lessonsCount={lessons.filter((lesson) => lesson.is_published).length}
          saleTypeLabel={selectedSaleType.label}
        />
      </div>
    </div>
  );
}

function AvatarPreview({
  name,
  avatarUrl,
  className,
}: {
  name: string;
  avatarUrl: string | null;
  className?: string;
}): React.ReactElement {
  const initials = getInitials(name);

  return (
    <span className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-bold text-primary-foreground ${className ?? ''}`}>
      {avatarUrl ? (
        <Image src={avatarUrl} alt={name} fill className="object-cover" unoptimized />
      ) : (
        initials
      )}
    </span>
  );
}

function CoursePreview({
  fields,
  lessonsCount,
  saleTypeLabel,
}: {
  fields: CourseFields;
  lessonsCount: number;
  saleTypeLabel: string;
}): React.ReactElement {
  const price = Number(fields.price_ngn || 0);
  const longDescriptionLines = fields.long_description
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 4);

  return (
    <aside className="xl:sticky xl:top-6 xl:self-start">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Live Preview</h2>
          <p className="text-xs text-muted-foreground">Public bootcamp card and detail snapshot</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${fields.status === 'published' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
          {fields.status}
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border bg-[#18191a] text-white shadow-2xl shadow-black/20">
        <div className="relative aspect-video bg-[#101112]">
          {fields.thumbnail_url ? (
            <Image src={fields.thumbnail_url} alt={fields.title} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#08694a] text-white/45">
              <ImagePlus className="h-8 w-8" />
              <span className="text-xs">Upload thumbnail</span>
            </div>
          )}
          <div className="absolute left-3 top-3 rounded bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/80">
            {saleTypeLabel}
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight">{fields.title || 'Untitled bootcamp'}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/55">
              {fields.description || 'Short description will appear here.'}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex min-w-0 items-center gap-2">
              <AvatarPreview
                name={fields.instructor_name || 'Instructor'}
                avatarUrl={fields.instructor_avatar_url}
                className="size-7 bg-[#a7d252] text-[#18191a]"
              />
              <span className="truncate text-xs text-white/55">{fields.instructor_name || 'Instructor'}</span>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-white/35">
                {fields.sale_type === 'recorded_course' ? `${lessonsCount} lessons` : 'Recordings later'}
              </p>
              <p className="text-sm font-bold text-[#a7d252]">₦{price.toLocaleString()}</p>
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/35">Detail page copy</p>
            {longDescriptionLines.length > 0 ? (
              <div className="space-y-1 text-xs leading-5 text-white/55">
                {longDescriptionLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/35">Full description preview appears here.</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function getInitials(name: string): string {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return initials || 'AI';
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }): React.ReactElement {
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
}): React.ReactElement {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [youtubeUrl, setYoutubeUrl] = useState(lesson.youtube_url);

  function save(): void {
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
            <button type="button" onClick={save} disabled={saving} className="px-3 py-1.5 text-xs font-semibold rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs rounded border hover:bg-muted">Cancel</button>
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
              type="button"
              onClick={() => onUpdate({ is_published: !lesson.is_published })}
              disabled={saving}
              className={`text-xs px-2 py-1 rounded border ${lesson.is_published ? 'border-green-500/40 text-green-600' : 'border-yellow-500/40 text-yellow-600'}`}
            >
              {lesson.is_published ? 'Published' : 'Draft'}
            </button>
            <button type="button" onClick={() => setEditing(true)} className="text-xs text-muted-foreground hover:text-foreground">Edit</button>
            <button type="button" onClick={onDelete} disabled={saving} className="text-xs text-red-500 hover:text-red-600">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}
