"use client";

import Link from "next/link";
import { useState } from "react";

const STEPS = [
  { n: "1", label: "Apply" },
  { n: "2", label: "Assessment" },
  { n: "3", label: "Selection" },
  { n: "4", label: "Training" },
  { n: "5", label: "Placement" },
];

const TRACKS = [
  { name: "Product Design", accent: "#a7d252", description: "Figma, user research, wireframing, design systems, and visual design for product teams." },
  { name: "Product Management", accent: "#5fc49a", description: "Discovery, roadmaps, PRDs, sprint management, and leading cross-functional product teams." },
  { name: "QA & Testing", accent: "#7eb8f7", description: "Test planning, bug tracking, manual testing, and quality processes for fast-moving products." },
  { name: "Scrum & Agile", accent: "#f7c97e", description: "Sprint facilitation, backlog grooming, team coordination, and delivery excellence." },
  { name: "Tech Operations", accent: "#c49af0", description: "Product support, ops workflows, tooling, documentation, and cross-team system management." },
];

const REQUIREMENTS = [
  "You have a genuine interest in product development — design, PM, QA, scrum, or ops",
  "You're a student, new graduate, career changer, or entry-level professional",
  "You're available to commit 3 months (remote, part-time possible)",
  "No prior tech experience required — we train from zero",
  "You can take direction, give feedback, and collaborate under pressure",
  "You're 18 years or older",
];

function IconBuilding() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a7d252" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="14" rx="1" />
      <path d="M8 21v-5h8v5" />
      <rect x="8" y="10" width="2.5" height="2.5" />
      <rect x="13.5" y="10" width="2.5" height="2.5" />
      <path d="M8 7V5l4-2 4 2v2" />
    </svg>
  );
}
function IconLayers() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a7d252" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 12l10 5 10-5" />
      <path d="M2 17l10 5 10-5" />
    </svg>
  );
}
function IconNodes() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a7d252" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2" />
      <circle cx="4" cy="18" r="2" />
      <circle cx="20" cy="18" r="2" />
      <path d="M12 6L4 16M12 6l8 10M6 18h12" />
    </svg>
  );
}
function IconBadge() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a7d252" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="14" r="5" />
      <path d="M7.5 9.5L5 4h14l-2.5 5.5" />
      <path d="M10 14l1.5 1.5L14 12" />
    </svg>
  );
}

const OUTCOMES = [
  { Icon: IconBuilding, title: "Real Startup Placement", body: "Top performers are placed with actual startups for hands-on product work." },
  { Icon: IconLayers, title: "Portfolio-Ready Work", body: "You'll work on live projects you can show to any employer." },
  { Icon: IconNodes, title: "Network & Community", body: "Join a growing community of Aorthar alumni working across top companies." },
  { Icon: IconBadge, title: "Certificate of Completion", body: "Receive an Aorthar certificate recognising your training and achievement." },
];

type Step = 1 | 2 | 3;

export default function InternshipPage() {
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", portfolio: "", track: "", why: "", status: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  }

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
        <a
          href="https://chat.whatsapp.com/BaZqynmCDKrEkiY0OED51K"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm hidden sm:block hover:opacity-80 transition-opacity"
          style={{ color: "#a7d252" }}
        >
          Join Community
        </a>
      </header>

      {/* Hero */}
      <section className="px-5 sm:px-10 pt-16 sm:pt-24 pb-16" style={{ backgroundColor: "#101010" }}>
        <div className="max-w-[1280px] mx-auto">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: "#a7d252" }}>
            Free Program · Quarterly Cohort
          </p>
          <h1
            className="text-[38px] sm:text-[58px] font-semibold leading-[1.1] mb-6 max-w-[720px]"
            style={{ letterSpacing: "-0.02em" }}
          >
            Africa&apos;s Most Competitive
            <br />
            <span style={{ color: "#a7d252" }}>Product Internship.</span>
          </h1>
          <p className="text-[16px] sm:text-[18px] leading-7 max-w-[580px] mb-10" style={{ color: "#b1b1b1" }}>
            Apply twice a year. The top 10–20 applicants are trained on real projects by Aorthar and placed inside early-stage startups. No prior experience required. Zero cost.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 sm:gap-12 mb-12">
            {[
              { n: "2×", label: "Per year" },
              { n: "3 months", label: "Duration" },
              { n: "10–20", label: "Selected per cohort" },
              { n: "₦0", label: "Cost to apply" },
            ].map(({ n, label }) => (
              <div key={label} className="text-center sm:text-left">
                <p className="text-[26px] sm:text-[30px] font-bold text-white">{n}</p>
                <p className="text-[13px] mt-0.5" style={{ color: "#a0aba7" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setStep(3)}
              className="flex items-center justify-center font-bold text-[14px] sm:text-[15px] px-6 py-3 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#08694a", color: "#ffffff" }}
            >
              Apply Now — It&apos;s Free →
            </button>
            <button
              onClick={() => { const el = document.getElementById("how"); el?.scrollIntoView({ behavior: "smooth" }); }}
              className="flex items-center justify-center font-semibold text-[14px] px-6 py-3 transition-opacity hover:opacity-80"
              style={{ border: "1px solid rgba(255,255,255,0.25)", color: "#ffffff" }}
            >
              How it works
            </button>
          </div>
        </div>
      </section>

      {/* Process timeline */}
      <section id="how" className="px-5 sm:px-10 py-16 sm:py-20" style={{ backgroundColor: "#18191a" }}>
        <div className="max-w-[1280px] mx-auto">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: "#a7d252" }}>Process</p>
          <h2 className="text-[26px] sm:text-[34px] font-semibold mb-10" style={{ letterSpacing: "-0.02em" }}>
            How the Internship Works
          </h2>
          <div className="flex flex-col sm:flex-row gap-0">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="flex-1 flex sm:flex-col gap-4 sm:gap-3 p-5 sm:p-6"
                style={{ borderLeft: i === 0 ? "2px solid #a7d252" : "1px solid rgba(255,255,255,0.08)" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
                  style={{ backgroundColor: "rgba(167,210,82,0.15)", color: "#a7d252" }}
                >
                  {s.n}
                </div>
                <div>
                  <p className="font-semibold text-white text-[15px]">{s.label}</p>
                  <p className="text-[13px] mt-1 leading-5" style={{ color: "#a0aba7" }}>
                    {[
                      "Fill out the short application form. No CV required — just tell us who you are.",
                      "Complete a short skills quiz to help us place you in the right track.",
                      "Top applicants are chosen. Everyone gets notified within 5 business days.",
                      "3 months of real project work, mentorship, and structured learning.",
                      "Top performers are matched with partner startups for placement roles.",
                    ][i]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who can apply */}
      <section className="px-5 sm:px-10 py-16 sm:py-20" style={{ backgroundColor: "#101010" }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            <div className="flex-1">
              <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: "#a7d252" }}>Eligibility</p>
              <h2 className="text-[26px] sm:text-[34px] font-semibold mb-6" style={{ letterSpacing: "-0.02em" }}>
                Who Can Apply?
              </h2>
              <p className="text-[15px] leading-7 mb-8" style={{ color: "#b1b1b1" }}>
                We especially welcome applications from underrepresented communities in tech. If you&apos;re hungry to learn and ready to commit, we want to hear from you.
              </p>
              <div className="space-y-3">
                {REQUIREMENTS.map((r) => (
                  <div key={r} className="flex items-start gap-3">
                    <div
                      className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "rgba(167,210,82,0.15)" }}
                    >
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#a7d252" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-[14px] sm:text-[15px] leading-6" style={{ color: "#c4cdd6" }}>{r}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracks */}
            <div className="flex-1">
              <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: "#a7d252" }}>Tracks</p>
              <h2 className="text-[26px] sm:text-[34px] font-semibold mb-6" style={{ letterSpacing: "-0.02em" }}>
                Choose Your Path
              </h2>
              <div className="space-y-3">
                {TRACKS.map((t) => (
                  <div
                    key={t.name}
                    className="flex items-start gap-4 p-4 rounded-xl"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <div className="w-2 h-full min-h-[40px] rounded-full shrink-0" style={{ backgroundColor: t.accent, opacity: 0.7 }} />
                    <div>
                      <p className="font-semibold text-white text-[15px]">{t.name}</p>
                      <p className="text-[13px] leading-5 mt-0.5" style={{ color: "#a0aba7" }}>{t.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="px-5 sm:px-10 py-16 sm:py-20" style={{ backgroundColor: "#18191a" }}>
        <div className="max-w-[1280px] mx-auto">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: "#a7d252" }}>What You Get</p>
          <h2 className="text-[26px] sm:text-[34px] font-semibold mb-10" style={{ letterSpacing: "-0.02em" }}>
            More Than Just a Certificate
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {OUTCOMES.map((o) => (
              <div
                key={o.title}
                className="flex flex-col gap-3 p-6 rounded-xl"
                style={{ backgroundColor: "#1c1c1c", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(167,210,82,0.1)" }}>
                  <o.Icon />
                </div>
                <p className="font-semibold text-white text-[15px]">{o.title}</p>
                <p className="text-[13px] leading-5" style={{ color: "#a0aba7" }}>{o.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="px-5 sm:px-10 py-16 sm:py-20" style={{ backgroundColor: "#101010" }}>
        <div className="max-w-[640px] mx-auto">

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {([1, 2, 3] as Step[]).map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold cursor-pointer"
                  style={
                    step === s
                      ? { backgroundColor: "#a7d252", color: "#18191a" }
                      : step > s
                      ? { backgroundColor: "#08694a", color: "#ffffff" }
                      : { backgroundColor: "rgba(255,255,255,0.1)", color: "#a0aba7" }
                  }
                  onClick={() => { if (s < step || step > s) setStep(s); }}
                >
                  {step > s ? "✓" : s}
                </div>
                <span className="text-[12px] hidden sm:block" style={{ color: step === s ? "#ffffff" : "#a0aba7" }}>
                  {["Overview", "Who Can Apply", "Apply"][s - 1]}
                </span>
                {s < 3 && <div className="w-6 h-px" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />}
              </div>
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: "#a7d252" }}>Applications Open</p>
                <h2 className="text-[28px] sm:text-[36px] font-semibold mb-3" style={{ letterSpacing: "-0.02em" }}>
                  Ready to apply?
                </h2>
                <p className="text-[15px] leading-7" style={{ color: "#b1b1b1" }}>
                  The application takes about 5 minutes. We review all applications and select the top 10–20 candidates for the next cohort. Everyone receives a decision within 5 business days.
                </p>
              </div>
              <div
                className="p-5 rounded-xl text-[14px] leading-6"
                style={{ backgroundColor: "rgba(167,210,82,0.07)", border: "1px solid rgba(167,210,82,0.2)", color: "#c4cdd6" }}
              >
                <strong className="text-white">Next cohort:</strong> Applications for Q2 2025 are now open. Limited slots available.
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full sm:w-auto flex items-center justify-center font-bold text-[15px] px-8 py-3 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#08694a", color: "#ffffff" }}
              >
                Check If You Qualify →
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: "#a7d252" }}>Eligibility</p>
                <h2 className="text-[28px] sm:text-[36px] font-semibold mb-3" style={{ letterSpacing: "-0.02em" }}>
                  Who Can Apply?
                </h2>
                <p className="text-[15px] leading-7 mb-6" style={{ color: "#b1b1b1" }}>
                  If you tick most of these, you&apos;re a good fit. Don&apos;t let imposter syndrome stop you.
                </p>
              </div>
              <div className="space-y-3">
                {REQUIREMENTS.map((r) => (
                  <div key={r} className="flex items-start gap-3">
                    <div
                      className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "rgba(167,210,82,0.15)" }}
                    >
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#a7d252" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-[14px] leading-6" style={{ color: "#c4cdd6" }}>{r}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="px-5 py-2.5 text-[14px] font-medium hover:opacity-80 transition-opacity" style={{ border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff" }}>
                  ← Back
                </button>
                <button onClick={() => setStep(3)} className="flex-1 sm:flex-none px-8 py-2.5 font-bold text-[14px] hover:opacity-90 transition-opacity" style={{ backgroundColor: "#a7d252", color: "#18191a" }}>
                  I&apos;m in — Apply Now →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Form */}
          {step === 3 && !submitted && (
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: "#a7d252" }}>Application</p>
              <h2 className="text-[28px] sm:text-[36px] font-semibold mb-6" style={{ letterSpacing: "-0.02em" }}>
                Apply for the Internship
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-white">Full name *</label>
                    <input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" className="w-full px-4 py-3 text-[14px] text-white placeholder-white/30 outline-none focus:border-[#a7d252] transition-colors" style={{ backgroundColor: "#1c1c1c", border: "1px solid rgba(255,255,255,0.12)" }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-white">Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@email.com" className="w-full px-4 py-3 text-[14px] text-white placeholder-white/30 outline-none focus:border-[#a7d252] transition-colors" style={{ backgroundColor: "#1c1c1c", border: "1px solid rgba(255,255,255,0.12)" }} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-white">Phone number</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="+234..." className="w-full px-4 py-3 text-[14px] text-white placeholder-white/30 outline-none focus:border-[#a7d252] transition-colors" style={{ backgroundColor: "#1c1c1c", border: "1px solid rgba(255,255,255,0.12)" }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-white">LinkedIn or portfolio URL</label>
                    <input name="portfolio" value={form.portfolio} onChange={handleChange} placeholder="linkedin.com/in/..." className="w-full px-4 py-3 text-[14px] text-white placeholder-white/30 outline-none focus:border-[#a7d252] transition-colors" style={{ backgroundColor: "#1c1c1c", border: "1px solid rgba(255,255,255,0.12)" }} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-white">Which track? *</label>
                    <select name="track" value={form.track} onChange={handleChange} required className="w-full px-4 py-3 text-[14px] text-white outline-none focus:border-[#a7d252] transition-colors" style={{ backgroundColor: "#1c1c1c", border: "1px solid rgba(255,255,255,0.12)" }}>
                      <option value="" disabled>Select track...</option>
                      {TRACKS.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-white">Current status *</label>
                    <select name="status" value={form.status} onChange={handleChange} required className="w-full px-4 py-3 text-[14px] text-white outline-none focus:border-[#a7d252] transition-colors" style={{ backgroundColor: "#1c1c1c", border: "1px solid rgba(255,255,255,0.12)" }}>
                      <option value="" disabled>Select...</option>
                      {["Student", "New Graduate", "Career Changer", "Currently Employed", "Other"].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-white">Why do you want to join Aorthar? *</label>
                  <textarea name="why" value={form.why} onChange={handleChange} required rows={4} placeholder="Tell us what drives you and what you hope to achieve..." className="w-full px-4 py-3 text-[14px] text-white placeholder-white/30 outline-none focus:border-[#a7d252] transition-colors resize-none" style={{ backgroundColor: "#1c1c1c", border: "1px solid rgba(255,255,255,0.12)" }} />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="px-5 py-3 text-[14px] font-medium hover:opacity-80 transition-opacity" style={{ border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff" }}>
                    ← Back
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 py-3 font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-60" style={{ backgroundColor: "#08694a", color: "#ffffff" }}>
                    {loading ? "Submitting…" : "Submit Application →"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Success */}
          {step === 3 && submitted && (
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: "rgba(167,210,82,0.15)" }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M6 16l7 7 13-13" stroke="#a7d252" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-[28px] font-semibold text-white">Application Received!</h2>
              <p className="text-[15px] leading-7" style={{ color: "#b1b1b1" }}>
                We&apos;ll review your application and reach out within 5 business days. While you wait, join our community — it&apos;s where the real learning happens.
              </p>
              <a
                href="https://chat.whatsapp.com/BaZqynmCDKrEkiY0OED51K"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-bold text-[14px] px-6 py-3 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#25D366", color: "#ffffff" }}
              >
                Join the WhatsApp Community →
              </a>
              <p className="text-[13px]" style={{ color: "#6b7280" }}>
                <Link href="/" className="underline hover:text-white transition-colors">Back to home</Link>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 sm:px-10 py-8 border-t text-center text-[13px]" style={{ borderColor: "rgba(255,255,255,0.08)", color: "#6b7280" }}>
        © 2025 Aorthar Academy ·{" "}
        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
        {" · "}
        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
      </footer>
    </div>
  );
}
