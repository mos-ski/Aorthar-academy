import { NextRequest, NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import {
  normalizeImportRow,
  parseCsvLikeInput,
  type StudentImportResult,
} from '@/lib/admin/studentImport';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthEmailSet, inviteAndConfigureStudent } from '@/lib/admin/studentOps';

export async function POST(req: NextRequest) {
  try {
    await requireAdminApi();
    const body = await req.json() as { csv?: string; rows?: string };
    const input = (body.csv ?? body.rows ?? '').trim();

    if (!input) {
      return NextResponse.json({ error: 'csv or rows payload is required' }, { status: 400 });
    }

    const records = parseCsvLikeInput(input);
    const admin = createAdminClient();
    const existingEmails = await getAuthEmailSet(admin);
    const results: StudentImportResult[] = [];

    for (let i = 0; i < records.length; i += 1) {
      const record = records[i];
      let email = (record.email ?? '').trim().toLowerCase();

      try {
        const row = normalizeImportRow(record);
        email = row.email;

        if (existingEmails.has(row.email)) {
          results.push({
            index: i + 1,
            email: row.email,
            status: 'skipped_existing',
            reason: 'Email already exists',
          });
          continue;
        }

        const result = await inviteAndConfigureStudent(admin, row);
        if (result.status === 'invited') {
          existingEmails.add(row.email);
        }

        results.push({
          index: i + 1,
          email: row.email,
          status: result.status,
          reason: result.reason,
        });
      } catch (error) {
        results.push({
          index: i + 1,
          email,
          status: email ? 'failed' : 'invalid',
          reason: error instanceof Error ? error.message : 'Unexpected error',
        });
      }
    }

    const summary = {
      total: results.length,
      invited: results.filter((result) => result.status === 'invited').length,
      skipped_existing: results.filter((result) => result.status === 'skipped_existing').length,
      invalid: results.filter((result) => result.status === 'invalid').length,
      failed: results.filter((result) => result.status === 'failed').length,
    };

    return NextResponse.json({ summary, results });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
