import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { inviteAndConfigureStudent, grantStandaloneCourses } from '@/lib/admin/studentOps';
import { sendEmail } from '@/lib/email';
import { bootcampAccessHtml, bootcampAccessSubject } from '@/lib/email/templates/bootcamp-access';
import { writeAuditLog } from '@/lib/admin/audit';

// POST /api/admin/invite-student
// Invites a new student (or grants access to existing) to one or more bootcamp courses
export async function POST(req: NextRequest) {
  try {
    const { userId: performedBy } = await requireAdminApi();
    const { email, full_name, standalone_course_slugs } = await req.json() as {
      email: string;
      full_name: string;
      standalone_course_slugs?: string[];
    };

    if (!email || !full_name) {
      return NextResponse.json({ error: 'email and full_name are required' }, { status: 400 });
    }

    const slugs = standalone_course_slugs ?? [];
    const admin = createAdminClient();

    // Check if user already exists via profiles table
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('user_id')
      .ilike('full_name', full_name)
      .limit(1)
      .maybeSingle();

    let existingUserId: string | null = existingProfile?.user_id ?? null;

    // Also check auth users by listing (Supabase doesn't have getUserByEmail)
    if (!existingUserId) {
      const { data: { users } } = await admin.auth.admin.listUsers({ page: 1, perPage: 100 });
      const found = users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      existingUserId = found?.id ?? null;
    }

    if (existingUserId) {
      // User exists — just grant course access
      if (slugs.length > 0) {
        await grantStandaloneCourses(admin, existingUserId, slugs);
      }

      await writeAuditLog({
        action: 'standalone_access_granted',
        performedBy,
        targetUser: existingUserId,
        entityType: 'standalone_course',
        entityId: null,
        metadata: { course_slugs: slugs, source: 'admin_invite' },
        req,
      }, admin);

      return NextResponse.json({
        status: 'granted',
        reason: 'Student already exists — access granted to selected bootcamps.',
      });
    }

    // New user — send invite email and grant access
    const invite = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name },
    });

    if (invite.error) {
      const message = invite.error.message.toLowerCase();
      if (message.includes('already') || message.includes('exists')) {
        return NextResponse.json({ error: 'This email is already registered. Use the "All Users" page to grant access.' }, { status: 409 });
      }
      return NextResponse.json({ error: invite.error.message }, { status: 500 });
    }

    const userId = invite.data.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Invite created without user ID' }, { status: 500 });
    }

    // Create profile
    const { error: profileError } = await admin
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          full_name,
          role: 'student',
          department: null,
        },
        { onConflict: 'user_id' },
      );

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Grant course access
    if (slugs.length > 0) {
      await grantStandaloneCourses(admin, userId, slugs);
    }

    // Send welcome email with bootcamp access info
    const firstName = full_name.split(' ')[0] ?? 'there';
    const bootcampTitle = slugs.length > 0 ? slugs.map((s) => s.replace(/-/g, ' ')).join(', ') : 'bootcamp';
    const bootcampUrl = process.env.NEXT_PUBLIC_BOOTCAMP_URL ?? 'https://bootcamp.aorthar.com';

    try {
      await sendEmail({
        to: email,
        subject: `Welcome to Aorthar — Access to ${bootcampTitle}`,
        html: bootcampAccessHtml({ firstName, bootcampTitle, bootcampUrl }),
      });
    } catch (err) {
      console.error('[invite-student] email failed:', err);
      // Don't fail the invite — email is best-effort
    }

    await writeAuditLog({
      action: 'student_invited',
      performedBy,
      targetUser: userId,
      entityType: 'standalone_course',
      entityId: null,
      metadata: { email, full_name, course_slugs: slugs, source: 'admin_invite' },
      req,
    }, admin);

    return NextResponse.json({ status: 'invited', userId });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
