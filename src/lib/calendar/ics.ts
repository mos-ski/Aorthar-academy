type WebinarInviteData = {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  joinUrl: string;
};

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export function buildWebinarIcs(data: WebinarInviteData): string {
  const startsAt = new Date(data.scheduledAt);
  const endsAt = new Date(startsAt.getTime() + data.durationMinutes * 60 * 1000);
  const now = new Date();

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aorthar Academy//Webinars//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:webinar-${data.id}@aorthar.com`,
    `DTSTAMP:${formatIcsDate(now)}`,
    `DTSTART:${formatIcsDate(startsAt)}`,
    `DTEND:${formatIcsDate(endsAt)}`,
    `SUMMARY:${escapeIcsText(data.title)}`,
    `DESCRIPTION:${escapeIcsText(`${data.description}\n\nJoin: ${data.joinUrl}`)}`,
    `LOCATION:${escapeIcsText(data.joinUrl)}`,
    `URL:${data.joinUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
