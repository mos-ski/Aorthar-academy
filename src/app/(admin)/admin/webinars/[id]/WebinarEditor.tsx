'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { urls } from '@/lib/urls';

interface Webinar {
  id: string;
  title: string;
  slug: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  capacity: number | null;
  price_ngn: number;
  join_url: string;
  status: 'draft' | 'published';
}

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function WebinarEditor({ webinar, registrationCount }: { webinar: Webinar; registrationCount: number }) {
  const router = useRouter();
  const [title, setTitle] = useState(webinar.title);
  const [slug, setSlug] = useState(webinar.slug);
  const [description, setDescription] = useState(webinar.description);
  const [scheduledAt, setScheduledAt] = useState(toLocalInputValue(webinar.scheduled_at));
  const [durationMinutes, setDurationMinutes] = useState(String(webinar.duration_minutes));
  const [capacity, setCapacity] = useState(webinar.capacity != null ? String(webinar.capacity) : '');
  const [priceNgn, setPriceNgn] = useState(String(webinar.price_ngn));
  const [joinUrl, setJoinUrl] = useState(webinar.join_url);
  const [status, setStatus] = useState(webinar.status);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/webinars/${webinar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description,
          scheduled_at: new Date(scheduledAt).toISOString(),
          duration_minutes: durationMinutes,
          capacity: capacity === '' ? null : capacity,
          price_ngn: priceNgn,
          join_url: joinUrl,
          status,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? 'Failed to save');
        return;
      }
      toast.success('Saved');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    const link = `${urls.events()}/events/${slug}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Registration link copied to clipboard');
    } catch (err) {
      console.error('[WebinarEditor] Failed to copy link:', err);
      toast.error('Could not copy link');
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this webinar? If it has registrations it will be unpublished instead.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/webinars/${webinar.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? 'Failed to delete');
        return;
      }
      toast.success('Deleted');
      router.push('/admin/webinars');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="w-full max-w-2xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Webinar</h1>
        <Link href={`/admin/webinars/${webinar.id}/attendees`} className="text-sm font-medium text-primary hover:underline">
          {registrationCount} registered →
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Title</label>
        <input className="border rounded px-3 py-2 text-sm bg-background" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Slug (URL)</label>
        <input className="border rounded px-3 py-2 text-sm bg-background font-mono" value={slug} onChange={(e) => setSlug(e.target.value)} required />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
        <span className="truncate text-xs font-mono text-muted-foreground">{urls.events()}/events/{slug}</span>
        <button
          type="button"
          onClick={() => void copyLink()}
          className="shrink-0 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          Copy link
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Description</label>
        <textarea className="border rounded px-3 py-2 text-sm bg-background min-h-32" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Date & time</label>
          <input type="datetime-local" className="border rounded px-3 py-2 text-sm bg-background" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Duration (minutes)</label>
          <input type="number" min="1" className="border rounded px-3 py-2 text-sm bg-background" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Capacity (blank = unlimited)</label>
          <input type="number" min="1" className="border rounded px-3 py-2 text-sm bg-background" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Price (₦, 0 = free)</label>
          <input type="number" min="0" className="border rounded px-3 py-2 text-sm bg-background" value={priceNgn} onChange={(e) => setPriceNgn(e.target.value)} required />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Join URL (Zoom / Google Meet link)</label>
        <input className="border rounded px-3 py-2 text-sm bg-background" value={joinUrl} onChange={(e) => setJoinUrl(e.target.value)} placeholder="https://zoom.us/j/..." />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Status</label>
        <select className="border rounded px-3 py-2 text-sm bg-background" value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button type="button" onClick={() => void handleDelete()} disabled={deleting} className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950/30">
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </form>
  );
}
