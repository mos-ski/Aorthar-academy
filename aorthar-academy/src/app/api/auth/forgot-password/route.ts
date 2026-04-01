export const maxDuration = 30;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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
    const supabase = await createClient();

    // Generate reset link — works with anon key, no service role needed
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) {
      console.error('[forgot-password] resetPasswordForEmail error:', error.message);
      // Still return ok — don't reveal if email exists
      return NextResponse.json({ ok: true });
    }

    // Try to send branded email via Resend
    // resetPasswordForEmail also sends Supabase's default email — we override it
    // by using the OTP token approach isn't available here, so we send a separate
    // branded notification. The reset link itself comes from Supabase.
    // For a fully custom email, use admin.generateLink — but that requires service role.
    // For now: Supabase sends the functional reset link, we skip the branded overlay.

    console.log('[forgot-password] reset email sent via Supabase for:', email);
  } catch (err) {
    console.error('[forgot-password] error:', err);
  }

  return NextResponse.json({ ok: true });
}
