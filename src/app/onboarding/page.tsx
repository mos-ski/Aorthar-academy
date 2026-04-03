import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import OnboardingForm from '@/components/onboarding/OnboardingForm';

export default async function OnboardingPage() {
  const { user, profile } = await requireAuth();

  if (profile?.department && profile?.onboarding_completed_at) {
    redirect('/dashboard');
  }

  const studentName =
    profile?.full_name?.split(' ')[0] ??
    user.email?.split('@')[0] ??
    'Student';

  return (
    <OnboardingForm
      initialDepartment={profile?.department ?? null}
      studentName={studentName}
    />
  );
}

