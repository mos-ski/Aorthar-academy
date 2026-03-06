import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// PATCH /api/admin/users/[userId] — change role, department, block etc.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const supabase = createAdminClient();
  const { userId } = await params;
  const body = await req.json();

  const allowed = ['role', 'department', 'full_name'];
  const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
