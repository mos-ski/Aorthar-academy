import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH /api/admin/resources/[resourceId]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ resourceId: string }> }) {
  const supabase = await createClient();
  const { resourceId } = await params;
  const body = await req.json();

  const allowed = ['type', 'title', 'url', 'sort_order'];
  const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await supabase
    .from('resources').update(update).eq('id', resourceId).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// DELETE /api/admin/resources/[resourceId]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ resourceId: string }> }) {
  const supabase = await createClient();
  const { resourceId } = await params;

  const { error } = await supabase.from('resources').delete().eq('id', resourceId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
