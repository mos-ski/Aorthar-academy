import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { AORTHAR_DEPARTMENTS } from '@/lib/academics/departments';
import { getSemester1EnrollmentCodes } from '@/lib/academics/plan';

const completeOnboardingSchema = z.object({
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
  const parsed = completeOnboardingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid payload' },
      { status: 400 },
    );
  }

  const { department } = parsed.data;
  const nowIso = new Date().toISOString();

  // Always update the profile first — this must succeed for onboarding to complete.
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      department,
      onboarding_completed_at: nowIso,
    })
    .eq('user_id', user.id);

  if (profileError) {
    return NextResponse.json(
      { error: 'Failed to update student profile.' },
      { status: 500 },
    );
  }

  // Attempt curriculum enrollment — non-fatal if curriculum hasn't been seeded yet.
  const { data: year100 } = await supabase
    .from('years')
    .select('id')
    .eq('level', 100)
    .maybeSingle();

  if (!year100) {
    // Curriculum not seeded yet; profile is saved, redirect to dashboard.
    return NextResponse.json({ ok: true, department, enrolledCount: 0 });
  }

  const { data: semester1 } = await supabase
    .from('semesters')
    .select('id')
    .eq('year_id', year100.id)
    .eq('number', 1)
    .maybeSingle();

  if (!semester1) {
    return NextResponse.json({ ok: true, department, enrolledCount: 0 });
  }

  const { data: courses } = await supabase
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
  const byCode = new Map(courses.map((course) => [course.code.toUpperCase(), course]));
  const selected = entryCodes
    .map((code) => byCode.get(code))
    .filter((course): course is NonNullable<typeof course> => Boolean(course))
    .slice(0, 8);

  // Fallback: enroll in first available courses if department plan has no matches.
  if (selected.length === 0) {
    selected.push(...[...courses].slice(0, 8));
  }

  // Unlock semester 1.
  await supabase
    .from('semester_progress')
    .upsert(
      {
        user_id: user.id,
        year_id: year100.id,
        semester_id: semester1.id,
        is_unlocked: true,
        unlocked_at: nowIso,
      },
      { onConflict: 'user_id,semester_id' },
    );

  // Enroll student in courses.
  await supabase
    .from('user_progress')
    .upsert(
      selected.map((course) => ({
        user_id: user.id,
        course_id: course.id,
        status: 'not_started',
        enrolled_at: nowIso,
      })),
      { onConflict: 'user_id,course_id' },
    );

  return NextResponse.json({
    ok: true,
    department,
    selectedCourseCodes: selected.map((course) => course.code),
    enrolledCount: selected.length,
  });
}
