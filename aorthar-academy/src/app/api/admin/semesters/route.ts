import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/admin/semesters — create a new semester
export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  const { year_id, number } = await req.json();

  if (!year_id || !number) return NextResponse.json({ error: 'year_id and number are required' }, { status: 400 });

  const { data, error } = await admin
    .from('semesters')
    .insert({ year_id, number })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
