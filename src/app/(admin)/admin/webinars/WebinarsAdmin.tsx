'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Webinar {
  id: string;
  slug: string;
  title: string;
  scheduled_at: string;
  price_ngn: number;
  status: 'draft' | 'published';
  registrationCount: number;
}

export default function WebinarsAdmin({ webinars }: { webinars: Webinar[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newScheduledAt, setNewScheduledAt] = useState('');
  const [newPrice, setNewPrice] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  function slugify(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/webinars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          slug: newSlug,
          scheduled_at: new Date(newScheduledAt).toISOString(),
          price_ngn: Number(newPrice),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? 'Failed to create webinar');
        return;
      }
      const { id } = await res.json();
      toast.success('Webinar created');
      router.push(`/admin/webinars/${id}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webinars</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage live classes for events.aorthar.com</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto"
        >
          + New Webinar
        </button>
      </div>

      {creating && (
        <form
          onSubmit={handleCreate}
          className="mb-8 p-5 rounded-lg border bg-card flex flex-col gap-4"
        >
          <h2 className="font-semibold">New Webinar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Title</label>
              <input
                className="border rounded px-3 py-2 text-sm bg-background"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  setNewSlug(slugify(e.target.value));
                }}
                required
                placeholder="Live Q&A: Breaking into Product"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Slug (URL)</label>
              <input
                className="border rounded px-3 py-2 text-sm bg-background font-mono"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Date & time</label>
              <input
                type="datetime-local"
                className="border rounded px-3 py-2 text-sm bg-background"
                value={newScheduledAt}
                onChange={(e) => setNewScheduledAt(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Price (₦, 0 = free)</label>
              <input
                className="border rounded px-3 py-2 text-sm bg-background"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                required
                min="0"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {webinars.length === 0 ? (
        <p className="text-muted-foreground text-sm py-10 text-center">No webinars yet. Create one above.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">When</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Price</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Registrations</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {webinars.map((webinar) => (
                  <tr key={webinar.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{webinar.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(webinar.scheduled_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-right">{webinar.price_ngn > 0 ? `₦${webinar.price_ngn.toLocaleString()}` : 'Free'}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          webinar.status === 'published'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {webinar.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{webinar.registrationCount}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/webinars/${webinar.id}`}
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
        </div>
      )}
    </div>
  );
}
