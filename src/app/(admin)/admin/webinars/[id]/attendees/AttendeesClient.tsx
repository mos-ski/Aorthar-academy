'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import RichTextEditor from '@/components/ui/RichTextEditor';

interface Attendee {
  id: string;
  name: string;
  email: string;
  amountPaidNgn: number;
  registeredAt: string;
}

interface Webinar {
  id: string;
  title: string;
  slug: string;
  scheduled_at: string;
}

export default function AttendeesClient({ webinar, attendees }: { webinar: Webinar; attendees: Attendee[] }) {
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [sending, setSending] = useState(false);

  function exportCsv() {
    const header = ['Name', 'Email', 'Amount Paid (NGN)', 'Registered At'];
    const rows = attendees.map((a) => [
      a.name,
      a.email,
      String(a.amountPaidNgn),
      new Date(a.registeredAt).toISOString(),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${webinar.slug}-attendees.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleSend() {
    if (!subject.trim() || !bodyHtml.trim() || bodyHtml === '<p></p>') {
      toast.error('Write a subject and a message first');
      return;
    }
    if (!confirm(`Send this email to all ${attendees.length} registered attendees? This can't be undone.`)) return;

    setSending(true);
    try {
      const res = await fetch(`/api/admin/webinars/${webinar.id}/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body_html: bodyHtml }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to send broadcast');
        return;
      }
      toast.success(`Sent to ${data.sent} of ${data.total} attendees`);
      setSubject('');
      setBodyHtml('');
      setComposing(false);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-2">
        <Link href={`/admin/webinars/${webinar.id}`} className="text-xs text-muted-foreground hover:underline">
          ← Back to webinar
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{webinar.title} — Attendees</h1>
          <p className="text-sm text-muted-foreground mt-1">{attendees.length} registered</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            disabled={attendees.length === 0}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Export CSV
          </button>
          <button
            onClick={() => setComposing((c) => !c)}
            disabled={attendees.length === 0}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {composing ? 'Cancel broadcast' : 'New broadcast'}
          </button>
        </div>
      </div>

      {composing && (
        <div className="mb-8 p-5 rounded-lg border bg-card flex flex-col gap-4">
          <h2 className="font-semibold">Broadcast to all {attendees.length} attendees</h2>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Subject</label>
            <input
              className="border rounded px-3 py-2 text-sm bg-background"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Important update about tomorrow's session"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Message</label>
            <RichTextEditor content={bodyHtml} onChange={setBodyHtml} placeholder="Write your update…" minHeight="200px" />
          </div>
          <div>
            <button
              onClick={() => void handleSend()}
              disabled={sending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {sending ? 'Sending…' : `Send to ${attendees.length} attendees`}
            </button>
          </div>
        </div>
      )}

      {attendees.length === 0 ? (
        <p className="text-muted-foreground text-sm py-10 text-center">No one has registered yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="min-w-[560px] w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Paid</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendees.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{a.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.email}</td>
                    <td className="px-4 py-3 text-right">{a.amountPaidNgn > 0 ? `₦${a.amountPaidNgn.toLocaleString()}` : 'Free'}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {new Date(a.registeredAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
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
