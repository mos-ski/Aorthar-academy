'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { registerSchema, type RegisterInput } from '@/utils/validators';
import { AORTHAR_DEPARTMENTS } from '@/lib/academics/departments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterInput) {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        data: {
          full_name: values.full_name,
          department: values.department,
        },
      },
    });

    if (error) {
      console.error('Supabase signUp error:', error);
      setError(error.message || error.name || `Error ${error.status}: ${JSON.stringify(error)}`);
      setLoading(false);
      return;
    }

    router.push(`/verify?email=${encodeURIComponent(values.email)}`);
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
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-semibold leading-snug">
            Your design education starts here.
          </h2>
          <ul className="space-y-2 text-primary-foreground/70 text-sm">
            <li>✓ Free access to Year 100–300 content</li>
            <li>✓ Structured 4-year curriculum</li>
            <li>✓ Real GPA tracking & transcripts</li>
            <li>✓ Community-driven course content</li>
          </ul>
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
            <h1 className="text-2xl font-bold mt-6">Create your account</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Step 1 of 2 — you&apos;ll complete onboarding after verifying your email.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" placeholder="Ada Lovelace" {...register('full_name')} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Department / Discipline</Label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your major" />
                    </SelectTrigger>
                    <SelectContent>
                      {AORTHAR_DEPARTMENTS.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
