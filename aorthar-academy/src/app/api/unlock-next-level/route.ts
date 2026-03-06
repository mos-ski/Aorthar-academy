import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/unlock-next-level
// Body: { semester_id?: string; year_id?: string }
// Validates unlock conditions and updates semester_progress / user_progress accordingly.
// All authoritative unlock logic lives in the check-progression Edge Function;
// this route proxies to it so clients have a stable internal endpoint.

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { semester_id, year_id } = body as { semester_id?: string; year_id?: string };

  if (!semester_id && !year_id) {
    return NextResponse.json(
      { error: 'Provide semester_id or year_id to unlock.' },
      { status: 400 },
    );
  }

  // Proxy to the check-progression Edge Function
  const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/check-progression`;
  const response = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ user_id: user.id, semester_id, year_id }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Edge function error' }));
    return NextResponse.json(err, { status: response.status });
  }

  const result = await response.json();
  return NextResponse.json(result);
}
