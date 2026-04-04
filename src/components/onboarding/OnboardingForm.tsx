'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AORTHAR_DEPARTMENTS } from '@/lib/academics/departments';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Layers,
  Package,
  Palette,
  Code2,
  Server,
  RefreshCw,
  Settings2,
  TestTube2,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface Course {
  id: string;
  code: string;
  name: string;
  description: string | null;
  credit_units: number;
}

const DEPARTMENT_META: Record<string, { icon: React.ElementType; description: string }> = {
  'UI/UX Design': { icon: Layers, description: 'Design systems, user research, and interaction design' },
  'Product Management': { icon: Package, description: 'Strategy, roadmaps, and stakeholder alignment' },
  'Product Design': { icon: Palette, description: 'Visual design, branding, and design systems' },
  'Design Engineering (FE)': { icon: Code2, description: 'React, TypeScript, and production-quality UI' },
  'Backend Engineering': { icon: Server, description: 'APIs, databases, and distributed systems' },
  'Scrum & Agile': { icon: RefreshCw, description: 'Sprint planning, ceremonies, and team delivery' },
  'Operations': { icon: Settings2, description: 'Process, analytics, and operational excellence' },
  'Quality Assurance (QA)': { icon: TestTube2, description: 'Test automation, QA strategy, and reliability' },
};

interface OnboardingFormProps {
  initialDepartment: string | null;
  studentName: string;
}

const STEPS = ['Welcome', 'Your Track', 'Confirm'];

export default function OnboardingForm({ initialDepartment, studentName }: OnboardingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [acknowledged, setAcknowledged] = useState(false);
  const [department, setDepartment] = useState<string>(initialDepartment ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const firstName = studentName.split(' ')[0];

  // Fetch Semester 1 courses when reaching Step 3
  useEffect(() => {
    if (step === 3 && department) {
      setCoursesLoading(true);
      fetch(`/api/onboarding/courses?department=${encodeURIComponent(department)}`)
        .then((r) => r.json())
        .then((data) => {
          setCourses(data.courses ?? []);
          setCoursesLoading(false);
        })
        .catch(() => setCoursesLoading(false));
    }
  }, [step, department]);

  async function completeOnboarding() {
    setLoading(true);
    setError(null);

    const response = await fetch('/api/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? 'Failed to complete onboarding. Please try again.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-2xl space-y-8">
        {/* Logo */}
        <div className="text-center">
          <p className="text-2xl font-bold tracking-tight">Aorthar<span className="text-primary">.</span></p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((label, i) => {
            const num = i + 1;
            const isComplete = step > num;
            const isActive = step === num;
            return (
              <div key={num} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold border-2 transition-colors',
                      isComplete
                        ? 'bg-primary border-primary text-primary-foreground'
                        : isActive
                        ? 'border-primary text-primary bg-background'
                        : 'border-muted text-muted-foreground bg-background',
                    )}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {isComplete ? <CheckCircle2 className="h-4 w-4" /> : num}
                  </div>
                  <span className={cn('text-xs', isActive ? 'text-primary font-medium' : 'text-muted-foreground')}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn('h-0.5 w-16 mx-2 mb-5 transition-colors', step > num ? 'bg-primary' : 'bg-muted')} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1 — Welcome & Rules */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome to Aorthar Academy, {firstName}.</h1>
              <p className="mt-2 text-muted-foreground">
                Aorthar Academy is a structured, 4-year product & design education programme.
                We believe world-class training should be accessible to everyone — built on real industry skills,
                not generic courses.
              </p>
            </div>

            <div className="rounded-lg border bg-muted/20 p-5 space-y-3">
              <p className="font-semibold">Academic Rules</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex gap-2"><span className="text-foreground font-medium shrink-0">GPA scale:</span> 5.0 — A+ = 5.0, D = 2.0, F = 0.0</li>
                <li className="flex gap-2"><span className="text-foreground font-medium shrink-0">Pass mark:</span> 60% per course</li>
                <li className="flex gap-2"><span className="text-foreground font-medium shrink-0">Course grade:</span> Quiz 40% + Final Exam 60%</li>
                <li className="flex gap-2"><span className="text-foreground font-medium shrink-0">Progression:</span> Semester 2 unlocks after all Semester 1 courses are passed</li>
                <li className="flex gap-2"><span className="text-foreground font-medium shrink-0">Year 400:</span> Requires an active Premium subscription</li>
                <li className="flex gap-2"><span className="text-foreground font-medium shrink-0">Exam attempts:</span> Max 3 per course — 24-hour cooldown on fail</li>
              </ul>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                id="acknowledge"
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border accent-primary cursor-pointer"
              />
              <span className="text-sm">
                I have read and understood the Aorthar Academic Rules.
              </span>
            </label>

            <Button className="w-full" disabled={!acknowledged} onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        )}

        {/* Step 2 — Choose Department */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Choose Your Track</h1>
              <p className="mt-2 text-muted-foreground">
                Your department shapes your core curriculum. You can explore cross-functional courses later.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AORTHAR_DEPARTMENTS.map((dept) => {
                const meta = DEPARTMENT_META[dept];
                const Icon = meta?.icon;
                const isSelected = department === dept;
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setDepartment(dept)}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/40',
                      isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-background',
                    )}
                  >
                    {Icon && (
                      <div className={cn('mt-0.5 shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')}>
                        <Icon className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm">{dept}</p>
                      {meta?.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="w-1/3">
                Back
              </Button>
              <Button disabled={!department} onClick={() => setStep(3)} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 — Preview & Confirm */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{department}</h1>
              <p className="mt-2 text-muted-foreground">
                Review your Semester 1 courses before confirming enrollment.
              </p>
            </div>

            {/* Course list */}
            {coursesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : courses.length > 0 ? (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-background p-4"
                  >
                    <Badge variant="secondary" className="shrink-0 font-mono text-xs">
                      {course.code}
                    </Badge>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{course.name}</p>
                      {course.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {course.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {course.credit_units} credit{course.credit_units !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground text-center pt-2">
                  {courses.length} course{courses.length !== 1 ? 's' : ''} · Semester 1
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No courses found for this department yet. Courses will be added soon.
              </div>
            )}


            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="w-1/3" disabled={loading}>
                Back
              </Button>
              <Button onClick={completeOnboarding} disabled={loading} className="flex-1">
                {loading ? 'Setting up your semester...' : 'Confirm Enrollment'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
