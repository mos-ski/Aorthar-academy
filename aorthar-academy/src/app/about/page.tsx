import Link from 'next/link';

const imgAortharIcon = '/Aorthar Logo long complete.svg';

const DEPARTMENTS = [
  { name: 'Product Management', description: 'Discovery, roadmapping, prioritisation, and shipping — end to end.' },
  { name: 'Product Design', description: 'Research, UX systems, visual craft, and interaction design.' },
  { name: 'Frontend Engineering', description: 'Component thinking, React, accessibility, and production delivery.' },
  { name: 'Backend Engineering', description: 'APIs, databases, auth, security, and scalable systems.' },
  { name: 'QA Engineering', description: 'Manual testing, automation, and quality culture from day one.' },
  { name: 'Scrum & Agile Ops', description: 'Sprint facilitation, delivery metrics, and stakeholder alignment.' },
  { name: 'Data & Analytics', description: 'Dashboards, query, experimentation, and data-driven decisions.' },
  { name: 'Growth & Operations', description: 'GTM strategy, funnel metrics, and cross-functional execution.' },
];

const MODEL_PILLARS = [
  {
    number: '01',
    title: 'Structured Curriculum',
    body: 'University-style cohorts organised by year and semester. Each course builds directly on the last — no filler modules.',
  },
  {
    number: '02',
    title: 'Real Internship Placement',
    body: 'Students move from coursework into live project teams. We partner with startups and product companies that need contributors, not observers.',
  },
  {
    number: '03',
    title: 'Mentorship Access',
    body: 'Senior practitioners in your track review your work, answer questions, and help you navigate the gap between learning and doing.',
  },
  {
    number: '04',
    title: 'Portfolio-Driven Outcomes',
    body: 'Every student finishes with a capstone project, documented case studies, and a record of shipped work employers can actually evaluate.',
  },
];

const STATS = [
  { value: '8', label: 'Departments' },
  { value: '150+', label: 'Courses' },
  { value: '3', label: 'Cohorts per year' },
  { value: '1,000+', label: 'Learners trained' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0b0d0f', color: '#ffffff' }}>

      {/* ── Navbar ── */}
      <header style={{ backgroundColor: '#0b0d0f' }}>
        <div
          className="flex items-center justify-between px-4 sm:px-8 h-12 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src={imgAortharIcon} alt="Aorthar" className="h-9 sm:h-11 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/about" className="text-base font-medium text-[#a7d252] transition-colors hidden sm:block">
              About us
            </Link>
            <a
              href="https://www.motivv.co/post-job"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-medium text-white/70 hover:text-[#a7d252] transition-colors whitespace-nowrap"
            >
              Hire from us
            </a>
          </div>
        </div>

        <div
          className="flex items-center gap-5 sm:gap-6 px-4 sm:px-8 h-9 sm:h-10 overflow-x-auto border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)', scrollbarWidth: 'none' }}
        >
          {[
            { label: 'Home', href: '/' },
            { label: 'University', href: '/university' },
            { label: 'Courses', href: '/explore-courses' },
            { label: 'Pricing', href: '/pricing' },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[15px] font-medium text-white/60 hover:text-[#a7d252] transition-colors whitespace-nowrap shrink-0"
            >
              {label}
            </Link>
          ))}
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative px-4 sm:px-8 pt-16 sm:pt-24 pb-14 sm:pb-20 max-w-5xl mx-auto">
        {/* Decorative glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(167,210,82,0.07) 0%, transparent 70%)',
          }}
        />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a7d252] mb-5">About Aorthar Academy</p>
          <h1
            className="text-4xl sm:text-5xl lg:text-[60px] font-bold leading-[1.1] tracking-tight max-w-3xl"
            style={{ letterSpacing: '-0.02em' }}
          >
            Training the next generation of{' '}
            <span
              className="relative inline-block"
              style={{
                backgroundImage: 'linear-gradient(135deg, #a7d252, #c8f060)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              product builders
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-white/65 max-w-2xl leading-relaxed">
            Aorthar is a product internship school for enthusiasts, students, entry-level talent, and career switchers.
            We close the gap between learning and actually working on product teams.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/internship"
              className="px-5 py-2.5 rounded-md text-sm font-semibold text-black transition hover:opacity-90"
              style={{ backgroundColor: '#a7d252' }}
            >
              Apply for Internship →
            </Link>
            <Link
              href="/pricing"
              className="px-5 py-2.5 rounded-md text-sm font-semibold text-white/85 border border-white/15 hover:border-[#a7d252] hover:text-white transition"
            >
              View Plans
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div
        className="border-y"
        style={{ borderColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.02)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-8 grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.07]">
          {STATS.map(({ value, label }) => (
            <div key={label} className="py-6 sm:py-8 px-5 sm:px-8 flex flex-col gap-1">
              <span className="text-3xl sm:text-4xl font-bold text-[#a7d252] tracking-tight">{value}</span>
              <span className="text-sm text-white/50 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mission ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <div
          className="rounded-2xl p-8 sm:p-12 border"
          style={{
            borderColor: 'rgba(255,255,255,0.08)',
            background: 'linear-gradient(135deg, rgba(167,210,82,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a7d252] mb-4">Our Mission</p>
          <blockquote className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-snug text-white/90 max-w-3xl" style={{ letterSpacing: '-0.01em' }}>
            "Help people transition into product development and become employable, confident contributors on real teams."
          </blockquote>
          <p className="mt-6 text-base text-white/55 max-w-2xl leading-relaxed">
            Most training programmes teach theory. We train for team outcomes — the ability to show up on day one of an internship
            and actually contribute. That gap is what Aorthar closes.
          </p>
        </div>
      </section>

      {/* ── Departments ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pb-16 sm:pb-20">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a7d252] mb-3">What We Teach</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" style={{ letterSpacing: '-0.01em' }}>
            Eight departments. One coherent programme.
          </h2>
          <p className="mt-3 text-base text-white/55 max-w-xl">
            Each department has its own curriculum, teaching track, and progression path — all designed to mirror how real product teams are structured.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-px" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
          {DEPARTMENTS.map(({ name, description }) => (
            <div
              key={name}
              className="flex flex-col gap-2 p-6 sm:p-7 group transition-colors"
              style={{ backgroundColor: '#0b0d0f' }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: '#a7d252' }}
                />
                <div>
                  <p className="font-semibold text-white text-[15px] group-hover:text-[#a7d252] transition-colors">{name}</p>
                  <p className="mt-1 text-sm text-white/50 leading-relaxed">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Our Model ── */}
      <section
        className="border-y"
        style={{ borderColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.015)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a7d252] mb-3">How It Works</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" style={{ letterSpacing: '-0.01em' }}>
              Built for people who want to work, not just learn
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {MODEL_PILLARS.map(({ number, title, body }) => (
              <div
                key={number}
                className="rounded-xl border p-6 sm:p-7 flex flex-col gap-4"
                style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.025)' }}
              >
                <span className="text-xs font-bold tracking-widest text-[#a7d252] opacity-60">{number}</span>
                <h3 className="text-base sm:text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who We're For ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a7d252] mb-3">Who We're For</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" style={{ letterSpacing: '-0.01em' }}>
            You don't need experience. You need direction.
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              title: 'Students & Fresh Graduates',
              body: 'You have a degree but no product experience. Aorthar gives you the structured path from education to your first real tech role.',
            },
            {
              title: 'Career Switchers',
              body: "You're leaving a different industry and need to build credibility fast. Our portfolio-first model gets you results others can verify.",
            },
            {
              title: 'Early Product Professionals',
              body: "You have some exposure but want to formalise your skills, deepen your track, and access mentors who've done it before.",
            },
          ].map(({ title, body }) => (
            <div
              key={title}
              className="rounded-xl p-6 border flex flex-col gap-3"
              style={{ borderColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.02)' }}
            >
              <div
                className="w-8 h-0.5 rounded-full"
                style={{ backgroundColor: '#a7d252' }}
              />
              <h3 className="font-semibold text-white text-[15px]">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="border-t"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" style={{ letterSpacing: '-0.01em' }}>
              Ready to get started?
            </h2>
            <p className="mt-2 text-base text-white/50">
              Applications for the next cohort are open. Spots are limited.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/internship"
              className="px-5 py-2.5 rounded-md text-sm font-semibold text-black transition hover:opacity-90 whitespace-nowrap"
              style={{ backgroundColor: '#a7d252' }}
            >
              Apply for Internship →
            </Link>
            <Link
              href="https://university.aorthar.com"
              className="px-5 py-2.5 rounded-md text-sm font-semibold text-white/80 border border-white/15 hover:border-[#a7d252] hover:text-white transition whitespace-nowrap"
            >
              Explore University
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="border-t px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <Link href="/">
          <img src={imgAortharIcon} alt="Aorthar" className="h-4 w-auto object-contain opacity-60" />
        </Link>
        <p className="text-xs text-white/30">© {new Date().getFullYear()} Aorthar Academy. All rights reserved.</p>
        <div className="flex gap-5">
          {[
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
            { label: 'Contact', href: '/contact' },
          ].map(({ label, href }) => (
            <Link key={label} href={href} className="text-xs text-white/40 hover:text-[#a7d252] transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
