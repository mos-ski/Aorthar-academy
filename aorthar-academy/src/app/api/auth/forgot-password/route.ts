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
    return NextResponse.json({ ok: true });
  }

  if (!email) {
    return NextResponse.json({ ok: true });
  }

  try {
    const origin = new URL(request.url).origin;
    const adminSupabase = createAdminClient();

    // generateLink with type 'recovery' creates a password-reset link without
    // sending Supabase's own email — we send the branded Resend email instead.
    const { data, error } = await adminSupabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${origin}/reset-password` },
    });

    if (error) {
      console.error('[forgot-password] generateLink error:', error.message);
      // Still return ok — never reveal if the email exists
      return NextResponse.json({ ok: true });
    }

    const resetUrl = data?.properties?.action_link;
    if (!resetUrl) {
      console.error('[forgot-password] no action_link in generateLink response');
      return NextResponse.json({ ok: true });
    }

    // Look up the user's first name for personalisation
    let firstName = 'there';
    try {
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', data.user.id)
        .maybeSingle();
      if (profile?.full_name) {
        firstName = profile.full_name.split(' ')[0];
      }
    } catch {
      // Non-critical — fall back to generic greeting
    }

    await sendEmail({
      to: email,
      subject: 'Reset your Aorthar Academy password',
      html: forgotPasswordHtml({ firstName, resetUrl }),
    });

    console.log('[forgot-password] branded reset email sent via Resend for:', email);
  } catch (err) {
    console.error('[forgot-password] error:', err);
  }

  return NextResponse.json({ ok: true });
}
