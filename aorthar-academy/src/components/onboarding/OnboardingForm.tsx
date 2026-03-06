'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AORTHAR_DEPARTMENTS } from '@/lib/academics/departments';
import { getSemester1EnrollmentCodes } from '@/lib/academics/plan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface OnboardingFormProps {
  initialDepartment: string | null;
  studentName: string;
}

export default function OnboardingForm({ initialDepartment, studentName }: OnboardingFormProps) {
  const router = useRouter();
  const [department, setDepartment] = useState<string>(initialDepartment ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const semester1Codes = department ? getSemester1EnrollmentCodes(department) : null;

  async function completeOnboarding() {
    setLoading(true);
    setError(null);

    if (!department) {
      setError('Please select your department to continue.');
      setLoading(false);
      return;
    }

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
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div>
          <Badge variant="outline" className="mb-3">Faculty Onboarding</Badge>
          <h1 className="text-4xl font-semibold tracking-tight">Welcome to Aorthar, {studentName}</h1>
          <p className="mt-2 text-muted-foreground">
            Faculty of Product Development. Select your discipline and start Year 100, Semester 1.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Department Selection</CardTitle>
            <CardDescription>
              Your department shapes your core track. You can still explore cross-functional courses later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label>Choose your department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {AORTHAR_DEPARTMENTS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
              {semester1Codes ? (
                <>
                  <p className="font-medium text-foreground">{department} — Semester 1 Courses</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {semester1Codes.map((code) => (
                      <Badge key={code} variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                        {code}
                      </Badge>
                    ))}
                  </div>
                  <p className="pt-1"><strong>Course format:</strong> 12-week classes with lesson videos, quizzes, and GPA tracking.</p>
                </>
              ) : (
                <>
                  <p><strong>Next:</strong> You will be enrolled into entry-level courses for Semester 1.</p>
                  <p><strong>Shared foundation:</strong> PM101, DES101, and PM103 are common across departments.</p>
                  <p><strong>Course format:</strong> 12-week classes with lesson videos, quizzes, and GPA tracking.</p>
                </>
              )}
            </div>

            <Button onClick={completeOnboarding} disabled={loading || !department} className="w-full">
              {loading ? 'Setting up your semester...' : 'Start Year 100 Semester 1'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
