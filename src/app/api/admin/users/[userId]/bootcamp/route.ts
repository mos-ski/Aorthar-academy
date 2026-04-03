import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { grantStandaloneCourses } from '@/lib/admin/studentOps';
import { sendEmail } from '@/lib/email';
import { bootcampAccessHtml, bootcampAccessSubject } from '@/lib/email/templates/bootcamp-access';

type Params = { params: Promise<{ userId: string }> };

// POST — grant a bootcamp to an existing user and notify them by email
export async function POST(req: NextRequest, { params }: Params) {
  try {
    await requireAdminApi();
    const { userId } = await params;
    const { course_slug } = await req.json() as { course_slug?: string };

    if (!course_slug) {
      return NextResponse.json({ error: 'course_slug is required' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Grant access
    await grantStandaloneCourses(admin, userId, [course_slug]);

    // Fetch course title and user details for the email
    const [{ data: course }, { data: { user } }] = await Promise.all([
      admin.from('standalone_courses').select('title').eq('slug', course_slug).single(),
      admin.auth.admin.getUserById(userId),
    ]);

    const email = user?.email;
    const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'there';
    const bootcampTitle = course?.title ?? course_slug;
    const bootcampUrl = process.env.NEXT_PUBLIC_BOOTCAMP_URL ?? 'https://bootcamp.aorthar.com';

    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: bootcampAccessSubject(bootcampTitle),
          html: bootcampAccessHtml({ firstName, bootcampTitle, bootcampUrl }),
        });
      } catch (err) {
        console.error('[bootcamp-grant] email failed:', err);
        // Don't fail the grant — email is best-effort
      }
    }

    return NextResponse.json({ status: 'granted' });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}

// DELETE — remove a user's access to a specific bootcamp
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await requireAdminApi();
    const { userId } = await params;
    const { course_id } = await req.json() as { course_id?: string };

    if (!course_id) {
      return NextResponse.json({ error: 'course_id is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from('standalone_purchases')
      .delete()
      .eq('user_id', userId)
      .eq('course_id', course_id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ status: 'removed' });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
