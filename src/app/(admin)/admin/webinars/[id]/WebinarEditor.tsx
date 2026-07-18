'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ImagePlus, Upload } from 'lucide-react';
import { eventPublicUrl } from '@/lib/urls';

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
  replay_url: string | null;
  thumbnail_url: string | null;
  whatsapp_community_url: string | null;
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
  const [replayUrl, setReplayUrl] = useState(webinar.replay_url ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(webinar.thumbnail_url ?? '');
  const [whatsappCommunityUrl, setWhatsappCommunityUrl] = useState(webinar.whatsapp_community_url ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);

  async function saveWebinar(nextStatus: 'draft' | 'published') {
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
          replay_url: replayUrl.trim() || null,
          thumbnail_url: thumbnailUrl.trim() || null,
          whatsapp_community_url: whatsappCommunityUrl.trim() || null,
          status: nextStatus,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? 'Failed to save');
        return;
      }
      toast.success(nextStatus === 'published' ? 'Webinar published' : 'Webinar saved as draft');
      if (nextStatus === 'published') {
        router.push('/admin/webinars');
        return;
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    await saveWebinar('published');
  }

  async function deleteWebinar(): Promise<void> {
    const message = registrationCount > 0
      ? 'This event has registrations, so it will be moved back to draft to preserve attendee records. Continue?'
      : 'Delete this event permanently? This cannot be undone.';

    if (!confirm(message)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/webinars/${webinar.id}`, { method: 'DELETE' });
      const data = await res.json() as { soft_deleted?: boolean; error?: string };

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to delete event');
        return;
      }

      toast.success(data.soft_deleted ? 'Event moved to draft' : 'Event deleted');
      router.push('/admin/webinars');
    } catch {
      toast.error('Failed to delete event');
    } finally {
      setDeleting(false);
    }
  }

  async function uploadThumbnail(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingThumbnail(true);
    try {
      const body = new FormData();
      body.append('thumbnail', file);
      const res = await fetch(`/api/admin/webinars/${webinar.id}/thumbnail`, {
        method: 'POST',
        body,
      });
      const data = await res.json() as { thumbnail_url?: string; error?: string };
      if (!res.ok || !data.thumbnail_url) {
        toast.error(data.error ?? 'Failed to upload event image');
        return;
      }
      setThumbnailUrl(data.thumbnail_url);
      toast.success('Event image uploaded');
      router.refresh();
    } catch {
      toast.error('Failed to upload event image');
    } finally {
      setUploadingThumbnail(false);
      event.target.value = '';
    }
  }

  async function copyLink() {
    const link = eventPublicUrl(slug);
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Registration link copied to clipboard');
    } catch (err) {
      console.error('[WebinarEditor] Failed to copy link:', err);
      toast.error('Could not copy link');
    }
  }

  return (
    <form onSubmit={handlePublish} className="w-full max-w-4xl flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Webinar</h1>
          <p className="mt-1 text-sm text-muted-foreground">Publish the landing page, manage the join link, and track attendance.</p>
        </div>
        <Link
          href={`/admin/webinars/${webinar.id}/attendees`}
          className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Attendees · {registrationCount}
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
        <span className="truncate text-xs font-mono text-muted-foreground">{eventPublicUrl(slug)}</span>
        <button
          type="button"
          onClick={() => void copyLink()}
          className="shrink-0 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          Copy link
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground">Event image</label>
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => void uploadThumbnail(event)}
          />
          <button
            type="button"
            className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            disabled={uploadingThumbnail}
            onClick={() => thumbnailInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {uploadingThumbnail ? 'Uploading...' : 'Upload event image'}
          </button>
          <p className="text-xs text-muted-foreground">JPG, PNG, or WebP. This image appears on the public event page.</p>
        </div>
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
          {thumbnailUrl ? (
            <Image src={thumbnailUrl} alt={title || 'Webinar image'} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs text-muted-foreground">
              <ImagePlus className="h-6 w-6" />
            </div>
          )}
        </div>
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
        <label className="text-xs text-muted-foreground">Replay URL</label>
        <input
          className="border rounded px-3 py-2 text-sm bg-background"
          value={replayUrl}
          onChange={(e) => setReplayUrl(e.target.value)}
          placeholder="https://youtu.be/..."
        />
        <p className="text-xs text-muted-foreground">After the scheduled duration ends, the public event link redirects here when this is set.</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">WhatsApp community invite URL</label>
        <input
          className="border rounded px-3 py-2 text-sm bg-background"
          value={whatsappCommunityUrl}
          onChange={(e) => setWhatsappCommunityUrl(e.target.value)}
          placeholder="https://chat.whatsapp.com/..."
        />
        <p className="text-xs text-muted-foreground">If set, registrants can opt in and will be redirected after registration.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={saving} className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {saving ? 'Publishing...' : 'Publish'}
        </button>
        <button type="button" onClick={() => void saveWebinar('draft')} disabled={saving} className="inline-flex min-h-10 items-center justify-center rounded-md border px-5 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50">
          Save as draft
        </button>
      </div>

      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm font-medium text-destructive">Delete event</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Events with registrations are moved to draft so attendee records are preserved.
        </p>
        <button
          type="button"
          onClick={() => void deleteWebinar()}
          disabled={deleting || saving}
          className="mt-3 inline-flex min-h-10 items-center justify-center rounded-md border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Delete event'}
        </button>
      </div>
    </form>
  );
}
