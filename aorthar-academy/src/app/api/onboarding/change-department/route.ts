import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AORTHAR_DEPARTMENTS } from '@/lib/academics/departments';
import { getSemester1EnrollmentCodes } from '@/lib/academics/plan';

const changeDepartmentSchema = z.object({
  department: z.enum(AORTHAR_DEPARTMENTS),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = changeDepartmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid payload' },
      { status: 400 },
    );
  }

  const { department } = parsed.data;
  const nowIso = new Date().toISOString();
  const admin = createAdminClient();

  // Delete all existing academic progress for this user
  await Promise.all([
    admin.from('user_progress').delete().eq('user_id', user.id),
    admin.from('course_grades').delete().eq('user_id', user.id),
    admin.from('semester_gpas').delete().eq('user_id', user.id),
    admin.from('cumulative_gpas').delete().eq('user_id', user.id),
    admin.from('semester_progress').delete().eq('user_id', user.id),
  ]);

  // Update profile with new department
  await admin
    .from('profiles')
    .update({ department, onboarding_completed_at: nowIso })
    .eq('user_id', user.id);

  // Re-enroll in Semester 1 of the new department
  const { data: year100 } = await admin
    .from('years')
    .select('id')
    .eq('level', 100)
    .maybeSingle();

  if (!year100) {
    return NextResponse.json({ ok: true, department, enrolledCount: 0 });
  }

  const { data: semester1 } = await admin
    .from('semesters')
    .select('id')
    .eq('year_id', year100.id)
    .eq('number', 1)
    .maybeSingle();

  if (!semester1) {
    return NextResponse.json({ ok: true, department, enrolledCount: 0 });
  }

  const { data: courses } = await admin
    .from('courses')
    .select('id, code, sort_order')
    .eq('semester_id', semester1.id)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .limit(20);

  if (!courses || courses.length === 0) {
    return NextResponse.json({ ok: true, department, enrolledCount: 0 });
  }

  const entryCodes = getSemester1EnrollmentCodes(department);
  const byCode = new Map(courses.map((c) => [c.code.toUpperCase(), c]));
  const selected = entryCodes
    .map((code) => byCode.get(code))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .slice(0, 8);

  if (selected.length === 0) {
    selected.push(...[...courses].slice(0, 8));
  }

  await admin.from('semester_progress').upsert(
    {
      user_id: user.id,
      year_id: year100.id,
      semester_id: semester1.id,
      is_unlocked: true,
      unlocked_at: nowIso,
    },
    { onConflict: 'user_id,semester_id' },
  );

  await admin.from('user_progress').upsert(
    selected.map((c) => ({
      user_id: user.id,
      course_id: c.id,
      status: 'not_started',
      enrolled_at: nowIso,
    })),
    { onConflict: 'user_id,course_id' },
  );

  return NextResponse.json({ ok: true, department, enrolledCount: selected.length });
}
