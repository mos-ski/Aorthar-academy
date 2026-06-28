'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Attendee {
  id: string;
  name: string;
  email: string;
  whatsappNumber: string;
  wantsWhatsappCommunity: boolean;
  amountPaidNgn: number;
  registeredAt: string;
  attendedAt: string | null;
}

interface Webinar {
  id: string;
  title: string;
  slug: string;
  scheduled_at: string;
}

export default function AttendeesClient({ webinar, attendees }: { webinar: Webinar; attendees: Attendee[] }) {
  const [rows, setRows] = useState(attendees);

  const attendedCount = rows.filter((attendee) => attendee.attendedAt).length;

  function exportCsv() {
    const header = ['Name', 'Email', 'WhatsApp', 'Community Opt-in', 'Amount Paid (NGN)', 'Registered At', 'Attended At'];
    const csvRows = rows.map((a) => [
      a.name,
      a.email,
      a.whatsappNumber,
      a.wantsWhatsappCommunity ? 'Yes' : 'No',
      String(a.amountPaidNgn),
      new Date(a.registeredAt).toISOString(),
      a.attendedAt ? new Date(a.attendedAt).toISOString() : '',
    ]);
    const csv = [header, ...csvRows]
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

  async function toggleAttendance(attendee: Attendee) {
    const nextAttended = !attendee.attendedAt;
    setRows((current) => current.map((row) => (
      row.id === attendee.id
        ? { ...row, attendedAt: nextAttended ? new Date().toISOString() : null }
        : row
    )));

    try {
      const res = await fetch(`/api/admin/webinars/${webinar.id}/attendees/${attendee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attended: nextAttended }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to update attendance');
      }
      setRows((current) => current.map((row) => (
        row.id === attendee.id ? { ...row, attendedAt: data.attended_at ?? null } : row
      )));
    } catch (error) {
      setRows((current) => current.map((row) => (
        row.id === attendee.id ? { ...row, attendedAt: attendee.attendedAt } : row
      )));
      toast.error(error instanceof Error ? error.message : 'Failed to update attendance');
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
          <p className="text-sm text-muted-foreground mt-1">{rows.length} registered · {attendedCount} attended</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            disabled={rows.length === 0}
            className="inline-flex min-h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm py-10 text-center">No one has registered yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">WhatsApp</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Paid</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Attendance</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{a.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div>{a.whatsappNumber}</div>
                      {a.wantsWhatsappCommunity && <div className="text-[11px] text-emerald-600 dark:text-emerald-300">Community opt-in</div>}
                    </td>
                    <td className="px-4 py-3 text-right">{a.amountPaidNgn > 0 ? `₦${a.amountPaidNgn.toLocaleString()}` : 'Free'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => void toggleAttendance(a)}
                        className={a.attendedAt
                          ? 'rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300'
                          : 'rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground'}
                      >
                        {a.attendedAt ? 'Attended' : 'Mark attended'}
                      </button>
                    </td>
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
