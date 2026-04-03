import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/admin/courses — create a new course
export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  const body = await req.json();
  const { semester_id, code, name, description, credit_units, pass_mark, sort_order, is_premium } = body;

  if (!semester_id || !code || !name) {
    return NextResponse.json({ error: 'semester_id, code, and name are required' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('courses')
    .insert({
      semester_id,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description?.trim() ?? null,
      credit_units: credit_units ?? 3,
      pass_mark: pass_mark ?? 60,
      sort_order: sort_order ?? 1,
      is_premium: is_premium ?? false,
      status: 'draft',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
