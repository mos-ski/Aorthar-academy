import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth, requireRole } from '@/lib/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { requireAdminApi, mapAdminApiError } from '@/lib/admin/apiAuth';

export async function GET() {
  try {
    await requireAdminApi('content');
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('webinars')
      .select('id, slug, title')
      .order('scheduled_at', { ascending: false });
    if (error) {
      console.error('[admin/webinars] DB error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data ?? []);
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  const { user } = await requireAuth();
  await requireRole('admin');

  const body = await request.json();
  const { title, slug, scheduled_at, price_ngn } = body;

  if (!title || !slug || !scheduled_at) {
    return NextResponse.json({ error: 'title, slug, and scheduled_at required' }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from('webinars')
    .insert({
      title,
      slug,
      scheduled_at,
      price_ngn: Number(price_ngn) || 0,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeAuditLog({
    action: 'webinar.create',
    performedBy: user.id,
    entityType: 'webinar',
    entityId: data.id,
    newValue: { title, slug, scheduled_at, price_ngn },
    req: request,
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
