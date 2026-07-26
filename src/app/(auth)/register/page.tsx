'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { AORTHAR_DEPARTMENTS } from '@/lib/academics/departments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const coursesSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

const universitySchema = coursesSchema.extend({
  department: z.enum(AORTHAR_DEPARTMENTS as unknown as [string, ...string[]], {
    message: 'Please select a department',
  }),
});

type CoursesInput = z.infer<typeof coursesSchema>;
type UniversityInput = z.infer<typeof universitySchema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCourses, setIsCourses] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsCourses(window.location.hostname.includes('courses.'));
  }, []);

  const next = searchParams.get('next') ?? '';

  const { register, control, handleSubmit, formState: { errors } } = useForm<UniversityInput>({
    resolver: zodResolver(isCourses ? coursesSchema : universitySchema) as any,
  });

  async function onSubmit(values: CoursesInput & { department?: string }) {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const callbackNext = next || (isCourses ? '/courses-app/learn' : '/dashboard');
    const callbackUrl = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(callbackNext)}`;

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: callbackUrl,
        data: {
          full_name: values.full_name,
          department: values.department ?? 'Product Management',
        },
      },
    });

    if (error) {
      console.error('Supabase signUp error:', error);
      setError(error.message || error.name || `Error ${error.status}: ${JSON.stringify(error)}`);
      setLoading(false);
      return;
    }

    if (values.department && !isCourses) {
      await fetch('/api/profile/department', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department: values.department }),
      });
    }

    fetch('/api/auth/send-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: values.email,
        firstName: values.full_name.split(' ')[0],
        isCourses,
      }),
    }).catch(() => {});

    const verifyNext = next ? `&next=${encodeURIComponent(next)}` : '';
    router.push(`/verify?email=${encodeURIComponent(values.email)}${verifyNext}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm space-y-7">
        <div>
          <Link href={isCourses ? '/courses-app' : '/'} className="inline-block mb-8">
            <img src="/Aorthar Logo long complete.svg" alt="Aorthar" width={99} height={43} className="brightness-0 dark:brightness-100" />
          </Link>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isCourses
              ? 'Sign up to purchase and access your courses.'
              : 'Step 1 of 2 — you\'ll complete onboarding after verifying your email.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
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
          {!isCourses && (
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
          )}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pr-14"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                style={{ color: '#a7d252' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{' '}
          <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
