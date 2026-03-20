import Link from 'next/link';
import InfoPageShell from '@/components/landing/InfoPageShell';

export default function AboutPage() {
  return (
    <InfoPageShell
      eyebrow="About"
      title="Aorthar Academy"
      subtitle="Aorthar is a product internship school training product enthusiasts, students, entry-level talent, and career switchers for real opportunities in tech."
    >
      <p className="text-white/85">We train in Product Management, Product Design, Frontend, Backend, QA, Scrum, and Operations. We focus on practical skills that map directly to team outcomes.</p>
      <p className="text-white/85">Our model combines structured courses, internships, university-style cohorts, mentorship access, and portfolio-driven execution.</p>
      <p className="text-white/85">Our goal is simple: help people transition into product development and become employable, confident contributors.</p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/internship" className="rounded-md bg-[#a7d252] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90">Apply for Internship</Link>
        <Link href="/university" className="rounded-md border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#a7d252]">Explore University</Link>
      </div>
    </InfoPageShell>
  );
}
