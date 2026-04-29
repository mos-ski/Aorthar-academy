import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/internship/price — returns the current open cohort's application fee
export async function GET() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('internship_cohorts')
      .select('price_ngn')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({ price_ngn: data?.price_ngn ?? 10000 });
  } catch {
    return NextResponse.json({ price_ngn: 10000 });
  }
}
