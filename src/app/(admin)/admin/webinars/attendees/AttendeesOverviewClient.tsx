'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

type Attendee = {
  id: string;
  webinarId: string;
  webinarTitle: string;
  webinarSlug: string;
  name: string;
  email: string;
  whatsappNumber: string;
  wantsWhatsappCommunity: boolean;
  amountPaidNgn: number;
  registeredAt: string;
  attendedAt: string | null;
};

export default function AttendeesOverviewClient({ attendees }: { attendees: Attendee[] }) {
  const [rows, setRows] = useState(attendees);
  const attendedCount = rows.filter((attendee) => attendee.attendedAt).length;

  function exportCsv(): void {
    const header = ['Webinar', 'Name', 'Email', 'WhatsApp', 'Community Opt-in', 'Amount Paid (NGN)', 'Registered At', 'Attended At'];
    const csvRows = rows.map((attendee) => [
      attendee.webinarTitle,
      attendee.name,
      attendee.email,
      attendee.whatsappNumber,
      attendee.wantsWhatsappCommunity ? 'Yes' : 'No',
      String(attendee.amountPaidNgn),
      new Date(attendee.registeredAt).toISOString(),
      attendee.attendedAt ? new Date(attendee.attendedAt).toISOString() : '',
    ]);
    const csv = [header, ...csvRows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'webinar-attendees.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function toggleAttendance(attendee: Attendee): Promise<void> {
    const nextAttended = !attendee.attendedAt;
    setRows((current) => current.map((row) => (
      row.id === attendee.id
        ? { ...row, attendedAt: nextAttended ? new Date().toISOString() : null }
        : row
    )));

    try {
      const res = await fetch(`/api/admin/webinars/${attendee.webinarId}/attendees/${attendee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attended: nextAttended }),
      });
      const data = await res.json() as { attended_at?: string | null; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to update attendance');
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
    <div className="w-full max-w-6xl">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendees</h1>
          <p className="mt-1 text-sm text-muted-foreground">{rows.length} registered · {attendedCount} attended</p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={rows.length === 0}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 sm:w-auto"
        >
          Export CSV
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No webinar registrations yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Webinar</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Attendee</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">WhatsApp</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Paid</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Attendance</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/admin/webinars/${attendee.webinarId}`} className="font-medium hover:underline">
                        {attendee.webinarTitle}
                      </Link>
                      {attendee.webinarSlug && <p className="font-mono text-xs text-muted-foreground">{attendee.webinarSlug}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{attendee.name}</p>
                      <p className="text-xs text-muted-foreground">{attendee.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div>{attendee.whatsappNumber}</div>
                      {attendee.wantsWhatsappCommunity && <div className="text-[11px] text-emerald-600 dark:text-emerald-300">Community opt-in</div>}
                    </td>
                    <td className="px-4 py-3 text-right">{attendee.amountPaidNgn > 0 ? `₦${attendee.amountPaidNgn.toLocaleString()}` : 'Free'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => void toggleAttendance(attendee)}
                        className={attendee.attendedAt
                          ? 'rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300'
                          : 'rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground'}
                      >
                        {attendee.attendedAt ? 'Attended' : 'Mark attended'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {new Date(attendee.registeredAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
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
