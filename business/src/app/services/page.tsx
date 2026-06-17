import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services — Aorthar Agency",
  description:
    "Marketing, branding, and product development services from Aorthar Agency.",
};

const services = [
  {
    id: "marketing",
    title: "Marketing",
    tagline: "Grow your audience. Drive real results.",
    description:
      "We build content engines that attract, convert, and retain. No vanity metrics — just strategies that move the needle.",
    offerings: [
      "Content Strategy — editorial calendars, topic research, funnel mapping",
      "Content Creation — written, visual, and short-form video content",
      "UGC Networks — recruit, brief, and manage user-generated content creators",
    ],
  },
  {
    id: "branding",
    title: "Branding",
    tagline: "Make your mark. Own your space.",
    description:
      "A brand is more than a logo. We craft the full identity — visual, verbal, and strategic — so you show up consistently everywhere.",
    offerings: [
      "Logo & Identity — mark, wordmark, colour palette, typography",
      "Brand Guidelines — the rulebook your whole team can follow",
      "Naming — finding the right name for a company, product, or campaign",
      "Visual Systems — icons, illustration style, motion principles",
    ],
  },
  {
    id: "product",
    title: "Product Development",
    tagline: "Ship products that work. And sell.",
    description:
      "From MVP to full-scale, we design and build digital products end-to-end — with a focus on performance, usability, and conversion.",
    offerings: [
      "Web Apps — full-stack applications built for scale",
      "Mobile Apps — iOS and Android, native or cross-platform",
      "Landing Pages — high-conversion pages built fast",
      "SaaS MVPs — validate your idea before you over-invest",
      "E-commerce — stores that are built to sell",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "6rem 2rem" }}>
      <p
        style={{
          color: "var(--lime)",
          fontSize: "0.75rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: "1.25rem",
        }}
      >
        What We Do
      </p>
      <h1
        style={{
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          marginBottom: "5rem",
        }}
      >
        Three disciplines.
        <br />
        One agency.
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {services.map((s, i) => (
          <div
            key={s.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "4rem",
              alignItems: "start",
              paddingTop: "5rem",
              paddingBottom: "5rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div>
              <div
                style={{
                  width: 32,
                  height: 3,
                  background: "var(--lime)",
                  marginBottom: "1.25rem",
                }}
              />
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: 900,
                  marginBottom: "0.5rem",
                }}
              >
                {s.title}
              </h2>
              <p style={{ color: "var(--lime)", fontSize: "0.875rem" }}>
                {s.tagline}
              </p>
            </div>
            <div>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "1.05rem",
                  lineHeight: 1.7,
                  marginBottom: "2rem",
                }}
              >
                {s.description}
              </p>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                }}
              >
                {s.offerings.map((o) => (
                  <li
                    key={o}
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      fontSize: "0.925rem",
                      color: "var(--text)",
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ color: "var(--lime)", flexShrink: 0 }}>
                      →
                    </span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "3rem",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "2rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              marginBottom: "0.5rem",
            }}
          >
            Not sure which service you need?
          </h3>
          <p style={{ color: "var(--muted)", fontSize: "0.925rem" }}>
            Tell us your goal. We&apos;ll recommend the right starting point.
          </p>
        </div>
        <Link
          href="/contact"
          style={{
            background: "var(--lime)",
            color: "#000",
            fontWeight: 800,
            fontSize: "0.8rem",
            letterSpacing: "0.08em",
            padding: "0.875rem 1.75rem",
            borderRadius: "2px",
            textDecoration: "none",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Talk to Us
        </Link>
      </div>
    </div>
  );
}
