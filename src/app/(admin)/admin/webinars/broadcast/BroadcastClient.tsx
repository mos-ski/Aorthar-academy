'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/ui/RichTextEditor';

type WebinarOption = {
  id: string;
  title: string;
  scheduled_at: string;
};

type BroadcastHistoryItem = {
  id: string;
  webinar_id: string;
  subject: string;
  body_html: string;
  recipient_count: number;
  sent_at: string;
};

type BroadcastResponse = {
  ok?: boolean;
  sent?: number;
  total?: number;
  broadcast?: BroadcastHistoryItem;
  error?: string;
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function BroadcastClient({
  webinars,
  initialBroadcasts,
}: {
  webinars: WebinarOption[];
  initialBroadcasts: BroadcastHistoryItem[];
}) {
  const [webinarId, setWebinarId] = useState(webinars[0]?.id ?? '');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [broadcasts, setBroadcasts] = useState(initialBroadcasts);
  const [view, setView] = useState<'compose' | 'history'>('compose');
  const [sending, setSending] = useState(false);

  const webinarTitleById = new Map(webinars.map((webinar) => [webinar.id, webinar.title]));
  const selectedBroadcasts = broadcasts.filter((broadcast) => !webinarId || broadcast.webinar_id === webinarId);

  async function sendBroadcast(): Promise<void> {
    if (!webinarId) {
      toast.error('Choose a webinar first');
      return;
    }
    if (!subject.trim() || !bodyHtml.trim() || bodyHtml === '<p></p>') {
      toast.error('Write a subject and a message first');
      return;
    }
    if (!confirm('Send this broadcast to everyone registered for the selected webinar?')) return;

    setSending(true);
    try {
      const res = await fetch(`/api/admin/webinars/${webinarId}/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body_html: bodyHtml }),
      });
      const data = await res.json() as BroadcastResponse;
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to send broadcast');
        return;
      }
      toast.success(`Sent to ${data.sent ?? 0} of ${data.total ?? 0} attendees`);
      if (data.broadcast) {
        setBroadcasts((current) => [data.broadcast as BroadcastHistoryItem, ...current.filter((item) => item.id !== data.broadcast?.id)]);
      }
      setSubject('');
      setBodyHtml('');
      setView('history');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Broadcast</h1>
        <p className="mt-1 text-sm text-muted-foreground">Send an update to registered attendees for a webinar.</p>
      </div>

      <div className="mb-4 inline-flex rounded-md border bg-muted/30 p-1">
        <button
          type="button"
          onClick={() => setView('compose')}
          className={`rounded px-3 py-1.5 text-sm font-medium ${view === 'compose' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Compose
        </button>
        <button
          type="button"
          onClick={() => setView('history')}
          className={`rounded px-3 py-1.5 text-sm font-medium ${view === 'history' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          History
        </button>
      </div>

      <div className="rounded-lg border bg-card p-5">
        <div className="grid gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Webinar</label>
            <select
              className="h-11 rounded-md border bg-background px-3 text-sm"
              value={webinarId}
              onChange={(event) => setWebinarId(event.target.value)}
            >
              {webinars.length === 0 ? (
                <option value="">No webinars yet</option>
              ) : webinars.map((webinar) => (
                <option key={webinar.id} value={webinar.id}>
                  {webinar.title} - {new Date(webinar.scheduled_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                </option>
              ))}
            </select>
          </div>

          {view === 'compose' ? (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Subject</label>
                <input
                  className="h-11 rounded-md border bg-background px-3 text-sm"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Important update about the session"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Message</label>
                <RichTextEditor content={bodyHtml} onChange={setBodyHtml} placeholder="Write your update..." minHeight="240px" />
              </div>

              <button
                type="button"
                onClick={() => void sendBroadcast()}
                disabled={sending || webinars.length === 0}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-fit"
              >
                {sending ? 'Sending...' : 'Send broadcast'}
              </button>
            </>
          ) : (
            <div className="divide-y rounded-md border">
              {selectedBroadcasts.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">No broadcasts sent for this webinar yet.</p>
              ) : selectedBroadcasts.map((broadcast) => (
                <article key={broadcast.id} className="grid gap-2 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-sm font-semibold">{broadcast.subject}</h2>
                      <p className="text-xs text-muted-foreground">{webinarTitleById.get(broadcast.webinar_id) ?? 'Webinar'}</p>
                    </div>
                    <div className="text-left text-xs text-muted-foreground sm:text-right">
                      <p>{new Date(broadcast.sent_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      <p>{broadcast.recipient_count} recipient{broadcast.recipient_count === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{stripHtml(broadcast.body_html) || 'No preview available'}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
