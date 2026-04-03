import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Delete all user data
  await Promise.all([
    admin.from('user_progress').delete().eq('user_id', user.id),
    admin.from('course_grades').delete().eq('user_id', user.id),
    admin.from('semester_gpas').delete().eq('user_id', user.id),
    admin.from('cumulative_gpas').delete().eq('user_id', user.id),
    admin.from('semester_progress').delete().eq('user_id', user.id),
    admin.from('subscriptions').delete().eq('user_id', user.id),
    admin.from('profiles').delete().eq('user_id', user.id),
  ]);

  // Delete the auth user
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
