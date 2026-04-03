'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Course {
  id: string;
  slug: string;
  title: string;
  price_ngn: number;
  status: 'draft' | 'published';
  created_at: string;
  purchaseCount: number;
}

export default function StandaloneCoursesAdmin({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function slugify(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/standalone-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, slug: newSlug, price_ngn: Number(newPrice) }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? 'Failed to create course');
        return;
      }
      const { id } = await res.json();
      toast.success('Course created');
      router.push(`/admin/standalone-courses/${id}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Bootcamps</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage bootcamps for bootcamp.aorthar.com</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          + New Course
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <form
          onSubmit={handleCreate}
          className="mb-8 p-5 rounded-lg border bg-card flex flex-col gap-4"
        >
          <h2 className="font-semibold">New Course</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1 flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Title</label>
              <input
                className="border rounded px-3 py-2 text-sm bg-background"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  setNewSlug(slugify(e.target.value));
                }}
                required
                placeholder="Product Management Bootcamp"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Slug (URL)</label>
              <input
                className="border rounded px-3 py-2 text-sm bg-background font-mono"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                required
                placeholder="product-management-bootcamp"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Price (₦)</label>
              <input
                className="border rounded px-3 py-2 text-sm bg-background"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                required
                placeholder="20000"
                min="0"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="px-4 py-2 text-sm rounded-md border hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Course list */}
      {courses.length === 0 ? (
        <p className="text-muted-foreground text-sm py-10 text-center">No courses yet. Create one above.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Slug</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Price</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Sales</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{course.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{course.slug}</td>
                  <td className="px-4 py-3 text-right">₦{course.price_ngn.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        course.status === 'published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{course.purchaseCount}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/standalone-courses/${course.id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
