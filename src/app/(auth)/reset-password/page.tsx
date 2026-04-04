'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { resetPasswordSchema, type ResetPasswordInput } from '@/utils/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, CheckCircle } from 'lucide-react';
// Create the client once at module level so it processes the URL hash
// before React even mounts the component — avoids missing the PASSWORD_RECOVERY event.
let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) _supabase = createClient();
  return _supabase;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [tokenState, setTokenState] = useState<'waiting' | 'ready' | 'invalid'>('waiting');
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const supabase = getSupabase();

    // Listen for PASSWORD_RECOVERY — fires when Supabase processes the hash token
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setTokenState('ready');
      }
    });

    // Fallback timeout — only mark invalid if nothing resolved after 30s
    const timer = setTimeout(() => {
      setTokenState((prev) => prev === 'waiting' ? 'invalid' : prev);
    }, 30000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function onSubmit(values: ResetPasswordInput) {
    setLoading(true);
    setError(null);
    const supabase = getSupabase();

    const { error } = await supabase.auth.updateUser({ password: values.password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);

    setTimeout(() => {
      const dest = window.location.hostname.includes('courses.')
        || window.location.hostname.includes('bootcamp.')
        ? '/courses-app/learn'
        : '/dashboard';
      router.push(dest);
      router.refresh();
    }, 2000);
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
            <h1 className="text-2xl font-bold mt-6">Set a new password</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Choose a strong password for your account.
            </p>
          </div>

          {tokenState === 'waiting' && (
            <p className="text-sm text-muted-foreground animate-pulse">Verifying your reset link…</p>
          )}

          {tokenState === 'invalid' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  This reset link has expired or is invalid. Please request a new one.
                </AlertDescription>
              </Alert>
              <Link href="/forgot-password">
                <Button className="w-full">Request a new link</Button>
              </Link>
            </div>
          )}

          {tokenState === 'ready' && !done && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Updating…' : 'Update Password'}
              </Button>
            </form>
          )}

          {done && (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">Password updated! Taking you to your dashboard…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
