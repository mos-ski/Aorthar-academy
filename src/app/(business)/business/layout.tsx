import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import './business.css';

export const metadata: Metadata = {
  title: 'Aorthar Agency — Marketing. Branding. Product.',
  description:
    'We build brands and digital products that dominate. Marketing strategy, brand identity, and product development for businesses at every stage.',
};

const navLinks = [
  { href: '/business/services', label: 'Services' },
  { href: '/business/packages', label: 'Packages' },
  { href: '/business/work', label: 'Work' },
  { href: '/business/about', label: 'About' },
];

function Nav() {
  return (
    <header style={{ borderBottom: '1px solid #1f1f1f', background: '#0a0a0a' }}>
      <nav
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link href="/business" style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/Aorthar Logo long complete.svg"
            alt="Aorthar"
            width={100}
            height={43}
            priority
          />
        </Link>

        <ul className="biz-nav-links">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                style={{
                  color: '#888',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  letterSpacing: '0.04em',
                }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/business/contact"
          style={{
            background: '#a7d252',
            color: '#000',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
            padding: '0.6rem 1.25rem',
            borderRadius: '2px',
            textDecoration: 'none',
            textTransform: 'uppercase' as const,
          }}
        >
          Get Started
        </Link>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #1f1f1f', marginTop: '6rem', background: '#0a0a0a' }}>
      <div
        className="biz-footer"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '3rem 2rem',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap' as const,
          gap: '1.5rem',
        }}
      >
        <div>
          <Image
            src="/Aorthar Logo long complete.svg"
            alt="Aorthar"
            width={80}
            height={34}
          />
          <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Marketing. Branding. Product.
          </p>
        </div>

        <nav style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' as const }}>
          {[
            ['/business/services', 'Services'],
            ['/business/packages', 'Packages'],
            ['/business/work', 'Work'],
            ['/business/about', 'About'],
            ['/business/contact', 'Contact'],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              style={{ color: '#888', textDecoration: 'none', fontSize: '0.8rem' }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <p style={{ color: '#888', fontSize: '0.75rem' }}>
          © {new Date().getFullYear()} Aorthar Agency
        </p>
      </div>
    </footer>
  );
}

export default function BusinessPagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
