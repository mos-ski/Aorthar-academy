import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const host = request.headers.get('host') ?? '';
  const origin = host.includes('localhost') ? `http://${host}` : `https://${host}`;
  return NextResponse.redirect(`${origin}/courses-app`, { status: 303 });
}
