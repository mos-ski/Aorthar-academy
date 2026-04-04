import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { AORTHAR_DEPARTMENTS } from '@/lib/academics/departments';

const schema = z.object({
  department: z.enum(AORTHAR_DEPARTMENTS),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const department = url.searchParams.get('department');

  const parsed = schema.safeParse({ department });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid department' },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Get Year 100 → Semester 1
  const { data: year } = await admin
    .from('years')
    .select('id')
    .eq('level', 100)
    .maybeSingle();

  if (!year) {
    return NextResponse.json({ courses: [] });
  }

  const { data: semester } = await admin
    .from('semesters')
    .select('id')
    .eq('year_id', year.id)
    .eq('number', 1)
    .maybeSingle();

  if (!semester) {
    return NextResponse.json({ courses: [] });
  }

  // Get courses for this semester + department
  const { data: courses } = await admin
    .from('courses')
    .select('id, code, name, description, credit_units')
    .eq('semester_id', semester.id)
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  return NextResponse.json({ courses: courses ?? [] });
}
