import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth, requireRole } from '@/lib/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { requireAdminApi } from '@/lib/admin/apiAuth';

export async function GET() {
  try {
    await requireAdminApi();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('standalone_courses')
      .select('id, slug, title')
      .order('title');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  const { user } = await requireAuth();
  await requireRole('admin');

  const body = await request.json();
  const { title, slug, price_ngn } = body;

  if (!title || !slug) {
    return NextResponse.json({ error: 'title and slug required' }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from('standalone_courses')
    .insert({ title, slug, price_ngn: Number(price_ngn) || 0 })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeAuditLog({
    action: 'standalone_course.create',
    performedBy: user.id,
    entityType: 'standalone_course',
    entityId: data.id,
    newValue: { title, slug, price_ngn },
    req: request,
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
