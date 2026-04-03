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
    const { action, courseId } = await req.json() as {
      action?: 'grant' | 'revoke';
      courseId?: string;
    };

    if ((action !== 'grant' && action !== 'revoke') || !courseId) {
      return NextResponse.json({ error: 'action and courseId are required' }, { status: 400 });
    }

    const admin = createAdminClient();

    if (action === 'grant') {
      const reference = `ADMIN_GRANT_${userId.slice(0, 8)}_${courseId.slice(0, 8)}_${Date.now()}`;
      const { error } = await admin
        .from('standalone_purchases')
        .insert({
          user_id: userId,
          course_id: courseId,
          paystack_reference: reference,
          amount_paid_ngn: 0,
        });

      if (error && error.code !== '23505') {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await writeAuditLog({
        action: 'standalone_access_granted',
        performedBy,
        targetUser: userId,
        entityType: 'standalone_course',
        entityId: courseId,
        metadata: { source: 'admin_grant' },
        req,
      }, admin);
    }

    if (action === 'revoke') {
      const { error } = await admin
        .from('standalone_purchases')
        .delete()
        .eq('user_id', userId)
        .eq('course_id', courseId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await writeAuditLog({
        action: 'standalone_access_revoked',
        performedBy,
        targetUser: userId,
        entityType: 'standalone_course',
        entityId: courseId,
        metadata: { source: 'admin_revoke' },
        req,
      }, admin);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
