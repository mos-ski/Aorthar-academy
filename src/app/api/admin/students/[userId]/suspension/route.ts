import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { writeAuditLog } from '@/lib/admin/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId: performedBy } = await requireAdminApi('admin_management');
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

    await writeAuditLog({
      action: isSuspended ? 'student_suspended' : 'student_unsuspended',
      performedBy,
      targetUser: userId,
      entityType: 'profile',
      metadata: { source: 'admin_suspension' },
      req,
    }, admin);

    return NextResponse.json({ success: true });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
