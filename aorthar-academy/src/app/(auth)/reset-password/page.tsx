'use client';

import { useState } from 'react';
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
import { BookOpen } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(values: ResetPasswordInput) {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({ password: values.password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const dest = window.location.hostname.includes('courses.')
      ? '/courses-app/learn'
      : '/dashboard';
    router.push(dest);
    router.refresh();
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
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
