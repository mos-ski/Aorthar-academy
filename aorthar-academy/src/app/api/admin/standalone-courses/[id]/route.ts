import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth, requireRole } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  await requireRole('admin');

  const { id } = await params;
  const body = await request.json();

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('standalone_courses')
    .update({
      title: body.title,
      slug: body.slug,
      description: body.description,
      long_description: body.long_description,
      thumbnail_url: body.thumbnail_url || null,
      price_ngn: Number(body.price_ngn),
      instructor_name: body.instructor_name,
      instructor_avatar_url: body.instructor_avatar_url || null,
      status: body.status,
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  await requireRole('admin');

  const { id } = await params;
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from('standalone_courses').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
