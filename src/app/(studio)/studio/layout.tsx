import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getSettings } from '@/lib/settings';
import './studio.css';

export const metadata: Metadata = {
  title: 'Aorthar Agency — Marketing. Branding. Product.',
  description:
    'We build brands and digital products that dominate. Marketing strategy, brand identity, and product development for businesses at every stage.',
};

const navLinks = [
  { href: '/studio/services', label: 'Services' },
  { href: '/studio/packages', label: 'Packages' },
  { href: '/studio/work', label: 'Work' },
  { href: '/studio/about', label: 'About' },
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
        <Link href="/studio" style={{ display: 'flex', alignItems: 'center' }}>
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
          href="/studio/contact"
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

const socialLabels: Record<string, string> = {
  social_instagram: 'Instagram',
  social_twitter: 'X',
  social_linkedin: 'LinkedIn',
  social_tiktok: 'TikTok',
  social_youtube: 'YouTube',
};

function Footer({ settings }: { settings: Record<string, string> }) {
  const socials = Object.entries(socialLabels)
    .map(([key, label]) => ({ label, url: settings[key] }))
    .filter((s) => s.url);

  const phone = settings.contact_phone;
  const whatsapp = settings.contact_whatsapp;

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
          <Image src="/Aorthar Logo long complete.svg" alt="Aorthar" width={80} height={34} />
          <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Marketing. Branding. Product.
          </p>
          {(phone || whatsapp) && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {phone && (
                <a href={`tel:${phone}`} style={{ color: '#888', fontSize: '0.8rem', textDecoration: 'none' }}>
                  {phone}
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#a7d252', fontSize: '0.8rem', textDecoration: 'none' }}
                >
                  WhatsApp ↗
                </a>
              )}
            </div>
          )}
        </div>

        <nav style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' as const }}>
          {[
            ['/studio/services', 'Services'],
            ['/studio/packages', 'Packages'],
            ['/studio/work', 'Work'],
            ['/studio/about', 'About'],
            ['/studio/contact', 'Contact'],
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

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
          {socials.length > 0 && (
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' as const }}>
              {socials.map(({ label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#888', textDecoration: 'none', fontSize: '0.8rem' }}
                >
                  {label}
                </a>
              ))}
            </div>
          )}
          <p style={{ color: '#888', fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} Aorthar Agency
          </p>
        </div>
      </div>
    </footer>
  );
}

export default async function StudioPagesLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <div style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Nav />
      <main>{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
