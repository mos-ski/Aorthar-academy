import Link from 'next/link';
import InfoPageShell from '@/components/landing/InfoPageShell';

export default function InternshipPage() {
  return (
    <InfoPageShell
      eyebrow="Program"
      title="Internship Application"
      subtitle="Apply for Aorthar's cohort internship and get hands-on product experience with real-world project workflows."
    >
      <p className="text-white/85">Start your application using the live flow below. This is the current intake process for internship candidates.</p>
      <div className="flex flex-col gap-3">
        <Link href="https://aorthar.framer.website/start" className="rounded-md bg-[#a7d252] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90">Start Application</Link>
        <Link href="https://aorthar.framer.website/start/who-can-apply" className="rounded-md border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#a7d252]">Who Can Apply</Link>
        <Link href="https://aorthar.framer.website/start/apply" className="rounded-md border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#a7d252]">Go to Apply Form</Link>
      </div>
    </InfoPageShell>
  );
}
