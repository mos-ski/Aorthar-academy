import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const imgAortharIcon = '/Aorthar Logo long complete.svg';

const DEPARTMENTS = [
  { name: 'Product Management', code: 'PM', color: '#a7d252' },
  { name: 'Product Design', code: 'PD', color: '#5fc49a' },
  { name: 'Frontend Engineering', code: 'FE', color: '#7eb8f7' },
  { name: 'Backend Engineering', code: 'BE', color: '#f7c97e' },
  { name: 'QA Engineering', code: 'QA', color: '#c49af0' },
  { name: 'Scrum & Agile Ops', code: 'SO', color: '#f09a7e' },
  { name: 'Data & Analytics', code: 'DA', color: '#7ef0e8' },
  { name: 'Growth & Operations', code: 'GO', color: '#f07eb8' },
];

const YEARS = [
  {
    year: '100',
    label: 'Year 1',
    theme: 'Foundations',
    description: 'Core concepts, tooling, and team mindset. You learn how product teams are structured and start developing your craft from first principles.',
    free: true,
  },
  {
    year: '200',
    label: 'Year 2',
    theme: 'Application',
    description: 'Frameworks, workflows, and real deliverables. You apply your foundations to structured projects that mirror actual product team outputs.',
    free: true,
  },
  {
    year: '300',
    label: 'Year 3',
    theme: 'Mastery',
    description: 'Advanced techniques, cross-functional thinking, and leadership-track skills. You start leading projects, not just completing them.',
    free: true,
  },
  {
    year: '400',
    label: 'Year 4',
    theme: 'Industry',
    description: 'Capstone projects, mentorship, and professional portfolio. You graduate with documented shipped work and connections to real hiring teams.',
    free: false,
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Choose your department',
    body: 'Pick the track that matches your goal — design, engineering, management, or operations. Each has its own curriculum built for how that discipline actually works.',
  },
  {
    step: '02',
    title: 'Progress year by year',
    body: 'Move through Year 100 to 400 in sequence. Each year unlocks new depth. No skipping ahead — the progression exists because it works.',
  },
  {
    step: '03',
    title: 'Build a real portfolio',
    body: 'Every course produces an output you own. By Year 400, you have case studies, shipped work, and a record that employers can actually evaluate.',
  },
  {
    step: '04',
    title: 'Graduate to internship',
    body: 'Top performers move directly into Aorthar Internship placements — live product teams, real problems, paid opportunity.',
  },
];

export default async function UniversityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div style={{ backgroundColor: '#0b0d0f', color: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Navbar ── */}
      <header style={{ backgroundColor: '#0b0d0f', position: 'sticky', top: 0, zIndex: 50 }}>
        <div
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          className="flex items-center justify-between px-4 sm:px-8 h-14"
        >
          <Link href="https://aorthar.com" className="flex items-center gap-2 shrink-0">
            <img src={imgAortharIcon} alt="Aorthar" className="h-9 sm:h-11 w-auto object-contain" />
          </Link>
          <nav className="hidden sm:flex items-center gap-6">
            <a
              href="https://aorthar.com/pricing"
              className="text-sm font-medium text-white/60 hover:text-[#a7d252] transition-colors"
            >
              Pricing
            </a>
            <a
              href="https://aorthar.com/about"
              className="text-sm font-medium text-white/60 hover:text-[#a7d252] transition-colors"
            >
              About
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors px-3 py-1.5"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold text-black px-4 py-2 rounded-md transition hover:opacity-90"
              style={{ backgroundColor: '#a7d252' }}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative px-4 sm:px-8 pt-20 sm:pt-32 pb-20 sm:pb-28 max-w-6xl mx-auto">
        {/* Background glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center top, rgba(167,210,82,0.06) 0%, transparent 65%)' }}
        />
        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(167,210,82,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(167,210,82,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative text-center max-w-4xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-8 border"
            style={{ color: '#a7d252', borderColor: 'rgba(167,210,82,0.25)', backgroundColor: 'rgba(167,210,82,0.06)' }}
          >
            Aorthar University
          </div>
          <h1
            className="text-5xl sm:text-6xl lg:text-[78px] font-black leading-[0.95] tracking-tight mb-6"
            style={{ letterSpacing: '-0.03em', fontFamily: 'Impact, "Arial Black", sans-serif' }}
          >
            A university built{' '}
            <span
              style={{
                backgroundImage: 'linear-gradient(135deg, #a7d252, #c8f060)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              for the industry
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed mb-10">
            Four years of structured, department-specific curriculum designed to take you from zero to employable — with a real internship at the end.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3 rounded-md text-sm font-bold text-black transition hover:opacity-90"
              style={{ backgroundColor: '#a7d252' }}
            >
              Start free — Year 100 →
            </Link>
            <a
              href="https://aorthar.com/pricing"
              className="px-6 py-3 rounded-md text-sm font-semibold text-white/80 border border-white/15 hover:border-[#a7d252] hover:text-white transition"
            >
              View pricing
            </a>
          </div>
        </div>
      </section>

      {/* ── Year Progression ── */}
      <section
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.015)' }}
        className="py-16 sm:py-20"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a7d252] mb-3">Programme Structure</p>
            <h2
              className="text-3xl sm:text-4xl font-black tracking-tight text-white"
              style={{ letterSpacing: '-0.02em', fontFamily: 'Impact, "Arial Black", sans-serif' }}
            >
              Four years. One career path.
            </h2>
            <p className="mt-3 text-base text-white/50 max-w-xl mx-auto">
              Each year level builds directly on the last. The structure is intentional — the progression is what produces results.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {YEARS.map(({ year, label, theme, description, free }, idx) => (
              <div
                key={year}
                className="relative rounded-2xl p-6 flex flex-col gap-4 border"
                style={{
                  borderColor: free ? 'rgba(255,255,255,0.08)' : 'rgba(167,210,82,0.25)',
                  backgroundColor: free ? 'rgba(255,255,255,0.025)' : 'rgba(167,210,82,0.04)',
                }}
              >
                {!free && (
                  <div
                    className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(167,210,82,0.15)', color: '#a7d252' }}
                  >
                    Premium
                  </div>
                )}
                <div>
                  <span
                    className="text-5xl font-black leading-none"
                    style={{ fontFamily: 'Impact, "Arial Black", sans-serif', color: free ? 'rgba(255,255,255,0.12)' : 'rgba(167,210,82,0.2)' }}
                  >
                    {year}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">{label}</p>
                  <h3
                    className="text-lg font-bold text-white"
                    style={{ letterSpacing: '-0.01em' }}
                  >
                    {theme}
                  </h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed flex-1">{description}</p>
                <div
                  className="text-xs font-semibold"
                  style={{ color: free ? '#5fc49a' : '#a7d252' }}
                >
                  {free ? 'Included free' : 'Premium required'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Departments ── */}
      <section className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a7d252] mb-3">Departments</p>
          <h2
            className="text-3xl sm:text-4xl font-black tracking-tight text-white"
            style={{ letterSpacing: '-0.02em', fontFamily: 'Impact, "Arial Black", sans-serif' }}
          >
            Eight tracks. Pick yours.
          </h2>
          <p className="mt-3 text-base text-white/50 max-w-xl mx-auto">
            Each department has its own four-year curriculum and learning track — all structured to mirror how real product teams operate.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DEPARTMENTS.map(({ name, code, color }) => (
            <div
              key={name}
              className="group rounded-xl border p-5 flex flex-col gap-3 transition-all hover:border-opacity-50"
              style={{ borderColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.02)' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black"
                style={{ backgroundColor: `${color}15`, color }}
              >
                {code}
              </div>
              <p className="text-sm font-semibold text-white/80 leading-snug">{name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.015)' }}
        className="py-16 sm:py-20"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a7d252] mb-3">How It Works</p>
            <h2
              className="text-3xl sm:text-4xl font-black tracking-tight text-white"
              style={{ letterSpacing: '-0.02em', fontFamily: 'Impact, "Arial Black", sans-serif' }}
            >
              Learn. Build. Get hired.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {HOW_IT_WORKS.map(({ step, title, body }) => (
              <div
                key={step}
                className="rounded-2xl border p-7 flex gap-5"
                style={{ borderColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.025)' }}
              >
                <span
                  className="text-4xl font-black shrink-0 leading-none mt-1"
                  style={{ fontFamily: 'Impact, "Arial Black", sans-serif', color: 'rgba(167,210,82,0.2)' }}
                >
                  {step}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a7d252] mb-3">Pricing</p>
          <h2
            className="text-3xl sm:text-4xl font-black tracking-tight text-white"
            style={{ letterSpacing: '-0.02em', fontFamily: 'Impact, "Arial Black", sans-serif' }}
          >
            Start free. Go further with Premium.
          </h2>
          <p className="mt-3 text-base text-white/50 max-w-xl mx-auto">
            Years 100–300 are fully free. Premium unlocks Year 400, mentorship access, and internship placement consideration.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free tier */}
          <div
            className="rounded-2xl border p-8 flex flex-col gap-5"
            style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.025)' }}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Free</p>
              <p
                className="text-4xl font-black text-white"
                style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
              >
                ₦0
              </p>
              <p className="text-sm text-white/40 mt-1">Forever free</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {[
                'Access to Year 100, 200, and 300',
                'All 8 departments',
                'Full course library for these years',
                'Progress tracking & GPA',
                'Community access',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/65">
                  <span style={{ color: '#5fc49a', flexShrink: 0 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-auto text-center py-3 rounded-lg text-sm font-bold text-white border border-white/15 hover:border-white/30 transition"
            >
              Start for free →
            </Link>
          </div>

          {/* Premium tier */}
          <div
            className="rounded-2xl border p-8 flex flex-col gap-5 relative overflow-hidden"
            style={{ borderColor: 'rgba(167,210,82,0.3)', backgroundColor: 'rgba(167,210,82,0.04)' }}
          >
            <div
              className="absolute top-0 right-0 w-[200px] h-[200px] pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at top right, rgba(167,210,82,0.08) 0%, transparent 70%)' }}
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#a7d252] mb-1">Premium</p>
              <p
                className="text-4xl font-black text-white"
                style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
              >
                ₦20,000
              </p>
              <p className="text-sm text-white/40 mt-1">One-time payment</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {[
                'Everything in Free',
                'Year 400 — Industry level',
                'Mentor review access',
                'Capstone project guidance',
                'Internship placement consideration',
                'Certificate of completion',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                  <span style={{ color: '#a7d252', flexShrink: 0 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="https://aorthar.com/pricing"
              className="mt-auto text-center py-3 rounded-lg text-sm font-bold text-black transition hover:opacity-90"
              style={{ backgroundColor: '#a7d252' }}
            >
              Get Premium →
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        className="py-16 sm:py-24"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a7d252] mb-5">Get started today</p>
          <h2
            className="text-4xl sm:text-5xl font-black text-white mb-5 leading-[1.0]"
            style={{ letterSpacing: '-0.02em', fontFamily: 'Impact, "Arial Black", sans-serif' }}
          >
            Year 100 is waiting for you.
          </h2>
          <p className="text-base text-white/50 mb-10 max-w-lg mx-auto leading-relaxed">
            Create a free account, pick your department, and start building the skills that get you hired.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="px-7 py-3.5 rounded-md text-sm font-bold text-black transition hover:opacity-90"
              style={{ backgroundColor: '#a7d252' }}
            >
              Create free account →
            </Link>
            <Link
              href="/login"
              className="px-7 py-3.5 rounded-md text-sm font-semibold text-white/75 border border-white/15 hover:border-white/30 hover:text-white transition"
            >
              Already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        className="px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <Link href="https://aorthar.com">
          <img src={imgAortharIcon} alt="Aorthar" className="h-4 w-auto object-contain opacity-50" />
        </Link>
        <p className="text-xs text-white/25">© {new Date().getFullYear()} Aorthar Academy. All rights reserved.</p>
        <div className="flex gap-5">
          {[
            { label: 'Privacy', href: 'https://aorthar.com/privacy' },
            { label: 'Terms', href: 'https://aorthar.com/terms' },
            { label: 'Contact', href: 'https://aorthar.com/contact' },
          ].map(({ label, href }) => (
            <a key={label} href={href} className="text-xs text-white/35 hover:text-[#a7d252] transition-colors">
              {label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
