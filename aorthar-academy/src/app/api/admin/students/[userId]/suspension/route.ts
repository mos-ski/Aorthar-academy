import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    await requireAdminApi();
    const { userId } = await params;
    const { action } = await req.json() as { action?: 'suspend' | 'unsuspend' };

    if (action !== 'suspend' && action !== 'unsuspend') {
      return NextResponse.json({ error: 'action must be suspend or unsuspend' }, { status: 400 });
    }

    const admin = createAdminClient();
    const isSuspended = action === 'suspend';
    const suspendedAt = isSuspended ? new Date().toISOString() : null;

    const { error } = await admin
      .from('profiles')
      .update({
        is_suspended: isSuspended,
        suspended_at: suspendedAt,
      })
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
