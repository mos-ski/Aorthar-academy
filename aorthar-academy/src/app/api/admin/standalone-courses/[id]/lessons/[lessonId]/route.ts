import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth, requireRole } from '@/lib/auth';

type Params = { params: Promise<{ id: string; lessonId: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  await requireRole('admin');

  const { lessonId } = await params;
  const body = await request.json();

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('standalone_lessons')
    .update({
      ...(body.title !== undefined && { title: body.title }),
      ...(body.youtube_url !== undefined && { youtube_url: body.youtube_url }),
      ...(body.sort_order !== undefined && { sort_order: body.sort_order }),
      ...(body.is_published !== undefined && { is_published: body.is_published }),
    })
    .eq('id', lessonId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  await requireRole('admin');

  const { lessonId } = await params;
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from('standalone_lessons').delete().eq('id', lessonId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
