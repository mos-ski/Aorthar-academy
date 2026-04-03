import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEMO_YEARS } from '@/lib/demo/adminSnapshot';

// GET /api/admin/curriculum — fetch all years with their semesters
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('years')
      .select('id, level, name, semesters(id, number)')
      .order('level', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return NextResponse.json({ data: DEMO_YEARS });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: DEMO_YEARS });
  }
}
