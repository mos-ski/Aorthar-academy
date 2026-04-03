import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// DELETE /api/admin/semesters/[semesterId]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ semesterId: string }> }) {
  const admin = createAdminClient();
  const { semesterId } = await params;

  const { error } = await admin.from('semesters').delete().eq('id', semesterId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
