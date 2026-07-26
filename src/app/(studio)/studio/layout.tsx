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

function Nav() {
  return (
    <header style={{ background: '#18191a', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <nav className="studio-nav">
        <Link href="/studio" style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/Aorthar Logo long complete.svg"
            alt="Aorthar"
            width={92}
            height={40}
            priority
          />
        </Link>

        <div style={{ display: 'flex', gap: '21.6px', alignItems: 'center' }}>
          <Link href="/studio/about" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14.4px', letterSpacing: '0.02em' }}>
            About us
          </Link>
          <Link href="/studio/contact" style={{ color: '#a7d252', textDecoration: 'none', fontSize: '14.4px' }}>
            Hire from us
          </Link>
        </div>
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

  return (
    <footer style={{ background: '#18191a', paddingBottom: '43.2px', paddingLeft: '64px', paddingRight: '64px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '14px',
          paddingBottom: '14px',
        }}
      >
        <Image src="/Aorthar Logo long complete.svg" alt="Aorthar" width={135} height={58} />

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <nav style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
            {[
              ['/studio/services', 'Services'],
              ['/studio/packages', 'Packages'],
              ['/studio/work', 'Work'],
              ['/studio/about', 'About'],
              ['/studio/contact', 'Contact'],
            ].map(([href, label]) => (
              <Link key={href} href={href} style={{ color: '#888', textDecoration: 'none', fontSize: '11.52px', letterSpacing: '0.03px' }}>
                {label}
              </Link>
            ))}
          </nav>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            {socials.length > 0 && (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {socials.map(({ label, url }) => (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'none', fontSize: '11px' }}>
                    {label}
                  </a>
                ))}
              </div>
            )}
            <p style={{ color: '#888', fontSize: '10.8px', letterSpacing: '0.08px', margin: 0 }}>
              © {new Date().getFullYear()} Aorthar Agency
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default async function StudioPagesLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="studio-root">
      <Nav />
      <main>{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
