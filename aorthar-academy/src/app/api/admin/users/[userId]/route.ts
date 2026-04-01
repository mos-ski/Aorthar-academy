import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { writeAuditLog } from '@/lib/admin/audit';

// PATCH /api/admin/users/[userId] — change role, department, block etc.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId: performedBy } = await requireAdminApi();
    const supabase = createAdminClient();
    const { userId } = await params;
    const body = await req.json();

    const allowed = ['role', 'department', 'full_name'];
    const update = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));

    const { data: before } = await supabase
      .from('profiles')
      .select('full_name, role, department')
      .eq('user_id', userId)
      .maybeSingle();

    const { data, error } = await supabase
      .from('profiles')
      .update(update)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await writeAuditLog({
      action: 'role_changed',
      performedBy,
      targetUser: userId,
      entityType: 'profile',
      oldValue: before,
      newValue: update,
      metadata: { reason: 'admin_profile_update' },
      req,
    }, supabase);

    return NextResponse.json({ data });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
