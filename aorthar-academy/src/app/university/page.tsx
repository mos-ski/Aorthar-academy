import Link from "next/link";

const YEARS = [
  {
    year: "Year 100",
    label: "Foundation",
    free: true,
    description: "The building blocks of product development. Understand how great products are built, the roles inside product teams, and how to think like a product professional.",
    courses: ["Introduction to Product Development", "Design Thinking & User Research", "Product Mindset & Communication", "Tools & Workflows for Product Teams"],
  },
  {
    year: "Year 200",
    label: "Intermediate",
    free: true,
    description: "Go deeper into your chosen track. Build hands-on skills, complete practice projects, and start developing a professional portfolio.",
    courses: ["Track-specific core courses", "Practical project work", "Peer collaboration & review", "Career readiness foundations"],
  },
  {
    year: "Year 300",
    label: "Advanced",
    free: true,
    description: "Work on real-world case studies, master advanced tools and processes, and prepare for professional environments.",
    courses: ["Advanced track specialisation", "Industry case studies", "Team project simulation", "Interview preparation"],
  },
  {
    year: "Year 400",
    label: "Senior — Premium",
    free: false,
    description: "The final year. Work on a Capstone project with real stakes, access leadership content, and connect with hiring companies via Motivv.",
    courses: ["Capstone project", "Leadership & product strategy", "Motivv talent placement", "Graduation & certification"],
  },
];

const DEPARTMENTS = [
  { name: "Product Design", icon: "🎨" },
  { name: "Product Management", icon: "📋" },
  { name: "QA & Testing", icon: "🔍" },
  { name: "Scrum & Agile", icon: "⚡" },
  { name: "Tech Operations", icon: "🛠" },
  { name: "Frontend Development", icon: "💻" },
  { name: "Backend Development", icon: "⚙️" },
  { name: "Product Marketing", icon: "📣" },
];

const FEATURES = [
  { icon: "📚", title: "Structured Curriculum", body: "A 4-year learning path designed with the rigour of a university degree — built for the modern product industry." },
  { icon: "📊", title: "Real GPA Tracking", body: "Earn grades on quizzes and exams. Your GPA is calculated in real time across every course you take." },
  { icon: "🎓", title: "Capstone Project", body: "Graduate with a real-world project that proves your skills. Show it to any employer in Africa or beyond." },
  { icon: "🏆", title: "Industry Recognition", body: "Aorthar graduates are placed with partner startups. Your certificate carries real-world weight." },
];

export default function UniversityPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#18191a", color: "#ffffff" }}>

      {/* Nav */}
      <header
        className="flex items-center justify-between px-5 sm:px-10 h-14 border-b sticky top-0 z-10"
        style={{ backgroundColor: "#18191a", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <Link href="/">
          <img src="/Aorthar Logo long complete.svg" alt="Aorthar" width={99} height={43} />
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/login" className="text-[13px] sm:text-[14px] text-white/60 hover:text-white transition-colors">
            Log in
          </Link>
          <Link
            href="/register"
            className="text-[13px] sm:text-[14px] font-semibold px-4 py-2 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#08694a", color: "#ffffff" }}
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-5 sm:px-10 pt-20 sm:pt-28 pb-20 overflow-hidden" style={{ backgroundColor: "#101010" }}>
        {/* bg glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(900px 600px at 80% -100px, rgba(167,210,82,0.07), transparent 65%), radial-gradient(700px 500px at -10% 50%, rgba(8,105,74,0.08), transparent 70%)" }} />
        <div className="relative max-w-[1280px] mx-auto">
          <div className="max-w-[680px]">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-[13px] font-semibold"
              style={{ backgroundColor: "rgba(167,210,82,0.1)", border: "1px solid rgba(167,210,82,0.25)", color: "#a7d252" }}
            >
              🎓 Africa&apos;s #1 Product Internship School
            </div>
            <h1
              className="text-[38px] sm:text-[58px] lg:text-[68px] font-semibold leading-[1.05] mb-6"
              style={{ letterSpacing: "-0.03em" }}
            >
              Your 4-Year Product
              <br />
              <span style={{ color: "#a7d252" }}>Degree. Online. Free.</span>
            </h1>
            <p className="text-[16px] sm:text-[18px] leading-7 mb-10 max-w-[560px]" style={{ color: "#b1b1b1" }}>
              A university-style structured curriculum for Product Designers, PMs, QA Engineers, Scrum Masters, and Tech Ops specialists. Learn at your own pace. Graduate with a real GPA and Capstone project.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="flex items-center justify-center font-bold text-[15px] px-8 py-3.5 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#a7d252", color: "#18191a" }}
              >
                Get Started Free →
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center font-semibold text-[15px] px-8 py-3.5 transition-opacity hover:opacity-80"
                style={{ border: "1px solid rgba(255,255,255,0.25)", color: "#ffffff" }}
              >
                Log in
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 sm:gap-14 mt-14 pt-10" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {[
              { n: "8", label: "Departments" },
              { n: "4", label: "Academic years" },
              { n: "100+", label: "Courses & lessons" },
              { n: "2,000+", label: "Students enrolled" },
              { n: "₦0", label: "Cost for Year 1–3" },
            ].map(({ n, label }) => (
              <div key={label}>
                <p className="text-[26px] sm:text-[30px] font-bold text-white">{n}</p>
                <p className="text-[13px] mt-0.5" style={{ color: "#a0aba7" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 sm:px-10 py-16 sm:py-20" style={{ backgroundColor: "#18191a" }}>
        <div className="max-w-[1280px] mx-auto">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: "#a7d252" }}>Getting Started</p>
          <h2 className="text-[26px] sm:text-[34px] font-semibold mb-10" style={{ letterSpacing: "-0.02em" }}>
            How Aorthar University Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
            {[
              { n: "01", title: "Create your free account", body: "Sign up in under 2 minutes. Choose your department — Product Design, PM, QA, and more." },
              { n: "02", title: "Progress Year by Year", body: "Learn at your own pace through structured courses, quizzes, and exams. Pass Year 1 to unlock Year 2." },
              { n: "03", title: "Graduate with proof", body: "Earn a real GPA, complete your Capstone in Year 400, and get matched with hiring companies via Motivv." },
            ].map((s) => (
              <div key={s.n} className="flex flex-col gap-4 p-8 sm:p-10" style={{ backgroundColor: "#18191a" }}>
                <p className="text-[36px] font-bold" style={{ color: "rgba(167,210,82,0.3)" }}>{s.n}</p>
                <p className="text-[17px] font-semibold text-white">{s.title}</p>
                <p className="text-[14px] leading-6" style={{ color: "#a0aba7" }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="px-5 sm:px-10 py-16 sm:py-20" style={{ backgroundColor: "#101010" }}>
        <div className="max-w-[1280px] mx-auto">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: "#a7d252" }}>Curriculum</p>
          <h2 className="text-[26px] sm:text-[34px] font-semibold mb-3" style={{ letterSpacing: "-0.02em" }}>
            4 Years. Real Structure. Real Outcomes.
          </h2>
          <p className="text-[15px] leading-7 mb-10 max-w-[560px]" style={{ color: "#b1b1b1" }}>
            Each year builds on the last. Pass your quizzes and exams to unlock the next level. The grading formula mirrors real academic standards.
          </p>
          <div className="space-y-4">
            {YEARS.map((y) => (
              <div
                key={y.year}
                className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8 rounded-xl"
                style={{ backgroundColor: "#1c1c1c", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="sm:w-[180px] shrink-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[15px] font-bold text-white">{y.year}</span>
                    {!y.free && (
                      <span className="text-[11px] font-semibold px-2 py-0.5" style={{ backgroundColor: "rgba(167,210,82,0.15)", color: "#a7d252", border: "1px solid rgba(167,210,82,0.3)" }}>
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-[13px]" style={{ color: "#a0aba7" }}>{y.label}</p>
                  {y.free && <p className="text-[12px] mt-1 font-medium" style={{ color: "#5fc49a" }}>Free</p>}
                </div>
                <div className="flex-1">
                  <p className="text-[14px] leading-6 mb-4" style={{ color: "#c4cdd6" }}>{y.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {y.courses.map((c) => (
                      <span key={c} className="text-[12px] px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#a0aba7", border: "1px solid rgba(255,255,255,0.08)" }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[13px] mt-6" style={{ color: "#6b7280" }}>
            Grade formula: Quiz weight (40%) × quiz score + Exam weight (60%) × exam score. Pass mark: 60%. GPA scale: 5.0.
          </p>
        </div>
      </section>

      {/* Departments */}
      <section className="px-5 sm:px-10 py-16 sm:py-20" style={{ backgroundColor: "#18191a" }}>
        <div className="max-w-[1280px] mx-auto">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: "#a7d252" }}>Departments</p>
          <h2 className="text-[26px] sm:text-[34px] font-semibold mb-3" style={{ letterSpacing: "-0.02em" }}>
            8 Departments. One Goal.
          </h2>
          <p className="text-[15px] leading-7 mb-8 max-w-[500px]" style={{ color: "#b1b1b1" }}>
            Choose your department on signup. Each has its own curriculum tailored to the real skills employers need.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DEPARTMENTS.map((d) => (
              <div
                key={d.name}
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ backgroundColor: "#1c1c1c", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span className="text-xl shrink-0">{d.icon}</span>
                <span className="text-[13px] sm:text-[14px] font-medium text-white">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 sm:px-10 py-16 sm:py-20" style={{ backgroundColor: "#101010" }}>
        <div className="max-w-[1280px] mx-auto">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: "#a7d252" }}>Platform</p>
          <h2 className="text-[26px] sm:text-[34px] font-semibold mb-10" style={{ letterSpacing: "-0.02em" }}>
            Built for Serious Learners
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col gap-3 p-6 rounded-xl" style={{ backgroundColor: "#1c1c1c", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="text-3xl">{f.icon}</span>
                <p className="font-semibold text-white text-[15px]">{f.title}</p>
                <p className="text-[13px] leading-5" style={{ color: "#a0aba7" }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-5 sm:px-10 py-16 sm:py-20" style={{ backgroundColor: "#18191a" }}>
        <div className="max-w-[1280px] mx-auto">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: "#a7d252" }}>Pricing</p>
          <h2 className="text-[26px] sm:text-[34px] font-semibold mb-10" style={{ letterSpacing: "-0.02em" }}>
            Simple, Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[720px]">
            {/* Free */}
            <div className="flex flex-col gap-5 p-8 rounded-xl" style={{ backgroundColor: "#1c1c1c", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div>
                <p className="text-[14px] font-semibold text-white/60 mb-1">Free Plan</p>
                <p className="text-[36px] font-bold text-white">₦0</p>
                <p className="text-[13px] mt-1" style={{ color: "#a0aba7" }}>Forever. No credit card needed.</p>
              </div>
              <div className="space-y-2.5">
                {["Year 100–300 (all courses)", "Quizzes & exams", "Real GPA tracking", "Community access", "Progress dashboard"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[14px]" style={{ color: "#c4cdd6" }}>
                    <svg width="14" height="11" viewBox="0 0 14 11" fill="none"><path d="M1 5.5L5 9.5L13 1.5" stroke="#a7d252" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/register" className="w-full flex items-center justify-center font-bold text-[14px] py-3 mt-auto transition-opacity hover:opacity-80" style={{ border: "1px solid #a7d252", color: "#a7d252" }}>
                Get Started Free
              </Link>
            </div>

            {/* Premium */}
            <div className="flex flex-col gap-5 p-8 rounded-xl relative overflow-hidden" style={{ backgroundColor: "#08694a", border: "1px solid rgba(167,210,82,0.3)" }}>
              <div className="absolute top-4 right-4 text-[11px] font-bold px-2.5 py-1" style={{ backgroundColor: "#a7d252", color: "#18191a" }}>
                RECOMMENDED
              </div>
              <div>
                <p className="text-[14px] font-semibold text-white/70 mb-1">Premium Plan</p>
                <p className="text-[36px] font-bold text-white">₦5,000<span className="text-[16px] font-normal text-white/60">/mo</span></p>
                <p className="text-[13px] mt-1 text-white/60">Cancel anytime.</p>
              </div>
              <div className="space-y-2.5">
                {["Everything in Free", "Year 400 (Advanced)", "Capstone project", "Motivv talent placement", "Priority support"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[14px] text-white">
                    <svg width="14" height="11" viewBox="0 0 14 11" fill="none"><path d="M1 5.5L5 9.5L13 1.5" stroke="#a7d252" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/register" className="w-full flex items-center justify-center font-bold text-[14px] py-3 mt-auto hover:opacity-90 transition-opacity" style={{ backgroundColor: "#a7d252", color: "#18191a" }}>
                Start Free, Upgrade Anytime
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 sm:px-10 py-16 sm:py-24" style={{ backgroundColor: "#101010" }}>
        <div className="max-w-[640px] mx-auto text-center">
          <h2 className="text-[28px] sm:text-[40px] font-semibold mb-4" style={{ letterSpacing: "-0.02em" }}>
            Ready to start your product career?
          </h2>
          <p className="text-[15px] leading-7 mb-8" style={{ color: "#b1b1b1" }}>
            Thousands of students across Africa are building their careers with Aorthar. Year 100–300 is completely free. No excuses.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="flex items-center justify-center font-bold text-[15px] px-8 py-3.5 hover:opacity-90 transition-opacity" style={{ backgroundColor: "#a7d252", color: "#18191a" }}>
              Get Started Free →
            </Link>
            <Link href="/login" className="flex items-center justify-center font-semibold text-[15px] px-8 py-3.5 hover:opacity-80 transition-opacity" style={{ border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff" }}>
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 sm:px-10 py-8 border-t text-center text-[13px]" style={{ borderColor: "rgba(255,255,255,0.08)", color: "#6b7280" }}>
        © 2025 Aorthar Academy ·{" "}
        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
        {" · "}
        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
        {" · "}
        <a href="mailto:hello@aorthar.com" className="hover:text-white transition-colors">hello@aorthar.com</a>
      </footer>
    </div>
  );
}
