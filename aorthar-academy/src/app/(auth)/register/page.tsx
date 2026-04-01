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
import { GraduationCap } from 'lucide-react';

// Courses-domain: name + email + password only
const coursesSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

// University: adds department
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

    // Build callback URL — pass ?next so after email verify they land in the right place
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

    // Fire welcome email — best-effort, don't block navigation
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
    <div className="min-h-screen flex">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary flex-col justify-between p-12 text-primary-foreground">
        <Link href={isCourses ? '/courses-app' : '/'}>
          <img src="/Aorthar Logo long complete.svg" alt="Aorthar" width={118} height={51} />
        </Link>
        <div className="space-y-5">
          <div className="h-14 w-14 rounded-2xl bg-primary-foreground/15 flex items-center justify-center">
            <GraduationCap className="h-7 w-7" />
          </div>
          {isCourses ? (
            <>
              <h2 className="text-3xl font-semibold leading-snug">
                Buy once. Watch forever.
              </h2>
              <ul className="space-y-2 text-primary-foreground/70 text-sm">
                <li>✓ Lifetime access to your courses</li>
                <li>✓ Resume anytime on any device</li>
                <li>✓ Product Design, PM, Scrum & more</li>
              </ul>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-semibold leading-snug">
                Your design education starts here.
              </h2>
              <ul className="space-y-2 text-primary-foreground/70 text-sm">
                <li>✓ Free access to Year 100–300 content</li>
                <li>✓ Structured 4-year curriculum</li>
                <li>✓ Real GPA tracking & transcripts</li>
                <li>✓ Community-driven course content</li>
              </ul>
            </>
          )}
        </div>
        <p className="text-xs text-primary-foreground/40">Aorthar Academy · Open Source</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm space-y-7">
          <div>
            <Link href={isCourses ? '/courses-app' : '/'} className="lg:hidden inline-block">
              <img src="/Aorthar Logo long complete.svg" alt="Aorthar" width={99} height={43} className="brightness-0 dark:brightness-100" />
            </Link>
            <h1 className="text-2xl font-bold mt-6">Create your account</h1>
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
            {/* Department only shown on university domain */}
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
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
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
