import Link from "next/link";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

// Figma asset URLs (valid 7 days)
const imgWreathLeft = "https://www.figma.com/api/mcp/asset/7a76983c-5896-4a5b-ba23-dbc04dcfc0b6";
const imgWreathRight = "https://www.figma.com/api/mcp/asset/13137131-1d86-45ad-b530-a809f78ee209";
const imgStar = "https://www.figma.com/api/mcp/asset/948328a6-6b42-4267-babc-850273cb43f3";
const imgFeatureArrow = "https://www.figma.com/api/mcp/asset/81fcfdef-cfdb-416f-8872-1f914de01889";
const imgAortharIcon = "/Aorthar Logo long complete.svg";
const imgHireTalent = "https://www.figma.com/api/mcp/asset/47912351-5be0-4e8b-8705-0bb0231fa472";
const imgDeeXoptions = "/Frame 1.svg";
const imgNazza = "/Nazza main 1 3.svg";
const imgCeller = "/Combination mark.svg";
const imgDigitalAbundance = "/Frame 3.svg";
const imgSyarpa = "/Frame 2.svg";
const imgAortharFooterIcon = "/Aorthar Logo long complete.svg";


function RatingsBadge() {
  return (
    <div className="flex items-center">
      {/* Wreath left */}
      <div className="relative shrink-0 h-[64px] w-[29px] sm:h-[80px] sm:w-[36px] -mr-1">
        <img alt="" className="block w-full h-full" src={imgWreathLeft} />
      </div>
      {/* Center content */}
      <div className="flex flex-col items-center gap-1 -mr-1">
        {/* Stars */}
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="relative size-3.5 sm:size-4 overflow-hidden">
              <img alt="" className="absolute inset-0 w-full h-full" src={imgStar} />
            </div>
          ))}
        </div>
        {/* Labels */}
        <p className="text-[12px] sm:text-[14px] leading-5 font-medium whitespace-nowrap" style={{ color: "#ebefe0" }}>
          Best Entry School
        </p>
        <p className="text-[11px] sm:text-[12px] leading-[18px] font-medium whitespace-nowrap" style={{ color: "#a7d252" }}>
          2,000+ reviews
        </p>
      </div>
      {/* Wreath right */}
      <div className="relative shrink-0 h-[64px] w-[29px] sm:h-[80px] sm:w-[36px] -mr-1">
        <img alt="" className="block w-full h-full" src={imgWreathRight} />
      </div>
    </div>
  );
}

type FeatureTabProps = {
  title: string;
  description: string;
  ctaHref?: string;
};

function FeatureTab({ title, description, ctaHref = "/register" }: FeatureTabProps) {
  return (
    <div
      className="flex flex-col gap-5 pl-6 py-4 w-full sm:w-[calc(50%-16px)]"
      style={{ borderLeft: "0.5px solid #f2f4f7" }}
      data-reveal="left"
    >
      <div className="flex flex-col gap-2">
        <p className="text-[20px] leading-[30px] text-white font-medium">{title}</p>
        <p className="text-[16px] leading-6" style={{ color: "#b1b1b1" }}>{description}</p>
      </div>
      <Link
        href={ctaHref}
        className="inline-flex items-center gap-2 text-[16px] font-semibold leading-6 hover:opacity-80 transition-opacity w-fit"
        style={{ color: "#a7d252" }}
      >
        Learn more
        <img src={imgFeatureArrow} alt="" className="size-5" />
      </Link>
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
          className="flex items-center justify-between px-4 sm:px-8 h-12 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src={imgAortharIcon} alt="Aorthar" className="h-7 sm:h-9 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="#about" className="text-sm text-white/70 hover:text-white transition-colors hidden sm:block">
              About us
            </Link>
            <Link
              href="#hire"
              className="text-xs sm:text-sm font-medium hover:opacity-80 transition-opacity whitespace-nowrap"
              style={{ color: "#a7d252" }}
            >
              Hire from us
            </Link>
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
            { label: "Buy Course", href: "/pricing" },
            { label: "Twitter", href: "#" },
            { label: "Instagram", href: "#" },
            { label: "Youtube", href: "#" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-xs sm:text-sm text-white/60 hover:text-white transition-colors whitespace-nowrap shrink-0"
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
            href="/register"
            className="landing-pulse flex items-center justify-center text-white font-bold text-[14px] sm:text-[15px] hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#08694a", padding: "10px", width: "min(273px, 100%)" }}
            data-reveal="zoom"
          >
            Start your Career Journey
          </Link>

          {/* Ratings badge */}
          <div data-reveal="zoom">
            <RatingsBadge />
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section className="py-8 sm:py-10 px-4 sm:px-6" style={{ backgroundColor: "#101010" }} data-reveal>
        <p className="text-center text-xs sm:text-sm mb-6 sm:mb-8" style={{ color: "#888" }}>
          Start-Ups trust us to get best talent prospects
        </p>
        <div
          className="flex items-center gap-8 sm:flex-wrap sm:justify-center overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 max-w-5xl sm:mx-auto px-2 sm:px-0"
          style={{ scrollbarWidth: "none" }}
        >
          <img src={imgDeeXoptions} alt="DeeXoptions" className="h-7 sm:h-8 w-auto object-contain shrink-0 opacity-80" />
          <img src={imgNazza} alt="nazza" className="h-7 sm:h-8 w-auto object-contain shrink-0 opacity-80" />
          <img src={imgSyarpa} alt="syarpa" className="h-7 sm:h-8 w-auto object-contain shrink-0 opacity-80" />
          <img src={imgCeller} alt="celler" className="h-7 sm:h-8 w-auto object-contain shrink-0 opacity-80" />
          <img src={imgDigitalAbundance} alt="Digital Abundance" className="h-8 sm:h-10 w-auto object-contain shrink-0 opacity-80" />
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
        <Link
          href="/register"
          className="flex items-center justify-center text-white font-bold text-[14px] sm:text-[15px] hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#08694a", padding: "10px", width: "min(260px, 100%)" }}
          data-reveal="zoom"
        >
          Join our Community —— for Free!
        </Link>
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

          {/* Feature tabs */}
          <div className="flex flex-wrap gap-8">
            <FeatureTab
              title="Courses (Learn at Your Own Pace)"
              description="Pre-recorded courses designed to teach you essential product skills anytime, anywhere. Learn on your schedule with structured lessons, practical exercises, and real-world applications."
              ctaHref="/courses"
            />
            <FeatureTab
              title="Internships (Free Program)"
              description="Apply twice a year for a 3-month real-world training with early startups. We train and place top 10-20 selected applicants in real product teams, giving them hands-on experience and career opportunities. If you excel, you could even secure a full-time role."
              ctaHref="/register"
            />
            <FeatureTab
              title="Bootcamps (Premium Program)"
              description="Join our 8-12 week live, immersive training where you'll work on real projects, collaborate with peers, and gain job-ready skills in Product Design, Product Management, QA, Scrum, and Tech Operations."
              ctaHref="/register"
            />
            <FeatureTab
              title="Mentorship (Exclusive Program)"
              description="Get direct access to expert guidance, career strategy, and industry insights through our one-on-one mentorship program. If you're already earning but want to advance, this program provides personal coaching, career advice, and networking."
              ctaHref="/register"
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

            <button
              className="flex items-center justify-center text-white font-bold text-[14px] sm:text-[15px] transition-opacity hover:opacity-90 w-full sm:w-[260px]"
              style={{ backgroundColor: "#08694a", padding: "10px" }}
            >
              Contact Us
            </button>
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
                Next Cohort Opens Soon – Apply Now!
              </h2>
              <div className="text-[15px] sm:text-[20px] leading-[24px] sm:leading-[30px]" style={{ color: "#e4e7ec" }}>
                <p className="mb-4 sm:mb-5">
                  Join Aorthar&apos;s intensive internship program and gain real-world experience in Product Management, Design, QA, Scrum, and Operations. Learn from industry experts, work on live projects, and get the chance to secure a job placement.
                </p>
                <p>🔥 Limited Slots Available!</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/register"
                className="flex items-center justify-center font-bold text-[14px] sm:text-[15px] hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#ffffff", color: "#18191a", padding: "10px", width: "min(177px, 100%)", alignSelf: "center" }}
              >
                Shoot your Shot!
              </Link>
              <Link
                href="https://wa.me/"
                className="flex items-center justify-center font-bold text-[14px] sm:text-[15px] text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#08694a", padding: "10px", width: "min(162px, 100%)", alignSelf: "center" }}
              >
                Chat on WhatsApp
              </Link>
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
                <span style={{ color: "#a7d252" }}>full-service product agency →</span>
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
                    { label: "Courses", href: "/courses" },
                    { label: "Internship", href: "/register" },
                    { label: "Bootcamps", href: "/register", badge: "New" },
                    { label: "Mentorship", href: "/register" },
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
                    { label: "Partnership", href: "#" },
                    { label: "Donate", href: "#" },
                    { label: "Community", href: "#" },
                  ].map(({ label, href }) => (
                    <Link key={label} href={href} className="text-[14px] sm:text-[16px] leading-6 font-medium hover:opacity-80 transition-opacity whitespace-nowrap" style={{ color: "#e4e7ec" }}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Legal */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <p className="text-[13px] sm:text-[14px] leading-5 font-medium" style={{ color: "#d0d5dd" }}>Legal</p>
                <div className="flex flex-col gap-2 sm:gap-3">
                  {[
                    { label: "Terms", href: "#" },
                    { label: "Privacy", href: "#" },
                    { label: "Cookies", href: "#" },
                    { label: "Contact", href: "#" },
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
              <Link href="#" className="opacity-70 hover:opacity-100 transition-opacity" aria-label="X">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" fill="#d0d5dd" />
                </svg>
              </Link>
              <Link href="#" className="opacity-70 hover:opacity-100 transition-opacity" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#d0d5dd" />
                </svg>
              </Link>
              <Link href="#" className="opacity-70 hover:opacity-100 transition-opacity" aria-label="Facebook">
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
