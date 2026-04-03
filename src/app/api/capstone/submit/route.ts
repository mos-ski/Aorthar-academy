import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { capstoneSchema } from '@/utils/validators';

// POST /api/capstone/submit
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check premium
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!sub) return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });

  const body = await req.json();
  const parsed = capstoneSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Check cumulative GPA
  const { data: gpa } = await supabase
    .from('cumulative_gpas')
    .select('cumulative_gpa')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!gpa || gpa.cumulative_gpa < 3.5) {
    return NextResponse.json({
      error: `Minimum 3.5 GPA required. Current: ${gpa?.cumulative_gpa ?? 0}`,
    }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('capstone_submissions')
    .upsert({
      user_id: user.id,
      ...parsed.data,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}
