import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { contactsToCsv, contactsToExcelXml, filterContactsForExport } from '@/lib/admin/contacts';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ContactFilters, ContactRow } from '@/lib/admin/contacts';

function exportFilename(format: 'csv' | 'xls'): string {
  const date = new Date().toISOString().slice(0, 10);
  return `aorthar-contacts-${date}.${format}`;
}

function downloadResponse(body: string, format: 'csv' | 'xls'): NextResponse {
  const contentType = format === 'csv'
    ? 'text/csv; charset=utf-8'
    : 'application/vnd.ms-excel; charset=utf-8';

  return new NextResponse(format === 'csv' ? `\uFEFF${body}` : body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${exportFilename(format)}"`,
      'Cache-Control': 'no-store',
    },
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  await requireRole('admin');

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') ?? 'csv';

  if (format !== 'csv' && format !== 'xls') {
    return NextResponse.json({ error: 'format must be csv or xls' }, { status: 400 });
  }

  const filters: ContactFilters = {
    q: searchParams.get('q') ?? '',
    source: searchParams.get('source') ?? 'all',
  };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('admin_contacts')
    .select('contact_key, first_name, last_name, full_name, email, phone, sources, tags, source_count, created_at, last_seen_at')
    .order('last_seen_at', { ascending: false })
    .returns<ContactRow[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = filterContactsForExport(data ?? [], filters);
  const body = format === 'csv' ? contactsToCsv(rows) : contactsToExcelXml(rows);

  return downloadResponse(body, format);
}
