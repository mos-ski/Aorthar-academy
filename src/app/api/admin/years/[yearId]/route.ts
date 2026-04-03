import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// DELETE /api/admin/years/[yearId]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ yearId: string }> }) {
  const admin = createAdminClient();
  const { yearId } = await params;

  const { error } = await admin.from('years').delete().eq('id', yearId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
