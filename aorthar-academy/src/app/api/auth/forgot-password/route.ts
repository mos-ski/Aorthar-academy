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
    return NextResponse.json({ ok: true }); // silent fail — don't reveal anything
  }

  if (!email) {
    return NextResponse.json({ ok: true });
  }

  const origin = new URL(request.url).origin;
  const adminSupabase = createAdminClient();

  const { data, error } = await adminSupabase.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${origin}/reset-password` },
  });

  if (!error && data?.properties?.action_link) {
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', data.user.id)
      .maybeSingle();
    const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

    try {
      await sendEmail({
        to: email,
        subject: 'Reset your Aorthar Academy password',
        html: forgotPasswordHtml({ firstName, resetUrl: data.properties.action_link }),
      });
    } catch (emailErr) {
      console.error('[forgot-password] email send failed:', emailErr);
    }
  }

  // Always return ok — never reveal whether the email exists
  return NextResponse.json({ ok: true });
}
