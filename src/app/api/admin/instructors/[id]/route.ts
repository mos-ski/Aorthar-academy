import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  await requireAdminApi('content');
  const { id } = await params;
  const body = await request.json() as {
    full_name?: string;
    email?: string | null;
    avatar_url?: string | null;
    is_active?: boolean;
  };

  const updates: {
    full_name?: string;
    email?: string | null;
    avatar_url?: string | null;
    is_active?: boolean;
  } = {};

  if (body.full_name !== undefined) {
    const fullName = body.full_name.trim();
    if (!fullName) return NextResponse.json({ error: 'full_name is required' }, { status: 400 });
    updates.full_name = fullName;
  }
  if (body.email !== undefined) updates.email = body.email?.trim() || null;
  if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url?.trim() || null;
  if (body.is_active !== undefined) updates.is_active = body.is_active;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('bootcamp_instructors')
    .update(updates)
    .eq('id', id)
    .select('id, full_name, email, avatar_url, is_active, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
