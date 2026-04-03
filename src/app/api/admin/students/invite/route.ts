import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { normalizeImportRow } from '@/lib/admin/studentImport';
import { inviteAndConfigureStudent } from '@/lib/admin/studentOps';

export async function POST(req: NextRequest) {
  try {
    await requireAdminApi();
    const body = await req.json() as {
      email?: string;
      full_name?: string;
      department?: string;
      role?: string;
      grant_premium?: boolean;
      standalone_course_slugs?: string[] | string;
    };

    const row = normalizeImportRow({
      email: body.email ?? '',
      full_name: body.full_name ?? '',
      department: body.department ?? '',
      role: body.role ?? 'student',
      grant_premium: String(body.grant_premium ?? false),
      standalone_course_slugs: Array.isArray(body.standalone_course_slugs)
        ? body.standalone_course_slugs.join('|')
        : (body.standalone_course_slugs ?? ''),
    });

    const admin = createAdminClient();
    const result = await inviteAndConfigureStudent(admin, row);

    return NextResponse.json({
      status: result.status,
      reason: result.reason,
      email: row.email,
    });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
