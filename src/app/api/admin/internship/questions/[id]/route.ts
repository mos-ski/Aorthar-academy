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

// PATCH /api/admin/internship/questions/[id] — update a question
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureAdmin();

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const allowed = ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'sort_order', 'is_active'];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  if (update.correct_option && !['a', 'b', 'c', 'd'].includes(String(update.correct_option).toLowerCase())) {
    return NextResponse.json({ error: 'correct_option must be a, b, c, or d' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from('internship_questions')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[admin/internship/questions/[id]] Update error:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// DELETE /api/admin/internship/questions/[id] — hard delete
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureAdmin();

  const { id } = await params;
  const admin = createAdminClient();

  const { error } = await admin
    .from('internship_questions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[admin/internship/questions/[id]] Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
