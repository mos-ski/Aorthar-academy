import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { DEMO_COOKIE } from '@/lib/demo/mode';

export async function POST() {
  if (process.env.NEXT_PUBLIC_APP_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const store = await cookies();
  const current = store.get(DEMO_COOKIE)?.value === '1';
  const next = !current;

  const response = NextResponse.json({ demo: next });
  response.cookies.set(DEMO_COOKIE, next ? '1' : '0', {
    httpOnly: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  });
  return response;
}
