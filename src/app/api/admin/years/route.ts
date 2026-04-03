import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/admin/years — create a new year level
export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  const { level, name } = await req.json();

  if (!level) return NextResponse.json({ error: 'level is required' }, { status: 400 });

  const { data, error } = await admin
    .from('years')
    .insert({ level, name: name ?? `Year ${level}` })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
