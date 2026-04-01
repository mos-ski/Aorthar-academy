export const maxDuration = 30;

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { forgotPasswordHtml } from '@/lib/email/templates/forgot-password';

export async function POST(request: NextRequest) {
  let email: string;
  try {
    const body = await request.json();
    email = body.email ?? '';
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ ok: false, error: 'Email required' }, { status: 400 });
  }

  let step = 'start';
  try {
    const origin = new URL(request.url).origin;
    const adminSupabase = createAdminClient();

    step = 'generateLink';
    const { data, error } = await adminSupabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${origin}/reset-password` },
    });

    console.log('[forgot-password] generateLink result:', { error, hasActionLink: !!data?.properties?.action_link });
    console.log('[forgot-password] user:', data?.user?.id);

    if (error || !data?.properties?.action_link) {
      console.log('[forgot-password] skipping email send - no link generated');
      return NextResponse.json({ ok: true, debug: { error: error?.message, step } });
    }

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', data.user.id)
      .maybeSingle();
    const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

    step = 'sendEmail';
    await sendEmail({
      to: email,
      subject: 'Reset your Aorthar Academy password',
      html: forgotPasswordHtml({ firstName, resetUrl: data.properties.action_link }),
    });

    console.log('[forgot-password] email sent successfully');
  } catch (err) {
    console.error('[forgot-password] error at step:', step, err);
    return NextResponse.json({ ok: false, error: 'Internal error', step }, { status: 500 });
  }

  return NextResponse.json({ ok: true, step: 'done' });
}
