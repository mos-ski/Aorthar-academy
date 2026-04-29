import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function ensureAdmin() {
  try {
    await requireRole('admin');
  } catch {
    redirect('/unauthorized');
  }
}

// GET /api/admin/internship/cohort — get the current open cohort
export async function GET() {
  await ensureAdmin();
  const admin = createAdminClient();

  const { data } = await admin
    .from('internship_cohorts')
    .select('id, name, status, price_ngn, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  return NextResponse.json({ data: data ?? [] });
}

// PATCH /api/admin/internship/cohort — update cohort (price, name, status)
export async function PATCH(request: NextRequest) {
  await ensureAdmin();

  let body: { id?: string; price_ngn?: number; name?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { id, price_ngn, name, status } = body;
  if (!id) return NextResponse.json({ error: 'Cohort ID required' }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (price_ngn !== undefined) {
    if (!Number.isInteger(price_ngn) || price_ngn < 1) {
      return NextResponse.json({ error: 'Price must be a positive integer (Naira)' }, { status: 400 });
    }
    update.price_ngn = price_ngn;
  }
  if (name !== undefined) update.name = name.trim();
  if (status !== undefined) {
    if (!['open', 'closed', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Status must be open, closed, or completed' }, { status: 400 });
    }
    update.status = status;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('internship_cohorts')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[admin/internship/cohort] Update error:', error);
    return NextResponse.json({ error: 'Failed to update cohort' }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/admin/internship/cohort — create a new cohort
export async function POST(request: NextRequest) {
  await ensureAdmin();

  let body: { name?: string; price_ngn?: number; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, price_ngn, status } = body;
  if (!name?.trim()) return NextResponse.json({ error: 'Cohort name is required' }, { status: 400 });
  if (!price_ngn || price_ngn < 1) return NextResponse.json({ error: 'Price must be a positive integer' }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('internship_cohorts')
    .insert({ name: name.trim(), price_ngn, status: status ?? 'open' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create cohort' }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
