import type { SupabaseClient } from '@supabase/supabase-js';
import type { Role } from '@/types';

type InvitePayload = {
  email: string;
  full_name: string;
  department: string | null;
  role: Role;
  grant_premium: boolean;
  standalone_course_slugs: string[];
};

export async function getAuthEmailSet(admin: SupabaseClient): Promise<Set<string>> {
  const emails = new Set<string>();
  let page = 1;
  const perPage = 200;

  // Conservative upper bound for safety in case upstream pagination shape changes.
  for (let i = 0; i < 100; i += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);

    const users = data?.users ?? [];
    for (const user of users) {
      if (user.email) emails.add(user.email.toLowerCase());
    }

    if (users.length < perPage) break;
    page += 1;
  }

  return emails;
}

export async function inviteAndConfigureStudent(
  admin: SupabaseClient,
  payload: InvitePayload,
): Promise<{ status: 'invited' | 'skipped_existing'; reason?: string }> {
  const email = payload.email.toLowerCase();
  const invite = await admin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: payload.full_name,
      department: payload.department,
      role: payload.role,
    },
  });

  if (invite.error) {
    const message = invite.error.message.toLowerCase();
    if (message.includes('already') || message.includes('exists')) {
      return { status: 'skipped_existing', reason: 'Email already exists' };
    }
    throw new Error(invite.error.message);
  }

  const userId = invite.data.user?.id;
  if (!userId) {
    throw new Error('Invite created without user id');
  }

  const { error: profileError } = await admin
    .from('profiles')
    .upsert(
      {
        user_id: userId,
        full_name: payload.full_name,
        role: payload.role,
        department: payload.department,
      },
      { onConflict: 'user_id' },
    );

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (payload.grant_premium) {
    await grantPremium(admin, userId);
  }

  if (payload.standalone_course_slugs.length > 0) {
    await grantStandaloneCourses(admin, userId, payload.standalone_course_slugs);
  }

  return { status: 'invited' };
}

export async function grantPremium(admin: SupabaseClient, userId: string): Promise<void> {
  const { data: existing } = await admin
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (existing) return;

  const { data: plan } = await admin
    .from('plans')
    .select('id')
    .eq('plan_type', 'lifetime')
    .maybeSingle();

  const { error } = await admin
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_id: plan?.id ?? null,
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: null,
      auto_renew: false,
    });

  if (error && error.code !== '23505') {
    throw new Error(error.message);
  }
}

export async function grantStandaloneCourses(
  admin: SupabaseClient,
  userId: string,
  slugs: string[],
): Promise<void> {
  if (slugs.length === 0) return;

  const { data: courses, error: coursesError } = await admin
    .from('standalone_courses')
    .select('id, slug')
    .in('slug', slugs);

  if (coursesError) {
    throw new Error(coursesError.message);
  }

  const found = new Set((courses ?? []).map((course) => course.slug));
  const missing = slugs.filter((slug) => !found.has(slug));
  if (missing.length > 0) {
    throw new Error(`Unknown standalone course slug(s): ${missing.join(', ')}`);
  }

  for (const course of courses ?? []) {
    const reference = `ADMIN_GRANT_${userId.slice(0, 8)}_${course.id.slice(0, 8)}_${Date.now()}`;
    const { error } = await admin
      .from('standalone_purchases')
      .insert({
        user_id: userId,
        course_id: course.id,
        paystack_reference: reference,
        amount_paid_ngn: 0,
      });

    if (error && error.code !== '23505') {
      throw new Error(error.message);
    }
  }
}
