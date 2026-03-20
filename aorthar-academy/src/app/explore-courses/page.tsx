"use client";

import Link from "next/link";
import { useState } from "react";

const TRACKS = ["All", "Product Design", "Product Management", "QA & Testing", "Scrum & Ops", "Tech Operations"] as const;

type Track = (typeof TRACKS)[number];

type Course = {
  title: string;
  track: Exclude<Track, "All">;
  level: string;
  price: string;
  duration: string;
  students: string;
  rating: string;
  description: string;
  gradient: string;
};

const COURSES: Course[] = [
  {
    title: "Figma for Product Designers",
    track: "Product Design",
    level: "Beginner",
    price: "₦15,000",
    duration: "6 hrs",
    students: "234",
    rating: "4.8",
    description: "Master Figma from scratch — components, auto-layout, variables, prototyping, and developer handoff on real product screens.",
    gradient: "linear-gradient(135deg, #1a3a2a 0%, #0d2419 100%)",
  },
  {
    title: "Product Management Fundamentals",
    track: "Product Management",
    level: "Beginner",
    price: "₦18,000",
    duration: "8 hrs",
    students: "189",
    rating: "4.9",
    description: "User research, roadmapping, writing PRDs, working with engineers, and stakeholder communication from day one as a PM.",
    gradient: "linear-gradient(135deg, #1a2a3a 0%, #0d1524 100%)",
  },
  {
    title: "UI/UX Design Principles",
    track: "Product Design",
    level: "Beginner",
    price: "₦12,000",
    duration: "5 hrs",
    students: "312",
    rating: "4.7",
    description: "Design thinking, wireframing, user flows, visual hierarchy, accessibility, and the principles behind great product interfaces.",
    gradient: "linear-gradient(135deg, #2a1a3a 0%, #190d24 100%)",
  },
  {
    title: "QA Testing Essentials",
    track: "QA & Testing",
    level: "Beginner",
    price: "₦14,000",
    duration: "7 hrs",
    students: "145",
    rating: "4.6",
    description: "Test case writing, bug reporting, manual testing workflows, and an introduction to automated testing for product teams.",
    gradient: "linear-gradient(135deg, #3a2a1a 0%, #24190d 100%)",
  },
  {
    title: "Scrum & Agile for Teams",
    track: "Scrum & Ops",
    level: "Intermediate",
    price: "₦16,000",
    duration: "6 hrs",
    students: "98",
    rating: "4.8",
    description: "Sprint planning, backlog refinement, retrospectives, Jira workflows, and how to operate effectively inside an agile product team.",
    gradient: "linear-gradient(135deg, #1a3a1a 0%, #0d240d 100%)",
  },
  {
    title: "Advanced Product Design Systems",
    track: "Product Design",
    level: "Advanced",
    price: "₦25,000",
    duration: "12 hrs",
    students: "76",
    rating: "4.9",
    description: "Design systems architecture, complex component libraries, motion design, dark/light theming, and design leadership at scale.",
    gradient: "linear-gradient(135deg, #3a1a2a 0%, #240d19 100%)",
  },
  {
    title: "Tech Operations & Product Support",
    track: "Tech Operations",
    level: "Beginner",
    price: "₦13,000",
    duration: "5 hrs",
    students: "167",
    rating: "4.7",
    description: "The unsung hero of product teams — learn ops workflows, escalation management, tooling, documentation, and cross-team coordination.",
    gradient: "linear-gradient(135deg, #2a3a1a 0%, #19240d 100%)",
  },
  {
    title: "Product Discovery & Strategy",
    track: "Product Management",
    level: "Intermediate",
    price: "₦20,000",
    duration: "9 hrs",
    students: "112",
    rating: "4.8",
    description: "Jobs-to-be-done, opportunity trees, continuous discovery, A/B testing, and how to build a product strategy that actually works.",
    gradient: "linear-gradient(135deg, #1a2a3a 0%, #0d1930 100%)",
  },
];

function StarRating({ rating }: { rating: string }) {
  const full = Math.floor(parseFloat(rating));
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill={i < full ? "#a7d252" : "none"} stroke="#a7d252" strokeWidth="1">
          <path d="M6 1l1.39 2.82L10.5 4.27l-2.25 2.19.53 3.1L6 8.02 3.22 9.56l.53-3.1L1.5 4.27l3.11-.45L6 1z" />
        </svg>
      ))}
    </div>
  );
}

export default function ExploreCoursesPage() {
  const [active, setActive] = useState<Track>("All");

  const filtered = active === "All" ? COURSES : COURSES.filter((c) => c.track === active);

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
        <div className="flex items-center gap-4">
          <Link href="/university" className="text-sm hidden sm:block" style={{ color: "#a7d252" }}>
            Enroll via University →
          </Link>
          <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">
            Log in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-5 sm:px-10 py-16 sm:py-20" style={{ backgroundColor: "#101010" }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="max-w-[640px]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: "#a7d252" }}>Courses</p>
            <h1
              className="text-[36px] sm:text-[52px] font-semibold leading-[1.1] mb-5"
              style={{ letterSpacing: "-0.02em" }}
            >
              Master Product Development.
              <br />
              <span style={{ color: "#a7d252" }}>One Course at a Time.</span>
            </h1>
            <p className="text-[15px] sm:text-[17px] leading-7 mb-8" style={{ color: "#b1b1b1" }}>
              Self-paced, practical courses across every product discipline — Design, PM, QA, Scrum & Ops. Learn on your schedule, apply on day one.
            </p>
            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              {[
                { n: "8", label: "Courses" },
                { n: "1,300+", label: "Students enrolled" },
                { n: "Lifetime", label: "Access" },
                { n: "₦0", label: "Free on University" },
              ].map(({ n, label }) => (
                <div key={label}>
                  <p className="text-[22px] font-bold text-white">{n}</p>
                  <p className="text-[13px]" style={{ color: "#a0aba7" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="px-5 sm:px-10 py-12 sm:py-16">
        <div className="max-w-[1280px] mx-auto">

          {/* Notice */}
          <div
            className="mb-8 flex items-start gap-3 p-4 rounded-lg text-[13px] sm:text-[14px]"
            style={{ backgroundColor: "rgba(167,210,82,0.08)", border: "1px solid rgba(167,210,82,0.2)", color: "#c4cdd6" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" style={{ color: "#a7d252" }}>
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M8 7v4M8 5.5v.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span>
              All courses are included free with an{" "}
              <Link href="/university" className="underline font-medium" style={{ color: "#a7d252" }}>
                Aorthar University account
              </Link>
              . Purchase individually below, or{" "}
              <Link href="/register" className="underline" style={{ color: "#a7d252" }}>
                sign up free
              </Link>{" "}
              to start learning today.
            </span>
          </div>

          {/* Track filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {TRACKS.map((t) => (
              <button
                key={t}
                onClick={() => setActive(t)}
                className="px-4 py-1.5 text-[13px] sm:text-[14px] font-medium rounded-full transition-colors"
                style={
                  active === t
                    ? { backgroundColor: "#a7d252", color: "#18191a" }
                    : { backgroundColor: "rgba(255,255,255,0.06)", color: "#c4cdd6", border: "1px solid rgba(255,255,255,0.12)" }
                }
              >
                {t}
              </button>
            ))}
          </div>

          {/* Course grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((course) => (
              <article
                key={course.title}
                className="flex flex-col rounded-xl overflow-hidden transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: "#1c1c1c", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {/* Thumbnail */}
                <div
                  className="h-[140px] flex items-end p-4"
                  style={{ background: course.gradient }}
                >
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#a7d252", border: "1px solid rgba(167,210,82,0.3)" }}
                  >
                    {course.track}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 gap-3 p-4">
                  <h2 className="text-[15px] font-semibold text-white leading-snug">{course.title}</h2>
                  <p className="text-[13px] leading-5 flex-1" style={{ color: "#a0aba7" }}>{course.description}</p>

                  <div className="flex items-center gap-2">
                    <StarRating rating={course.rating} />
                    <span className="text-[12px] font-semibold" style={{ color: "#a7d252" }}>{course.rating}</span>
                    <span className="text-[12px]" style={{ color: "#6b7280" }}>({course.students})</span>
                  </div>

                  <div className="flex items-center gap-2 text-[12px]" style={{ color: "#6b7280" }}>
                    <span>{course.duration}</span>
                    <span>·</span>
                    <span
                      className="px-2 py-0.5 rounded-sm text-[11px] font-medium"
                      style={{
                        backgroundColor:
                          course.level === "Beginner" ? "rgba(167,210,82,0.1)" :
                          course.level === "Intermediate" ? "rgba(8,105,74,0.2)" :
                          "rgba(167,82,210,0.15)",
                        color:
                          course.level === "Beginner" ? "#a7d252" :
                          course.level === "Intermediate" ? "#5fc49a" :
                          "#c4a7d2",
                      }}
                    >
                      {course.level}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="text-[16px] font-bold text-white">{course.price}</span>
                    <Link
                      href="/register"
                      className="text-[12px] font-semibold px-3 py-1.5 rounded transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#08694a", color: "#ffffff" }}
                    >
                      Enroll
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Bottom CTA */}
          <div
            className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-2xl"
            style={{ backgroundColor: "#1c1c1c", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div>
              <p className="text-[18px] sm:text-[20px] font-semibold text-white mb-1">Get all 8 courses free.</p>
              <p className="text-[14px]" style={{ color: "#a0aba7" }}>
                Enroll in Aorthar University and access every course, quiz, GPA tracking, and more — Years 100 to 300 at no cost.
              </p>
            </div>
            <Link
              href="/university"
              className="flex items-center justify-center font-bold text-[14px] px-6 py-3 whitespace-nowrap hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#a7d252", color: "#18191a" }}
            >
              Explore University →
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
      </footer>
    </div>
  );
}
