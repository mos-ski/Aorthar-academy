# business.aorthar.com Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Next.js marketing site at `business/` in the Aorthar repo, deployed to `business.aorthar.com`, for Aorthar Agency (marketing, branding, product development).

**Architecture:** Standalone Next.js app in `business/` with its own `package.json`, deployed as a separate Vercel project. Dark aesthetic (#0a0a0a bg, white text, #a7d252 lime, #08694a green). Six pages: Home, Services, Packages, Work, About, Contact. Contact form uses Resend via a Next.js server action.

**Tech Stack:** Next.js 16.1.6, React 19, Tailwind CSS v4, TypeScript 5, Bun, Resend

---

## File Map

```
business/
├── src/
│   ├── app/
│   │   ├── layout.tsx           ← Root layout: <html>, Nav, Footer, dark bg
│   │   ├── globals.css          ← CSS reset + brand tokens (colors, fonts)
│   │   ├── page.tsx             ← Home: hero, services strip, packages teaser, CTA
│   │   ├── services/page.tsx    ← Three service pillars in depth
│   │   ├── packages/page.tsx    ← Browseable service packages with pricing
│   │   ├── work/page.tsx        ← Empty state: "first project could be yours"
│   │   ├── about/page.tsx       ← Who Aorthar is, the vision
│   │   └── contact/
│   │       ├── page.tsx         ← Contact form + book a call
│   │       └── actions.ts       ← Server action: send email via Resend
│   └── components/
│       ├── nav.tsx              ← Top nav: logo + links + CTA button
│       └── footer.tsx           ← Footer: links, tagline, copyright
├── package.json
├── next.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

---

## Task 1: Bootstrap the Next.js app

**Files:**
- Create: `business/package.json`
- Create: `business/tsconfig.json`
- Create: `business/next.config.ts`
- Create: `business/postcss.config.mjs`

- [ ] **Step 1: Create `business/package.json`**

```json
{
  "name": "aorthar-business",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "resend": "^6.10.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create `business/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `business/next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 4: Create `business/postcss.config.mjs`**

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

- [ ] **Step 5: Install dependencies**

Run from `business/`:
```bash
cd business && bun install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 6: Commit**

```bash
git add business/package.json business/tsconfig.json business/next.config.ts business/postcss.config.mjs business/bun.lock
git commit -m "feat(business): scaffold Next.js app"
```

---

## Task 2: Design tokens + global styles

**Files:**
- Create: `business/src/app/globals.css`

- [ ] **Step 1: Create `business/src/app/globals.css`**

```css
@import "tailwindcss";

:root {
  --green: #08694a;
  --lime: #a7d252;
  --bg: #0a0a0a;
  --surface: #111111;
  --border: #1f1f1f;
  --text: #ffffff;
  --muted: #888888;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

body {
  min-height: 100vh;
}

::selection {
  background: var(--lime);
  color: #000;
}
```

- [ ] **Step 2: Commit**

```bash
git add business/src/app/globals.css
git commit -m "feat(business): add design tokens and dark theme"
```

---

## Task 3: Root layout with Nav and Footer

**Files:**
- Create: `business/src/components/nav.tsx`
- Create: `business/src/components/footer.tsx`
- Create: `business/src/app/layout.tsx`

- [ ] **Step 1: Create `business/src/components/nav.tsx`**

```tsx
import Link from "next/link";

const links = [
  { href: "/services", label: "Services" },
  { href: "/packages", label: "Packages" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
];

export function Nav() {
  return (
    <header style={{ borderBottom: "1px solid var(--border)" }}>
      <nav
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "1.25rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontWeight: 900,
            fontSize: "1.1rem",
            letterSpacing: "0.08em",
            color: "var(--text)",
            textDecoration: "none",
          }}
        >
          AORTHAR<span style={{ color: "var(--lime)" }}>/</span>
        </Link>

        <ul style={{ display: "flex", gap: "2rem", listStyle: "none" }}>
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                style={{
                  color: "var(--muted)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  letterSpacing: "0.04em",
                  transition: "color 0.15s",
                }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/contact"
          style={{
            background: "var(--lime)",
            color: "#000",
            fontWeight: 700,
            fontSize: "0.8rem",
            letterSpacing: "0.08em",
            padding: "0.6rem 1.25rem",
            borderRadius: "2px",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Get Started
        </Link>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Create `business/src/components/footer.tsx`**

```tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        marginTop: "6rem",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "3rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 900,
              fontSize: "1rem",
              letterSpacing: "0.08em",
              marginBottom: "0.4rem",
            }}
          >
            AORTHAR<span style={{ color: "var(--lime)" }}>/</span>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
            Marketing. Branding. Product.
          </p>
        </div>

        <nav style={{ display: "flex", gap: "1.5rem" }}>
          {[
            ["/services", "Services"],
            ["/packages", "Packages"],
            ["/work", "Work"],
            ["/about", "About"],
            ["/contact", "Contact"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              style={{
                color: "var(--muted)",
                textDecoration: "none",
                fontSize: "0.8rem",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <p style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
          © {new Date().getFullYear()} Aorthar Agency
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Create `business/src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aorthar Agency — Marketing. Branding. Product.",
  description:
    "We build brands and digital products that dominate. Marketing strategy, brand identity, and product development for businesses at every stage.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Run dev and confirm the shell renders**

```bash
cd business && bun dev
```

Open http://localhost:3001. Expected: dark page with nav and footer, no errors in console.

- [ ] **Step 5: Commit**

```bash
git add business/src/
git commit -m "feat(business): add root layout, nav, footer"
```

---

## Task 4: Home page

**Files:**
- Create: `business/src/app/page.tsx`

- [ ] **Step 1: Create `business/src/app/page.tsx`**

```tsx
import Link from "next/link";

const services = [
  {
    label: "Marketing",
    desc: "Content strategy, content creation, and UGC networks that grow audiences and drive conversions.",
  },
  {
    label: "Branding",
    desc: "Logo & identity, brand guidelines, naming, and visual systems that make you unmistakable.",
  },
  {
    label: "Product",
    desc: "Web apps, mobile apps, landing pages, SaaS MVPs, and e-commerce built to perform.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "8rem 2rem 6rem",
        }}
      >
        <p
          style={{
            color: "var(--lime)",
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}
        >
          Marketing · Branding · Product Development
        </p>
        <h1
          style={{
            fontSize: "clamp(3rem, 8vw, 6rem)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: "2rem",
            maxWidth: 900,
          }}
        >
          We build brands
          <br />
          that{" "}
          <span style={{ color: "var(--lime)" }}>dominate.</span>
        </h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "1.125rem",
            maxWidth: 560,
            lineHeight: 1.6,
            marginBottom: "3rem",
          }}
        >
          Aorthar Agency delivers marketing strategy, brand identity, and
          digital products for businesses at every stage — from day-one
          founders to established companies ready to scale.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link
            href="/contact"
            style={{
              background: "var(--lime)",
              color: "#000",
              fontWeight: 800,
              fontSize: "0.85rem",
              letterSpacing: "0.08em",
              padding: "0.875rem 2rem",
              borderRadius: "2px",
              textDecoration: "none",
              textTransform: "uppercase",
            }}
          >
            Start a Project
          </Link>
          <Link
            href="/packages"
            style={{
              border: "1px solid var(--border)",
              color: "var(--muted)",
              fontWeight: 600,
              fontSize: "0.85rem",
              letterSpacing: "0.04em",
              padding: "0.875rem 2rem",
              borderRadius: "2px",
              textDecoration: "none",
            }}
          >
            View Packages
          </Link>
        </div>
      </section>

      {/* Services strip */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "4rem 2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "3rem",
          }}
        >
          {services.map((s) => (
            <div key={s.label}>
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
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  marginBottom: "0.75rem",
                }}
              >
                {s.label}
              </h2>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.925rem",
                  lineHeight: 1.6,
                }}
              >
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "8rem 2rem",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            marginBottom: "1.5rem",
          }}
        >
          Ready to build something{" "}
          <span style={{ color: "var(--lime)" }}>real?</span>
        </h2>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          Tell us what you need. We'll tell you how to get there.
        </p>
        <Link
          href="/contact"
          style={{
            background: "var(--lime)",
            color: "#000",
            fontWeight: 800,
            fontSize: "0.85rem",
            letterSpacing: "0.08em",
            padding: "0.875rem 2.5rem",
            borderRadius: "2px",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Get in Touch
        </Link>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Verify in browser at http://localhost:3001**

Expected: hero with large headline, 3 service cards in a row, bottom CTA section. No console errors.

- [ ] **Step 3: Commit**

```bash
git add business/src/app/page.tsx
git commit -m "feat(business): add home page"
```

---

## Task 5: Services page

**Files:**
- Create: `business/src/app/services/page.tsx`

- [ ] **Step 1: Create `business/src/app/services/page.tsx`**

```tsx
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

      <div style={{ display: "flex", flexDirection: "column", gap: "6rem" }}>
        {services.map((s, i) => (
          <div
            key={s.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "4rem",
              alignItems: "start",
              paddingTop: i > 0 ? "6rem" : 0,
              borderTop: i > 0 ? "1px solid var(--border)" : "none",
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
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
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
                    <span style={{ color: "var(--lime)", flexShrink: 0 }}>→</span>
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
          marginTop: "6rem",
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
          <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Not sure which service you need?
          </h3>
          <p style={{ color: "var(--muted)", fontSize: "0.925rem" }}>
            Tell us your goal. We'll recommend the right starting point.
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
```

- [ ] **Step 2: Commit**

```bash
git add business/src/app/services/
git commit -m "feat(business): add services page"
```

---

## Task 6: Packages page

**Files:**
- Create: `business/src/app/packages/page.tsx`

- [ ] **Step 1: Create `business/src/app/packages/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Packages — Aorthar Agency",
  description: "Transparent service packages from Aorthar Agency.",
};

const packages = [
  {
    name: "Brand Starter",
    price: "₦350,000",
    category: "Branding",
    description: "Everything you need to launch with a professional identity.",
    includes: [
      "Logo design (3 concepts, 2 revisions)",
      "Colour palette & typography",
      "Brand guidelines (PDF)",
      "Social media kit (profile + cover sizes)",
    ],
    cta: "Get Your Brand",
    featured: false,
  },
  {
    name: "Content Engine",
    price: "₦200,000 / mo",
    category: "Marketing",
    description: "A done-for-you content operation that runs every month.",
    includes: [
      "Monthly content strategy session",
      "12 social media posts (captions + graphics)",
      "2 long-form articles or newsletters",
      "UGC brief + creator outreach (up to 3 creators)",
    ],
    cta: "Start the Engine",
    featured: true,
  },
  {
    name: "MVP Launch",
    price: "From ₦1,500,000",
    category: "Product",
    description: "A fully functional web or mobile MVP, shipped in 6 weeks.",
    includes: [
      "Discovery & scoping session",
      "UI/UX design (Figma)",
      "Full-stack development (Next.js or React Native)",
      "Deployment + 30-day post-launch support",
    ],
    cta: "Build My MVP",
    featured: false,
  },
  {
    name: "Full Agency Retainer",
    price: "Custom",
    category: "All Services",
    description:
      "Marketing, branding, and product working together under one roof.",
    includes: [
      "Dedicated account lead",
      "Monthly strategy + content",
      "Ongoing brand management",
      "Product iteration sprints",
    ],
    cta: "Let's Talk",
    featured: false,
  },
];

export default function PackagesPage() {
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
        Packages & Pricing
      </p>
      <h1
        style={{
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          marginBottom: "1rem",
        }}
      >
        No surprises.
        <br />
        Just results.
      </h1>
      <p
        style={{
          color: "var(--muted)",
          fontSize: "1.05rem",
          maxWidth: 520,
          lineHeight: 1.6,
          marginBottom: "5rem",
        }}
      >
        Every package is a starting point. We customise scope, timeline, and
        budget to fit your specific needs — just reach out.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {packages.map((pkg) => (
          <div
            key={pkg.name}
            style={{
              background: pkg.featured ? "var(--green)" : "var(--surface)",
              border: pkg.featured
                ? "1px solid var(--green)"
                : "1px solid var(--border)",
              borderRadius: "4px",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              position: "relative",
            }}
          >
            {pkg.featured && (
              <div
                style={{
                  position: "absolute",
                  top: "-1px",
                  right: "1.5rem",
                  background: "var(--lime)",
                  color: "#000",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  padding: "0.3rem 0.75rem",
                  textTransform: "uppercase",
                }}
              >
                Popular
              </div>
            )}

            <div>
              <p
                style={{
                  color: pkg.featured ? "var(--lime)" : "var(--muted)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                {pkg.category}
              </p>
              <h2 style={{ fontSize: "1.375rem", fontWeight: 800 }}>
                {pkg.name}
              </h2>
            </div>

            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: pkg.featured ? "#fff" : "var(--lime)",
              }}
            >
              {pkg.price}
            </div>

            <p
              style={{
                color: pkg.featured ? "rgba(255,255,255,0.7)" : "var(--muted)",
                fontSize: "0.9rem",
                lineHeight: 1.5,
              }}
            >
              {pkg.description}
            </p>

            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "0.625rem",
                flexGrow: 1,
              }}
            >
              {pkg.includes.map((item) => (
                <li
                  key={item}
                  style={{
                    display: "flex",
                    gap: "0.6rem",
                    fontSize: "0.85rem",
                    color: pkg.featured ? "rgba(255,255,255,0.85)" : "var(--text)",
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    style={{
                      color: "var(--lime)",
                      flexShrink: 0,
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/contact"
              style={{
                display: "block",
                textAlign: "center",
                background: pkg.featured ? "var(--lime)" : "transparent",
                color: pkg.featured ? "#000" : "var(--lime)",
                border: pkg.featured ? "none" : "1px solid var(--lime)",
                fontWeight: 800,
                fontSize: "0.8rem",
                letterSpacing: "0.06em",
                padding: "0.75rem",
                borderRadius: "2px",
                textDecoration: "none",
                textTransform: "uppercase",
                marginTop: "auto",
              }}
            >
              {pkg.cta}
            </Link>
          </div>
        ))}
      </div>

      <p
        style={{
          textAlign: "center",
          color: "var(--muted)",
          fontSize: "0.85rem",
          marginTop: "3rem",
        }}
      >
        All prices in Nigerian Naira (NGN). Custom scopes available.{" "}
        <Link
          href="/contact"
          style={{ color: "var(--lime)", textDecoration: "none" }}
        >
          Get a quote →
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add business/src/app/packages/
git commit -m "feat(business): add packages page"
```

---

## Task 7: Work page (empty state)

**Files:**
- Create: `business/src/app/work/page.tsx`

- [ ] **Step 1: Create `business/src/app/work/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Work — Aorthar Agency",
  description: "Case studies and work from Aorthar Agency.",
};

export default function WorkPage() {
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "6rem 2rem",
      }}
    >
      <p
        style={{
          color: "var(--lime)",
          fontSize: "0.75rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: "1.25rem",
        }}
      >
        Our Work
      </p>
      <h1
        style={{
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          marginBottom: "1.5rem",
        }}
      >
        Case studies
        <br />
        coming soon.
      </h1>
      <p
        style={{
          color: "var(--muted)",
          fontSize: "1.05rem",
          maxWidth: 520,
          lineHeight: 1.6,
          marginBottom: "4rem",
        }}
      >
        We&apos;re just getting started — but our first clients will be featured
        right here. Want to be one of them?
      </p>

      <div
        style={{
          border: "1px dashed var(--border)",
          borderRadius: "4px",
          padding: "5rem 3rem",
          textAlign: "center",
          maxWidth: 600,
        }}
      >
        <div
          style={{
            fontSize: "3rem",
            marginBottom: "1.5rem",
          }}
        >
          →
        </div>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            marginBottom: "0.75rem",
          }}
        >
          Your project could be first.
        </h2>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "0.925rem",
            lineHeight: 1.6,
            marginBottom: "2rem",
          }}
        >
          Early clients get priority attention, founder pricing, and the full
          weight of our focus. Let&apos;s build something worth showing off.
        </p>
        <Link
          href="/contact"
          style={{
            background: "var(--lime)",
            color: "#000",
            fontWeight: 800,
            fontSize: "0.8rem",
            letterSpacing: "0.08em",
            padding: "0.875rem 2rem",
            borderRadius: "2px",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Start a Project
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add business/src/app/work/
git commit -m "feat(business): add work page with empty state"
```

---

## Task 8: About page

**Files:**
- Create: `business/src/app/about/page.tsx`

- [ ] **Step 1: Create `business/src/app/about/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Aorthar Agency",
  description: "Who we are and what we believe at Aorthar Agency.",
};

const values = [
  {
    title: "Execution over theory",
    desc: "We don't just make decks. We build, ship, and iterate until it works.",
  },
  {
    title: "Brand as a business asset",
    desc: "Great branding isn't aesthetic — it's the thing that makes people choose you.",
  },
  {
    title: "Clarity above complexity",
    desc: "The best marketing, products, and identities are always the simplest ones.",
  },
  {
    title: "Clients as partners",
    desc: "We're not a vendor. We're invested in your outcomes, not just your deliverables.",
  },
];

export default function AboutPage() {
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
        About Aorthar
      </p>
      <h1
        style={{
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          marginBottom: "3rem",
          maxWidth: 800,
        }}
      >
        We exist to make
        <br />
        businesses{" "}
        <span style={{ color: "var(--lime)" }}>unmissable.</span>
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "5rem",
          marginBottom: "6rem",
          alignItems: "start",
        }}
      >
        <div>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1.05rem",
              lineHeight: 1.8,
              marginBottom: "1.5rem",
            }}
          >
            Aorthar is a full-service agency covering marketing, branding, and
            product development. We work with startups, SMEs, and established
            businesses that want to grow — and need a team that can think
            strategically and build practically.
          </p>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1.05rem",
              lineHeight: 1.8,
            }}
          >
            We don&apos;t specialise in one industry. We specialise in making
            businesses stand out in any industry — through the right content,
            the right brand, and the right digital products.
          </p>
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "2.5rem",
          }}
        >
          <p
            style={{
              color: "var(--lime)",
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}
          >
            What we offer
          </p>
          {[
            "Marketing — Content strategy, creation & UGC",
            "Branding — Identity, guidelines & visual systems",
            "Product — Web, mobile & SaaS development",
          ].map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                gap: "0.75rem",
                marginBottom: "1rem",
                fontSize: "0.925rem",
                color: "var(--text)",
              }}
            >
              <span style={{ color: "var(--lime)" }}>→</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "4rem" }}>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 900,
            marginBottom: "3rem",
          }}
        >
          What we believe
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "2rem",
          }}
        >
          {values.map((v) => (
            <div key={v.title}>
              <div
                style={{
                  width: 24,
                  height: 3,
                  background: "var(--lime)",
                  marginBottom: "1rem",
                }}
              />
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  marginBottom: "0.625rem",
                }}
              >
                {v.title}
              </h3>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                }}
              >
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          marginTop: "6rem",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/contact"
          style={{
            background: "var(--lime)",
            color: "#000",
            fontWeight: 800,
            fontSize: "0.8rem",
            letterSpacing: "0.08em",
            padding: "0.875rem 2rem",
            borderRadius: "2px",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Work With Us
        </Link>
        <Link
          href="/services"
          style={{
            border: "1px solid var(--border)",
            color: "var(--muted)",
            fontWeight: 600,
            fontSize: "0.8rem",
            letterSpacing: "0.04em",
            padding: "0.875rem 2rem",
            borderRadius: "2px",
            textDecoration: "none",
          }}
        >
          See Our Services
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add business/src/app/about/
git commit -m "feat(business): add about page"
```

---

## Task 9: Contact page + server action

**Files:**
- Create: `business/src/app/contact/actions.ts`
- Create: `business/src/app/contact/page.tsx`

- [ ] **Step 1: Create `business/src/app/contact/actions.ts`**

Requires `RESEND_API_KEY` and `CONTACT_EMAIL` in `business/.env.local`.

```ts
"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type ContactResult = { success: true } | { success: false; error: string };

export async function sendContactEmail(formData: FormData): Promise<ContactResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { success: false, error: "Please fill in all required fields." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  try {
    await resend.emails.send({
      from: "Aorthar Business <noreply@aorthar.com>",
      to: process.env.CONTACT_EMAIL ?? "adedamolamoses@gmail.com",
      replyTo: email,
      subject: `New inquiry from ${name}${service ? ` — ${service}` : ""}`,
      text: `Name: ${name}\nEmail: ${email}\nService: ${service || "Not specified"}\n\n${message}`,
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to send message. Please try again." };
  }
}
```

- [ ] **Step 2: Create `business/src/app/contact/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { sendContactEmail, type ContactResult } from "./actions";

const services = [
  "Marketing — Content Strategy",
  "Marketing — Content Creation",
  "Marketing — UGC Network",
  "Branding — Logo & Identity",
  "Branding — Brand Guidelines",
  "Product — Web App",
  "Product — Mobile App",
  "Product — Landing Page",
  "Product — SaaS MVP",
  "Product — E-commerce",
  "Full Agency Retainer",
  "Not sure yet",
];

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const result: ContactResult = await sendContactEmail(new FormData(e.currentTarget));
    if (result.success) {
      setStatus("done");
    } else {
      setErrorMsg(result.error);
      setStatus("error");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "2px",
    color: "var(--text)",
    fontSize: "0.925rem",
    padding: "0.875rem 1rem",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--muted)",
    marginBottom: "0.5rem",
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "6rem 2rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6rem",
          alignItems: "start",
        }}
      >
        {/* Left */}
        <div>
          <p
            style={{
              color: "var(--lime)",
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}
          >
            Get in Touch
          </p>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              marginBottom: "1.5rem",
            }}
          >
            Let&apos;s build
            <br />
            something{" "}
            <span style={{ color: "var(--lime)" }}>real.</span>
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1rem",
              lineHeight: 1.7,
              marginBottom: "3rem",
            }}
          >
            Tell us what you&apos;re working on. We&apos;ll get back to you within 24 hours.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {[
              { label: "Response time", value: "Within 24 hours" },
              { label: "Based in", value: "Nigeria — serving clients globally" },
              { label: "Email", value: "hello@aorthar.com" },
            ].map((item) => (
              <div key={item.label}>
                <p
                  style={{
                    color: "var(--lime)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom: "0.25rem",
                  }}
                >
                  {item.label}
                </p>
                <p style={{ fontSize: "0.925rem" }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "2.5rem",
          }}
        >
          {status === "done" ? (
            <div style={{ textAlign: "center", padding: "3rem 0" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✓</div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>
                Message sent.
              </h2>
              <p style={{ color: "var(--muted)", fontSize: "0.925rem" }}>
                We&apos;ll be in touch within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label htmlFor="name" style={labelStyle}>Name *</label>
                <input id="name" name="name" type="text" required placeholder="Your name" style={inputStyle} />
              </div>

              <div>
                <label htmlFor="email" style={labelStyle}>Email *</label>
                <input id="email" name="email" type="email" required placeholder="you@company.com" style={inputStyle} />
              </div>

              <div>
                <label htmlFor="service" style={labelStyle}>Service interested in</label>
                <select id="service" name="service" style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Select a service...</option>
                  {services.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" style={labelStyle}>Message *</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell us about your project, goals, timeline..."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              {status === "error" && (
                <p style={{ color: "#ff4444", fontSize: "0.85rem" }}>{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  background: "var(--lime)",
                  color: "#000",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  letterSpacing: "0.08em",
                  padding: "0.95rem",
                  borderRadius: "2px",
                  border: "none",
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                  textTransform: "uppercase",
                  opacity: status === "loading" ? 0.7 : 1,
                }}
              >
                {status === "loading" ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `business/.env.local`**

```
RESEND_API_KEY=your_resend_api_key_here
CONTACT_EMAIL=adedamolamoses@gmail.com
```

- [ ] **Step 4: Commit**

```bash
git add business/src/app/contact/
git commit -m "feat(business): add contact page and server action"
```

---

## Task 10: Production build + `.gitignore`

**Files:**
- Modify: `.gitignore` (root)

- [ ] **Step 1: Add business app ignores to root `.gitignore`**

Add these lines:
```
business/.next/
business/node_modules/
business/.env.local
```

- [ ] **Step 2: Run production build**

```bash
cd business && bun run build
```

Expected: Build completes with no errors. All 6 routes compiled.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "feat(business): production build passes, update gitignore"
```

---

## Task 11: Vercel deployment config

**Files:**
- Create: `business/vercel.json`

- [ ] **Step 1: Create `business/vercel.json`**

```json
{
  "framework": "nextjs",
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "outputDirectory": ".next"
}
```

- [ ] **Step 2: Push to GitHub**

```bash
git push origin main
```

- [ ] **Step 3: Create new Vercel project**

In the Vercel dashboard:
1. Click "Add New Project" → import the Aorthar repo
2. Set **Root Directory** to `business`
3. Set **Build Command** to `bun run build`
4. Set **Install Command** to `bun install`
5. Add env vars: `RESEND_API_KEY`, `CONTACT_EMAIL`
6. Deploy

- [ ] **Step 4: Add custom domain**

In Vercel project → Domains → add `business.aorthar.com` → follow DNS instructions.

- [ ] **Step 5: Commit**

```bash
git add business/vercel.json
git commit -m "feat(business): add vercel deployment config"
```
