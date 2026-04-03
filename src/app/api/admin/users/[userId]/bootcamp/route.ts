import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { grantStandaloneCourses } from '@/lib/admin/studentOps';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    await requireAdminApi();
    const { userId } = await params;
    const { course_slug } = await req.json() as { course_slug?: string };

    if (!course_slug) {
      return NextResponse.json({ error: 'course_slug is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    await grantStandaloneCourses(admin, userId, [course_slug]);

    return NextResponse.json({ status: 'granted' });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
