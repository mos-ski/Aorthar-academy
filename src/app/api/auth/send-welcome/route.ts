import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { welcomeHtml, welcomeSubject } from '@/lib/email/templates/welcome';

export async function POST(request: NextRequest) {
  let email: string;
  let firstName: string;
  let isCourses: boolean;

  try {
    const body = await request.json();
    email = body.email ?? '';
    firstName = body.firstName ?? 'there';
    isCourses = !!body.isCourses;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  try {
    await sendEmail({
      to: email,
      subject: welcomeSubject(isCourses),
      html: welcomeHtml({ firstName, isCourses }),
    });
  } catch (err) {
    console.error('[send-welcome] email failed:', err);
    // Don't fail the response — welcome email is best-effort
  }

  return NextResponse.json({ ok: true });
}
