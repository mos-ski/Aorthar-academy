import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';

// POST /api/admin/users/[userId]/premium — body: { action: 'grant' | 'revoke' }
export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await requireAdminApi();
    const supabase = createAdminClient();
    const { userId } = await params;
    const { action } = await req.json() as { action?: 'grant' | 'revoke' };

    if (action === 'grant') {
      const { data: existing } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (existing) return NextResponse.json({ success: true, already_active: true });

      // Get lifetime plan id
      const { data: plan } = await supabase
        .from('plans')
        .select('id')
        .eq('plan_type', 'lifetime')
        .maybeSingle();

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: plan?.id ?? null,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: null,
          auto_renew: false,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data });
    }

    if (action === 'revoke') {
      const { data: active } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (!active) return NextResponse.json({ success: true, already_inactive: true });

      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'action must be grant or revoke' }, { status: 400 });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
