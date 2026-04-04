/**
 * Fixes department assignment for all existing courses.
 * Uses course code prefixes to determine the correct department.
 *
 * After deploying, open in browser:
 *   https://university.aorthar.com/api/admin/fix-course-departments
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

// Map course code prefixes → department names
const PREFIX_MAP: Record<string, string> = {
  PM: 'Product Management',
  DES: 'Product Design',
  DSN: 'Product Design',
  UXR: 'Product Design',
  DEV: 'Frontend Engineering',
  API: 'Frontend Engineering',
  CI: 'Frontend Engineering',
  SEC: 'Frontend Engineering',
  OSS: 'Frontend Engineering',
  PORT: 'Frontend Engineering',
  INT: 'Frontend Engineering',
  FRE: 'Frontend Engineering',
  BE: 'Backend Engineering',
  DB: 'Backend Engineering',
  ARC: 'Backend Engineering',
  QA: 'QA Engineering',
  SCR: 'Scrum & Agile Ops',
  SRE: 'Scrum & Agile Ops',
  OPS: 'Scrum & Agile Ops',
  STR: 'Scrum & Agile Ops',
  PSY: 'Scrum & Agile Ops',
  BUS: 'Scrum & Agile Ops',
  LDR: 'Scrum & Agile Ops',
  DA: 'Data & Analytics',
  GO: 'Growth & Operations',
  SM: 'Social Media Management',
  VE: 'Video Editing',
  CC: 'Content Creation (UGC)',
  HR: 'Human Resources',
  PJ: 'Project Management',
  CEO: 'CEO',
  DO: 'DevOps Engineering',
  CS: 'Frontend Engineering',
  COM: 'Product Management',
  MKT: 'Product Management',
  FIN: 'Product Management',
  LAW: 'Product Management',
  ANA: 'Product Management',
  CAP: 'Product Management',
  ETH: 'Product Management',
  TEAM: 'Product Management',
};

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

  for (const course of courses) {
    // Extract prefix: "PM101" → "PM", "DEV201" → "DEV"
    const match = course.code.match(/^([A-Z]+)/);
    if (!match) { unknown++; continue; }

    const dept = PREFIX_MAP[match[1]];
    if (!dept) { unknown++; continue; }

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
    message: `${updated} courses assigned departments, ${unknown} could not be mapped`,
  });
}
