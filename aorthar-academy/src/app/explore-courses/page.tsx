import Link from 'next/link';
import InfoPageShell from '@/components/landing/InfoPageShell';

type CatalogCourse = {
  title: string;
  level: string;
  track: string;
  blurb: string;
};

const COURSES: CatalogCourse[] = [
  {
    title: 'Product Management Foundations',
    level: 'Beginner',
    track: 'PM',
    blurb: 'Problem discovery, product strategy, roadmap basics, and execution rituals for entry-level PM roles.',
  },
  {
    title: 'Frontend Product Build Path',
    level: 'Beginner to Intermediate',
    track: 'Frontend',
    blurb: 'HTML, CSS, JavaScript, React, and production collaboration practices used in modern product teams.',
  },
  {
    title: 'Quality Assurance in Product Teams',
    level: 'Beginner',
    track: 'QA',
    blurb: 'Testing fundamentals, bug lifecycle, test design, and practical QA workflows for real products.',
  },
  {
    title: 'Scrum & Ops Execution',
    level: 'Intermediate',
    track: 'ScrumOps',
    blurb: 'Sprint planning, backlog hygiene, release management, and team systems that scale delivery.',
  },
];

export default function ExploreCoursesPage() {
  return (
    <InfoPageShell
      eyebrow="Courses"
      title="Course Catalog"
      subtitle="A marketplace-style preview of Aorthar learning tracks. Learn at your own pace and move into practical execution."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {COURSES.map((course) => (
          <article key={course.title} className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#a7d252]">{course.track}</p>
            <h2 className="mt-2 text-lg font-semibold">{course.title}</h2>
            <p className="mt-2 text-sm text-white/75">{course.blurb}</p>
            <p className="mt-3 text-xs text-white/60">Level: {course.level}</p>
          </article>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/register" className="rounded-md bg-[#a7d252] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90">Get Started on Aorthar</Link>
        <Link href="https://aorthar.teachwithdaba.com" className="rounded-md border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#a7d252]">View External Course Store</Link>
      </div>
    </InfoPageShell>
  );
}
