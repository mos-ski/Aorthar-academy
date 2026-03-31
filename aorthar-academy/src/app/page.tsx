import React from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

const imgWreathLeft = "/Wreath left.svg";
const imgWreathRight = "/Vector.svg";
const imgStars = "/Stars.svg";

const imgAortharIcon = "/Aorthar Logo long complete.svg";
const imgHireTalent = "/Banner.png";
const imgDeeXoptions = "/Frame 1.svg";
const imgNazza = "/Nazza main 1 3.svg";
const imgCeller = "/Combination mark.svg";
const imgDigitalAbundance = "/Frame 3.svg";
const imgSyarpa = "/Frame 2.svg";
const imgAortharFooterIcon = "/Aorthar Logo long complete.svg";


function RatingsBadge() {
  return (
    <div className="flex items-center gap-0">
      {/* Wreath left — 36×81 natural size */}
      <img alt="" className="shrink-0 h-[81px] w-[36px] object-contain" src={imgWreathLeft} />
      {/* Center content */}
      <div className="flex flex-col items-center gap-1 px-2">
        {/* Stars — single 88×16 image */}
        <img alt="5 stars" className="h-4 w-auto" src={imgStars} />
        {/* Labels */}
        <p className="text-[12px] leading-5 font-medium whitespace-nowrap" style={{ color: "#ebefe0" }}>
          Best Entry School
        </p>
        <p className="text-[11px] leading-[18px] font-medium whitespace-nowrap" style={{ color: "#a7d252" }}>
          2,000+ reviews
        </p>
      </div>
      {/* Wreath right — 35×80 natural size */}
      <img alt="" className="shrink-0 h-[80px] w-[35px] object-contain" src={imgWreathRight} />
    </div>
  );
}

type FeatureCardProps = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  external?: boolean;
  borderLeft?: boolean;
  borderTop?: boolean;
};

function FeatureCard({ title, description, ctaLabel, ctaHref, external, borderLeft, borderTop }: FeatureCardProps) {
  const border: React.CSSProperties = {
    borderTop: borderTop ? "1px solid rgba(255,255,255,0.12)" : undefined,
    borderLeft: borderLeft ? "1px solid rgba(255,255,255,0.12)" : undefined,
  };
  const btnCls = "inline-flex items-center gap-2 text-[14px] sm:text-[15px] font-semibold px-4 py-2.5 w-fit transition-colors hover:bg-[#a7d252]/10";
  const btnStyle: React.CSSProperties = { border: "1px solid #a7d252", color: "#a7d252" };
  return (
    <div className="flex flex-col gap-6 p-8 sm:p-10 w-full sm:w-[calc(50%-0.5px)]" style={border} data-reveal="left">
      <div className="flex flex-col gap-3">
        <p className="text-[18px] sm:text-[20px] leading-7 text-white font-semibold">{title}</p>
        <p className="text-[15px] sm:text-[16px] leading-6" style={{ color: "#b1b1b1" }}>{description}</p>
      </div>
      {external ? (
        <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={btnCls} style={btnStyle}>
          {ctaLabel} →
        </a>
      ) : (
        <Link href={ctaHref} className={btnCls} style={btnStyle}>
          {ctaLabel} →
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#18191a", color: "#ffffff" }}>
      <ScrollReveal />

      {/* ── Navbar ── */}
      <header style={{ backgroundColor: "#18191a" }} data-reveal="zoom">
        {/* Top row: logo + right links */}
        <div
          className="flex items-center justify-between px-4 sm:px-8 py-3 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src={imgAortharIcon} alt="Aorthar" className="h-9 sm:h-11 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/about" className="text-base font-medium text-white/70 hover:text-[#a7d252] transition-colors hidden sm:block">
              About us
            </Link>
            <a
              href="https://www.motivv.co/post-job"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-medium hover:text-[#c8f060] transition-colors whitespace-nowrap"
              style={{ color: "#a7d252" }}
            >
              Hire from us
            </a>
          </div>
        </div>

        {/* Bottom row: scrollable nav links */}
        <div
          className="flex items-center gap-5 sm:gap-6 px-4 sm:px-8 h-9 sm:h-10 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {[
            { label: "Home", href: "/" },
            { label: "Join Us", href: "#join" },
            { label: "University", href: "https://university.aorthar.com" },
            { label: "Courses", href: "https://courses.aorthar.com" },
            { label: "X", href: "https://x.com/aorthar" },
            { label: "Instagram", href: "https://instagram.com/aortharhq" },
            { label: "YouTube", href: "https://youtube.com/@aorthar" },
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
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24 lg:py-[158px] overflow-hidden">
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(24,25,26,0) 34%, #18191a 95%)" }}
        />

        {/* Content */}
        <div className="relative flex flex-col items-center gap-5 sm:gap-[25px] w-full max-w-[693px]">
          {/* Badge */}
          <div
            className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-[10px] rounded-[131px]"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            data-reveal="zoom"
          >
            <span
              className="text-[13px] sm:text-[16px] leading-[1.4] font-bold text-white whitespace-nowrap"
              style={{ letterSpacing: "-0.02em" }}
            >
              Early Career &amp; Entry Roles
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: '"Impact", "Impact Placeholder", sans-serif',
              fontWeight: 400,
              fontSize: "clamp(38px, 9vw, 85px)",
              lineHeight: "84.2%",
              letterSpacing: "-0.045em",
              textTransform: "uppercase",
              textAlign: "center",
              color: "#ffffff",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              width: "100%",
            }}
            data-reveal
          >
            <span className="block">THE #1 PRODUCT INTERNSHIP</span>
            <span className="block">PROGRAM IN AFRICA</span>
          </h1>

          {/* CTA Button */}
          <Link
            href="/internship"
            className="landing-pulse flex items-center justify-center text-white font-bold text-[14px] sm:text-[15px] hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#08694a", padding: "10px", width: "min(273px, 100%)" }}
            data-reveal="zoom"
          >
            Apply for the Internship →
          </Link>

          {/* Ratings badge */}
          <div data-reveal="zoom">
            <RatingsBadge />
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section className="py-8 sm:py-10 px-4 sm:px-6 overflow-hidden" style={{ backgroundColor: "#101010" }} data-reveal>
        <p className="text-center text-xs sm:text-sm mb-6 sm:mb-8" style={{ color: "#888" }}>
          Start-Ups trust us to get best talent prospects
        </p>
        {/* Mobile: auto-scrolling marquee. Desktop: static row */}
        <div className="sm:hidden relative">
          <style>{`
            @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
            .aorthar-marquee { animation: marquee 18s linear infinite; }
            .aorthar-marquee:hover { animation-play-state: paused; }
          `}</style>
          <div className="flex overflow-hidden">
            <div className="aorthar-marquee flex items-center gap-10 whitespace-nowrap">
              {[
                { src: imgDeeXoptions, alt: "DeeXoptions" },
                { src: imgNazza, alt: "nazza" },
                { src: imgSyarpa, alt: "syarpa" },
                { src: imgCeller, alt: "celler" },
                { src: imgDigitalAbundance, alt: "Digital Abundance" },
                { src: imgDeeXoptions, alt: "DeeXoptions" },
                { src: imgNazza, alt: "nazza" },
                { src: imgSyarpa, alt: "syarpa" },
                { src: imgCeller, alt: "celler" },
                { src: imgDigitalAbundance, alt: "Digital Abundance" },
              ].map(({ src, alt }, i) => (
                <img key={i} src={src} alt={alt} className="h-7 w-auto object-contain shrink-0 opacity-80" />
              ))}
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-8 flex-wrap justify-center max-w-5xl mx-auto">
          <img src={imgDeeXoptions} alt="DeeXoptions" className="h-8 w-auto object-contain shrink-0 opacity-80" />
          <img src={imgNazza} alt="nazza" className="h-8 w-auto object-contain shrink-0 opacity-80" />
          <img src={imgSyarpa} alt="syarpa" className="h-8 w-auto object-contain shrink-0 opacity-80" />
          <img src={imgCeller} alt="celler" className="h-8 w-auto object-contain shrink-0 opacity-80" />
          <img src={imgDigitalAbundance} alt="Digital Abundance" className="h-10 w-auto object-contain shrink-0 opacity-80" />
        </div>
      </section>

      {/* ── Join Us ── */}
      <section id="join" className="flex flex-col items-center justify-center text-center gap-6 px-4 sm:px-8 py-16 sm:py-28">

        {/* "JOIN US" sticker heading */}
        <div className="landing-float relative shrink-0 select-none" style={{ height: "96px", width: "178px" }} data-reveal="zoom">
          {/* Rotated Impact text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <p
              style={{
                fontFamily: '"Impact", "Impact Placeholder", sans-serif',
                fontWeight: 400,
                fontSize: "64px",
                lineHeight: "84.2%",
                letterSpacing: "-2.88px",
                textTransform: "uppercase",
                color: "#a7d252",
                WebkitTextStroke: "4px #1c3d1b",
                paintOrder: "stroke fill",
                transform: "rotate(8.5deg)",
                whiteSpace: "nowrap",
              }}
            >
              Join Us
            </p>
          </div>
          {/* Heart icon — local SVG */}
          <div className="absolute" style={{ width: "75px", height: "75px", left: "38px", top: "30px", pointerEvents: "none" }}>
            <img alt="" src="/icon-park_like.svg" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Body text */}
        <div
          className="w-full max-w-[570px] text-center text-[16px] sm:text-[18px] leading-[1.5] sm:leading-[1.4] text-white"
          style={{ letterSpacing: "-0.02em" }}
          data-reveal
        >
          <p className="mb-7 sm:mb-9">
            ...by becoming a part of Aorthar, you&apos;ll gain the freedom to learn how to design, manage, and build products—at your own pace, on your own terms. Whether you&apos;re just starting or looking to advance, our structured programs and supportive community will guide you every step of the way.
          </p>
          <p>
            <span className="font-bold">💡 Learn, Grow &amp; Build Your Career in Product</span>
            <br />
            Our online learning community is filled with expert educators, industry professionals, and alumni. Together, we learn, create, and share free resources, job opportunities, and insider knowledge to help you break into and thrive in tech.
          </p>
        </div>

        {/* CTA */}
        <a
          href="https://chat.whatsapp.com/BaZqynmCDKrEkiY0OED51K"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center text-white font-bold text-[14px] sm:text-[15px] hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#08694a", padding: "10px", width: "min(260px, 100%)" }}
          data-reveal="zoom"
        >
          Join the Community — It&apos;s Free
        </a>
      </section>

      {/* ── Features ── */}
      <section className="py-16 sm:py-24 w-full">
        <div className="w-full max-w-[1280px] mx-auto px-8">

          {/* Heading */}
          <div className="flex flex-col gap-3 max-w-[768px] mb-12 sm:mb-16" data-reveal>
            <p className="text-[16px] font-medium leading-6" style={{ color: "#a7d252" }}>
              Features
            </p>
            <h2
              className="text-[28px] sm:text-[36px] text-white leading-[36px] sm:leading-[44px] font-medium"
              style={{ letterSpacing: "-0.02em" }}
            >
              Start &amp; Grow Your Career in Product Development
            </h2>
          </div>

          {/* Feature grid — 2×2 */}
          <div className="flex flex-wrap" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
            <FeatureCard
              title="Courses (Learn at Your Own Pace)"
              description="Pre-recorded courses in Product Design, Management, QA, Scrum & Ops. Learn on your schedule with structured lessons and real-world exercises."
              ctaLabel="Browse Courses"
              ctaHref="https://courses.aorthar.com"
              borderTop={false}
            />
            <FeatureCard
              title="Internship & Talent Hunt"
              description="A quarterly cohort where we train the top 10–20 applicants on real projects and place them in early-stage startups. Free. Applications open twice a year."
              ctaLabel="Join Waitlist"
              ctaHref="/internship"
              borderLeft
              borderTop={false}
            />
            <FeatureCard
              title="University (Premium Program)"
              description="A structured 4-year product development curriculum with GPA tracking, quizzes, exams, and a capstone project. Year 400 is premium."
              ctaLabel="Explore University"
              ctaHref="https://university.aorthar.com"
              borderTop
            />
            <FeatureCard
              title="Motivv — Let Recruiters Find You"
              description="Submit your CV/portfolio, get AI-vetted by our team, and let top companies discover you. We recommend only the best version of you."
              ctaLabel="Create a Profile"
              ctaHref="https://www.motivv.co"
              external
              borderLeft
              borderTop
            />
          </div>

        </div>
      </section>

      {/* ── Hire Talent ── */}
      <section id="hire" className="flex flex-col lg:flex-row" style={{ backgroundColor: "#fcea2b" }}>
        {/* Left — yellow */}
        <div className="flex-1 flex items-start lg:items-center justify-end py-12 sm:py-16 lg:py-24 px-5 sm:px-8 lg:pr-8" data-reveal="left">
          <div className="flex flex-col gap-8 sm:gap-12 items-start w-full max-w-[608px]">
            {/* Heading + check items */}
            <div className="flex flex-col gap-6 sm:gap-8 w-full">
              <h2
                className="text-[28px] sm:text-[36px] lg:text-[48px] leading-[1.2] sm:leading-[1.25] lg:leading-[60px] font-medium"
                style={{ color: "#101828", letterSpacing: "-0.02em" }}
              >
                Hire Your Next Product Talent with Aorthar
              </h2>

              <div className="flex flex-col gap-4 sm:gap-5 pl-3 sm:pl-4">
                {[
                  {
                    bold: "Pre-Vetted Talent: ",
                    text: "Our interns and graduates go through intensive training in Product Management, Product Design, QA, Operations, and Scrum, ensuring they have real-world skills before placement.",
                  },
                  {
                    bold: "Work-Ready from Day One:",
                    text: " Our training is hands-on, meaning they've worked on real projects, understand product teams, and are ready to deliver.",
                  },
                  {
                    bold: "Cost-Effective Talent Pipeline:",
                    text: " Skip the long and expensive hiring process. Get pre-screened and trained talent directly, reducing recruitment costs.",
                  },
                ].map(({ bold, text }) => (
                  <div key={bold} className="flex gap-3 items-start">
                    <div
                      className="flex items-center justify-center rounded-[14px] size-6 sm:size-7 shrink-0 mt-0.5"
                      style={{ backgroundColor: "#f4ebff" }}
                    >
                      <svg width="11" height="9" viewBox="0 0 12 10" fill="none">
                        <path d="M1 5L4.5 8.5L11 1" stroke="#7F56D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-[15px] sm:text-[18px] leading-6 sm:leading-7" style={{ color: "#475467" }}>
                      <span className="font-bold">{bold}</span>
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <a
              className="flex items-center justify-center text-white font-bold text-[14px] sm:text-[15px] transition-opacity hover:opacity-90 w-full sm:w-[260px]"
              style={{ backgroundColor: "#08694a", padding: "10px" }}
              href="https://www.motivv.co/post-job"
              target="_blank"
              rel="noopener noreferrer"
            >
              Post a Role on Motivv
            </a>
          </div>
        </div>

        {/* Right — photo */}
        <div className="flex-1 min-h-[260px] sm:min-h-[360px] lg:min-h-0 relative overflow-hidden" data-reveal="right">
          <img
            src={imgHireTalent}
            alt="Product talent"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "grayscale(100%)" }}
          />
        </div>
      </section>

      {/* ── CTA Banner + Footer ── */}
      <footer style={{ backgroundColor: "#18191a" }}>

        {/* CTA Banner */}
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8" data-reveal>
          <div
            className="flex flex-col items-center text-center gap-8 sm:gap-12 py-12 sm:py-16"
            style={{ borderBottom: "1px solid #3f3d56" }}
          >
            <div className="flex flex-col gap-4 max-w-[768px]">
              <h2 className="text-[22px] sm:text-[30px] leading-[30px] sm:leading-[38px] font-medium text-white">
                Next Internship Cohort — Applications Now Open
              </h2>
              <div className="text-[15px] sm:text-[20px] leading-[24px] sm:leading-[30px]" style={{ color: "#e4e7ec" }}>
                <p className="mb-4 sm:mb-5">
                  Join Aorthar&apos;s intensive internship program and gain real-world experience in Product Management, Design, QA, Scrum, and Operations. Learn from industry experts, work on live projects, and get the chance to secure a job placement.
                </p>
                <p>🔥 Limited Slots Available!</p>
              </div>
            </div>

            <div className="flex flex-row gap-2">
              <Link
                href="/internship"
                className="flex items-center justify-center font-bold text-[14px] sm:text-[15px] hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{ backgroundColor: "#ffffff", color: "#18191a", padding: "10px 18px" }}
              >
                Apply for Internship
              </Link>
              <a
                href="https://wa.me/2349058653400"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center font-bold text-[14px] sm:text-[15px] text-white hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{ backgroundColor: "#08694a", padding: "10px 18px" }}
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-12 sm:py-16" data-reveal>
          <div className="flex flex-col lg:flex-row items-start justify-between gap-10">

            {/* Logo + tagline */}
            <div className="flex flex-col gap-6 sm:gap-8 max-w-[477px]">
              <Link href="/">
                <img src={imgAortharFooterIcon} alt="Aorthar" className="h-9 sm:h-[47px] w-auto object-contain" />
              </Link>
              <p className="text-[14px] sm:text-[16px] leading-6" style={{ color: "#e4e7ec" }}>
                At Aorthar (/ay-OR-tar/), we don&apos;t just teach tech—we build careers. As a{" "}
                <Link href="/about" style={{ color: "#a7d252" }}>full-service product agency →</Link>
                , we specialize in training world-class product talents and developing digital products for startups and businesses.
              </p>
            </div>

            {/* Link columns */}
            <div className="flex gap-8 sm:gap-12 lg:gap-16 flex-wrap">
              {/* Product */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <p className="text-[13px] sm:text-[14px] leading-5 font-medium" style={{ color: "#d0d5dd" }}>Product</p>
                <div className="flex flex-col gap-2 sm:gap-3">
                  {[
                    { label: "Courses", href: "https://courses.aorthar.com" },
                    { label: "Internship", href: "/internship" },
                    { label: "University", href: "https://university.aorthar.com", badge: "New" },
                    { label: "Hire Talent", href: "https://www.motivv.co/post-job" },
                  ].map((link) => (
                    <div key={link.label} className="flex items-center gap-2">
                      <Link href={link.href} className="text-[14px] sm:text-[16px] leading-6 font-medium hover:opacity-80 transition-opacity whitespace-nowrap" style={{ color: "#e4e7ec" }}>
                        {link.label}
                      </Link>
                      {"badge" in link && link.badge && (
                        <span
                          className="text-[11px] sm:text-[12px] leading-[18px] font-medium px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                          style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)" }}
                        >
                          {link.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <p className="text-[13px] sm:text-[14px] leading-5 font-medium" style={{ color: "#d0d5dd" }}>Social</p>
                <div className="flex flex-col gap-2 sm:gap-3">
                  {[
                    { label: "Partnership", href: "/partnership", external: false },
                    { label: "Donate", href: "https://paystack.shop/pay/qzr1023ydq", external: true },
                    { label: "Community", href: "https://chat.whatsapp.com/BaZqynmCDKrEkiY0OED51K", external: true },
                  ].map(({ label, href, external }) =>
                    external ? (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-[14px] sm:text-[16px] leading-6 font-medium hover:opacity-80 transition-opacity whitespace-nowrap" style={{ color: "#e4e7ec" }}>
                        {label}
                      </a>
                    ) : (
                      <Link key={label} href={href} className="text-[14px] sm:text-[16px] leading-6 font-medium hover:opacity-80 transition-opacity whitespace-nowrap" style={{ color: "#e4e7ec" }}>
                        {label}
                      </Link>
                    )
                  )}
                </div>
              </div>

              {/* Legal */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <p className="text-[13px] sm:text-[14px] leading-5 font-medium" style={{ color: "#d0d5dd" }}>Legal</p>
                <div className="flex flex-col gap-2 sm:gap-3">
                  {[
                    { label: "Terms", href: "/terms" },
                    { label: "Privacy", href: "/privacy" },
                    { label: "Cookies", href: "/cookies" },
                    { label: "Contact", href: "mailto:hello@aorthar.com" },
                  ].map(({ label, href }) => (
                    <Link key={label} href={href} className="text-[14px] sm:text-[16px] leading-6 font-medium hover:opacity-80 transition-opacity whitespace-nowrap" style={{ color: "#e4e7ec" }}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 pb-10 sm:pb-12">
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 pt-6 sm:pt-8"
            style={{ borderTop: "1px solid #3f3d56" }}
          >
            <p className="text-[14px] sm:text-[16px] leading-6 whitespace-nowrap" style={{ color: "#d0d5dd" }}>
              © 2025 Aorthar. All rights reserved.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-5 sm:gap-6">
              <Link href="https://x.com/aorthar" className="opacity-70 hover:opacity-100 transition-opacity" aria-label="X">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" fill="#d0d5dd" />
                </svg>
              </Link>
              <Link href="https://instagram.com/aortharhq" className="opacity-70 hover:opacity-100 transition-opacity" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm5.75-3.35a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z" fill="#d0d5dd" />
                </svg>
              </Link>
              <Link href="https://linkedin.com/company/aortharhq" className="opacity-70 hover:opacity-100 transition-opacity" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#d0d5dd" />
                </svg>
              </Link>
              <Link href="https://youtube.com/@aorthar" className="opacity-70 hover:opacity-100 transition-opacity" aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#d0d5dd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

      </footer>
    </div>
  );
}
