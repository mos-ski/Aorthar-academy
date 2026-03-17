import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { profileSchema } from '@/utils/validators';

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid payload' },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: parsed.data.full_name, bio: parsed.data.bio ?? null })
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
