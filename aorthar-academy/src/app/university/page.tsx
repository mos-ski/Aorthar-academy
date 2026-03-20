import Link from 'next/link';
import InfoPageShell from '@/components/landing/InfoPageShell';

export default function UniversityPage() {
  return (
    <InfoPageShell
      eyebrow="Program"
      title="Aorthar University"
      subtitle="A structured, cohort-style program for learners who want a guided path into product development and execution."
    >
      <p className="text-white/85">Aorthar University replaces the old bootcamp framing with a clearer path: foundation courses, practical portfolio projects, team collaboration, and career readiness.</p>
      <p className="text-white/85">You will work through real product scenarios across design, PM, engineering, QA, scrum, and operations with mentor support and accountability.</p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/internship" className="rounded-md bg-[#a7d252] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90">Apply for Next Cohort</Link>
        <Link href="/explore-courses" className="rounded-md border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#a7d252]">See Course Track</Link>
      </div>
    </InfoPageShell>
  );
}
