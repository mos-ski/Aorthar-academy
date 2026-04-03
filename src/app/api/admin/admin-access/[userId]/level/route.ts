import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { writeAuditLog } from '@/lib/admin/audit';

type AdminLevel = 'super_admin' | 'content_admin' | 'finance_admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId: performedBy } = await requireAdminApi('admin_management');
    const admin = createAdminClient();
    const { userId } = await params;
    const body = await req.json() as { admin_level?: AdminLevel };
    const adminLevel = body.admin_level;

    if (!adminLevel || !['super_admin', 'content_admin', 'finance_admin'].includes(adminLevel)) {
      return NextResponse.json({ error: 'admin_level is required' }, { status: 400 });
    }

    if (performedBy === userId) {
      return NextResponse.json({ error: 'You cannot change your own admin level' }, { status: 400 });
    }

    const { data: before } = await admin
      .from('profiles')
      .select('role, admin_level')
      .eq('user_id', userId)
      .maybeSingle();

    const { error } = await admin
      .from('profiles')
      .update({ role: 'admin', admin_level: adminLevel })
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await writeAuditLog({
      action: 'admin_role_granted',
      performedBy,
      targetUser: userId,
      entityType: 'profile',
      oldValue: before,
      newValue: { role: 'admin', admin_level: adminLevel },
      metadata: { source: 'admin_level_update' },
      req,
    }, admin);

    return NextResponse.json({ success: true });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
