'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/utils/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
    } catch {
      clearTimeout(timeout);
      // Timeout or network error — still show success (email may have sent)
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary flex-col justify-between p-12 text-primary-foreground">
        <Link href="/">
          <img src="/Aorthar Logo long complete.svg" alt="Aorthar" width={118} height={51} />
        </Link>
        <div className="space-y-5">
          <div className="h-14 w-14 rounded-2xl bg-primary-foreground/15 flex items-center justify-center">
            <BookOpen className="h-7 w-7" />
          </div>
          <blockquote className="text-3xl font-semibold leading-snug">
            &ldquo;A world-class design education, built for everyone.&rdquo;
          </blockquote>
          <p className="text-primary-foreground/60 text-sm">
            Year 100–400 · Structured · Community-driven
          </p>
        </div>
        <p className="text-xs text-primary-foreground/40">Aorthar Academy · Open Source</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm space-y-7">
          <div>
            <Link href="/" className="lg:hidden inline-block">
              <img src="/Aorthar Logo long complete.svg" alt="Aorthar" width={99} height={43} className="brightness-0 dark:brightness-100" />
            </Link>
            <h1 className="text-2xl font-bold mt-6">Reset your password</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {sent ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">Check your email for a password reset link. It may take a minute to arrive.</p>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Back to Sign In
                </Link>
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>

              <p className="text-sm text-muted-foreground text-center">
                Remember your password?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
