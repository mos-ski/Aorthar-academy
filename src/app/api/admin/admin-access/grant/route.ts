import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { writeAuditLog } from '@/lib/admin/audit';

async function findUserIdByEmail(admin: ReturnType<typeof createAdminClient>, email: string): Promise<string | null> {
  const normalized = email.toLowerCase();
  let page = 1;
  const perPage = 200;

  for (let i = 0; i < 100; i += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    const users = data?.users ?? [];
    const found = users.find((user) => user.email?.toLowerCase() === normalized);
    if (found?.id) return found.id;
    if (users.length < perPage) break;
    page += 1;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { userId: performedBy } = await requireAdminApi('admin_management');
    const admin = createAdminClient();
    const body = await req.json() as { email?: string; admin_level?: 'super_admin' | 'content_admin' | 'finance_admin' };
    const email = String(body.email ?? '').trim().toLowerCase();
    const adminLevel = body.admin_level ?? 'content_admin';

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    const targetUserId = await findUserIdByEmail(admin, email);
    if (!targetUserId) {
      return NextResponse.json({ error: 'User not found for this email' }, { status: 404 });
    }

    const { data: before } = await admin
      .from('profiles')
      .select('role')
      .eq('user_id', targetUserId)
      .maybeSingle();

    const { error } = await admin
      .from('profiles')
      .update({ role: 'admin', admin_level: adminLevel })
      .eq('user_id', targetUserId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await writeAuditLog({
      action: 'admin_role_granted',
      performedBy,
      targetUser: targetUserId,
      entityType: 'profile',
      oldValue: before,
      newValue: { role: 'admin', admin_level: adminLevel },
      metadata: { email, admin_level: adminLevel },
      req,
    }, admin);

    return NextResponse.json({ success: true, targetUserId });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
