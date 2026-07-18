import { describe, expect, it } from 'vitest';
import {
  contactsToCsv,
  contactsToExcelXml,
  filterContactsForExport,
  getContactSourceOptions,
} from '@/lib/admin/contacts';
import type { ContactRow } from '@/lib/admin/contacts';

const rows: ContactRow[] = [
  {
    contact_key: 'ada@example.com',
    first_name: 'Ada',
    last_name: 'Lovelace',
    full_name: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '+2348012345678',
    sources: ['University', 'Webinar'],
    tags: ['Product Design', 'Webinar: Growth Clinic'],
    source_count: 2,
    created_at: '2026-06-01T09:00:00.000Z',
    last_seen_at: '2026-06-20T12:00:00.000Z',
  },
  {
    contact_key: 'studio@example.com',
    first_name: 'Studio',
    last_name: 'Lead',
    full_name: 'Studio Lead',
    email: 'studio@example.com',
    phone: null,
    sources: ['Studio'],
    tags: ['Studio: Brand, Web'],
    source_count: 1,
    created_at: '2026-05-01T09:00:00.000Z',
    last_seen_at: '2026-05-01T09:00:00.000Z',
  },
];

describe('contact filtering', () => {
  it('matches search text against name, email, and phone', () => {
    expect(filterContactsForExport(rows, { q: 'ada', source: 'all' })).toHaveLength(1);
    expect(filterContactsForExport(rows, { q: 'studio@example.com', source: 'all' })).toHaveLength(1);
    expect(filterContactsForExport(rows, { q: '08012345678', source: 'all' })).toHaveLength(1);
  });

  it('filters by source across merged contacts', () => {
    const filtered = filterContactsForExport(rows, { q: '', source: 'Webinar' });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.email).toBe('ada@example.com');
  });

  it('returns sorted source options', () => {
    expect(getContactSourceOptions(rows)).toEqual(['Studio', 'University', 'Webinar']);
  });
});

describe('contact exports', () => {
  it('serializes CSV with headers and escaped values', () => {
    const csv = contactsToCsv(rows);

    expect(csv.split('\n')[0]).toBe('Full Name,First Name,Last Name,Email,Phone,Sources,Tags,Created At,Last Seen At');
    expect(csv).toContain('"Studio: Brand, Web"');
  });

  it('serializes Excel XML with escaped text', () => {
    const xml = contactsToExcelXml([
      {
        ...rows[0]!,
        full_name: 'Ada & Co <Team>',
      },
    ]);

    expect(xml).toContain('Workbook');
    expect(xml).toContain('Ada &amp; Co &lt;Team&gt;');
  });
});
