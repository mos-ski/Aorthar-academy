'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MailOpen } from 'lucide-react';

const RESEND_COOLDOWN = 60;

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [cooldown, setCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resendError, setResendError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (!email || cooldown > 0) return;
    setLoading(true);
    setResendError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
      setResendError(error.message);
      setResendStatus('error');
    } else {
      setResendStatus('success');
      setCooldown(RESEND_COOLDOWN);
    }
    setLoading(false);
  }, [email, cooldown]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <MailOpen className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We sent a verification link{email ? ` to ${email}` : ' to your email'}. Click the link to activate your account.
          </p>

          {resendStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50 text-green-700">
              <AlertDescription>Verification email resent. Check your inbox.</AlertDescription>
            </Alert>
          )}
          {resendStatus === 'error' && resendError && (
            <Alert variant="destructive">
              <AlertDescription>{resendError}</AlertDescription>
            </Alert>
          )}

          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive it? Check your spam folder or resend below.
          </p>

          {email && (
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={loading || cooldown > 0}
              className="w-full"
            >
              {loading
                ? 'Sending...'
                : cooldown > 0
                ? `Resend in ${cooldown}s`
                : 'Resend verification email'}
            </Button>
          )}

          <Button variant="ghost" asChild className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  );
}
