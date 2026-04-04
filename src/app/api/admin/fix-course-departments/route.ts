/**
 * Fixes department assignment for all existing courses.
 * Uses course code prefixes to determine the correct department.
 * Safe to run multiple times — only updates courses where department is NULL.
 *
 * After deploying, open in browser:
 *   https://aorthar.com/api/admin/fix-course-departments
 * Or:
 *   https://university.aorthar.com/api/admin/fix-course-departments
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { getDeptFromCode } from '@/lib/academics/departments';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createAdminClient();

  // Get all courses without a department
  const { data: courses } = await supabase
    .from('courses')
    .select('id, code, department')
    .is('department', null);

  if (!courses || courses.length === 0) {
    return NextResponse.json({ success: true, message: 'All courses already have departments', updated: 0 });
  }

  let updated = 0;
  let unknown = 0;
  const unknownCodes: string[] = [];

  for (const course of courses) {
    const dept = getDeptFromCode(course.code);
    if (!dept) { unknown++; unknownCodes.push(course.code); continue; }

    const { error } = await supabase
      .from('courses')
      .update({ department: dept })
      .eq('id', course.id);

    if (!error) updated++;
  }

  return NextResponse.json({
    success: true,
    total: courses.length,
    updated,
    unknown,
    unknownCodes: unknownCodes.slice(0, 20),
    message: `${updated} courses assigned departments, ${unknown} could not be mapped`,
  });
}
