'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { eventPublicUrl } from '@/lib/urls';

interface Webinar {
  id: string;
  slug: string;
  title: string;
  scheduled_at: string;
  price_ngn: number;
  status: 'draft' | 'published';
  thumbnail_url: string | null;
  registrationCount: number;
  attendedCount: number;
}

async function copyWebinarLink(slug: string) {
  const link = eventPublicUrl(slug);
  try {
    await navigator.clipboard.writeText(link);
    toast.success('Registration link copied to clipboard');
  } catch (err) {
    console.error('[WebinarsAdmin] Failed to copy link:', err);
    toast.error('Could not copy link');
  }
}

export default function WebinarsAdmin({ webinars }: { webinars: Webinar[] }) {
  const router = useRouter();
  const [webinarRows, setWebinarRows] = useState(webinars);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newScheduledAt, setNewScheduledAt] = useState('');
  const [newPrice, setNewPrice] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function slugify(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function makeEventCode(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  }

  function shortenSlug() {
    setNewSlug(makeEventCode());
  }

  function getStatusLabel(webinar: Webinar): { label: string; className: string } {
    if (webinar.status === 'draft') {
      return {
        label: 'Draft',
        className: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300',
      };
    }
    const startsAt = new Date(webinar.scheduled_at).getTime();
    const endsAt = startsAt + 2 * 60 * 60 * 1000;
    const now = Date.now();
    if (now > endsAt) {
      return {
        label: 'Ended',
        className: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
      };
    }
    if (now >= startsAt && now <= endsAt) {
      return {
        label: 'Live',
        className: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300',
      };
    }
    return {
      label: 'Published',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300',
    };
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

  async function deleteWebinar(webinar: Webinar): Promise<void> {
    const message = webinar.registrationCount > 0
      ? 'This event has registrations, so it will be moved back to draft to preserve attendee records. Continue?'
      : 'Delete this event permanently? This cannot be undone.';

    if (!confirm(message)) return;

    setDeletingId(webinar.id);
    try {
      const res = await fetch(`/api/admin/webinars/${webinar.id}`, { method: 'DELETE' });
      const data = await res.json() as { soft_deleted?: boolean; error?: string };

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to delete event');
        return;
      }

      if (data.soft_deleted) {
        setWebinarRows((current) => current.map((row) => row.id === webinar.id ? { ...row, status: 'draft' } : row));
        toast.success('Event moved to draft');
      } else {
        setWebinarRows((current) => current.filter((row) => row.id !== webinar.id));
        toast.success('Event deleted');
      }

      router.refresh();
    } catch {
      toast.error('Failed to delete event');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webinars</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage live classes and registration links.</p>
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
              <div className="flex gap-1.5">
                <input
                  className="border rounded px-3 py-2 text-sm bg-background font-mono min-w-0 flex-1"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={shortenSlug}
                  title="Generate a short event code"
                  className="shrink-0 rounded border px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Code
                </button>
              </div>
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

      {webinarRows.length === 0 ? (
        <p className="text-muted-foreground text-sm py-10 text-center">No webinars yet. Create one above.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Event</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">When</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Price</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Attendees</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {webinarRows.map((webinar) => {
                  const status = getStatusLabel(webinar);
                  return (
                  <tr key={webinar.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 overflow-hidden rounded-md border bg-muted">
                          {webinar.thumbnail_url ? (
                            <Image src={webinar.thumbnail_url} alt="" fill className="object-cover" unoptimized />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-muted-foreground">
                              LIVE
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{webinar.title}</p>
                          <p className="truncate font-mono text-xs text-muted-foreground">{eventPublicUrl(webinar.slug)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(webinar.scheduled_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-right">{webinar.price_ngn > 0 ? `₦${webinar.price_ngn.toLocaleString()}` : 'Free'}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/webinars/${webinar.id}/attendees`} className="text-muted-foreground hover:text-foreground hover:underline">
                        {webinar.attendedCount}/{webinar.registrationCount}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => void copyWebinarLink(webinar.slug)}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline mr-4"
                      >
                        Copy link
                      </button>
                      <Link
                        href={`/admin/webinars/${webinar.id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Edit →
                      </Link>
                      <button
                        type="button"
                        onClick={() => void deleteWebinar(webinar)}
                        disabled={deletingId === webinar.id}
                        className="ml-4 text-xs font-medium text-destructive hover:underline disabled:opacity-50"
                      >
                        {deletingId === webinar.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
