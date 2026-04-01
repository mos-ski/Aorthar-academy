import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { writeAuditLog } from '@/lib/admin/audit';

export async function POST(req: NextRequest) {
  try {
    const { userId: performedBy } = await requireAdminApi('admin_management');
    const admin = createAdminClient();
    const body = await req.json() as { email?: string; full_name?: string; admin_level?: 'super_admin' | 'content_admin' | 'finance_admin' };

    const email = String(body.email ?? '').trim().toLowerCase();
    const fullName = String(body.full_name ?? '').trim();
    const adminLevel = body.admin_level ?? 'content_admin';

    if (!email || !fullName) {
      return NextResponse.json({ error: 'email and full_name are required' }, { status: 400 });
    }

    const invite = await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        role: 'admin',
      },
    });

    if (invite.error) {
      const msg = invite.error.message.toLowerCase();
      if (msg.includes('already') || msg.includes('exists')) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: invite.error.message }, { status: 500 });
    }

    const invitedUserId = invite.data.user?.id;
    if (!invitedUserId) {
      return NextResponse.json({ error: 'Invite succeeded without user id' }, { status: 500 });
    }

    const { error: profileError } = await admin
      .from('profiles')
      .upsert({
        user_id: invitedUserId,
        full_name: fullName,
        role: 'admin',
        admin_level: adminLevel,
      }, { onConflict: 'user_id' });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    await writeAuditLog({
      action: 'admin_invited',
      performedBy,
      targetUser: invitedUserId,
      entityType: 'profile',
      metadata: { email, admin_level: adminLevel },
      req,
    }, admin);

    return NextResponse.json({ success: true });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
