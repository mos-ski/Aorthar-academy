import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(): Promise<NextResponse> {
  await requireAdminApi('content');
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('bootcamp_instructors')
    .select('id, full_name, email, avatar_url, is_active, created_at')
    .order('full_name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  await requireAdminApi('content');
  const body = await request.json() as {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };

  const fullName = body.full_name?.trim();
  if (!fullName) {
    return NextResponse.json({ error: 'full_name is required' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('bootcamp_instructors')
    .insert({
      full_name: fullName,
      email: body.email?.trim() || null,
      avatar_url: body.avatar_url?.trim() || null,
    })
    .select('id, full_name, email, avatar_url, is_active, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
