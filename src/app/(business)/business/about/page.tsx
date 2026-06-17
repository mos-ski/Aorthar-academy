import Link from 'next/link';

const lime = '#a7d252';
const muted = '#888';
const border = '#1f1f1f';
const surface = '#111';

const values = [
  { title: 'Execution over theory', desc: "We don't just make decks. We build, ship, and iterate until it works." },
  { title: 'Brand as a business asset', desc: "Great branding isn't aesthetic — it's the thing that makes people choose you." },
  { title: 'Clarity above complexity', desc: 'The best marketing, products, and identities are always the simplest ones.' },
  { title: 'Clients as partners', desc: "We're not a vendor. We're invested in your outcomes, not just your deliverables." },
];

export default function AboutPage() {
  return (
    <div className="biz-section">
      <p style={{ color: lime, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
        About Aorthar
      </p>
      <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '3rem', maxWidth: 800 }}>
        We exist to make<br />businesses <span style={{ color: lime }}>unmissable.</span>
      </h1>

      <div className="biz-2col" style={{ marginBottom: '6rem' }}>
        <div>
          <p style={{ color: muted, fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            Aorthar is a full-service agency covering marketing, branding, and product development. We work with startups, SMEs, and established businesses that want to grow — and need a team that can think strategically and build practically.
          </p>
          <p style={{ color: muted, fontSize: '1.05rem', lineHeight: 1.8 }}>
            We don&apos;t specialise in one industry. We specialise in making businesses stand out in any industry — through the right content, the right brand, and the right digital products.
          </p>
        </div>

        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '4px', padding: '2.5rem' }}>
          <p style={{ color: lime, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>What we offer</p>
          {[
            'Marketing — Content strategy, creation & UGC',
            'Branding — Identity, guidelines & visual systems',
            'Product — Web, mobile & SaaS development',
          ].map((item) => (
            <div key={item} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.925rem' }}>
              <span style={{ color: lime }}>→</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${border}`, paddingTop: '4rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '3rem' }}>What we believe</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          {values.map((v) => (
            <div key={v.title}>
              <div style={{ width: 24, height: 3, background: lime, marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.625rem' }}>{v.title}</h3>
              <p style={{ color: muted, fontSize: '0.9rem', lineHeight: 1.6 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '6rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link href="/business/contact" style={{ background: lime, color: '#000', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.08em', padding: '0.875rem 2rem', borderRadius: '2px', textDecoration: 'none', textTransform: 'uppercase' }}>
          Work With Us
        </Link>
        <Link href="/business/services" style={{ border: `1px solid ${border}`, color: muted, fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.04em', padding: '0.875rem 2rem', borderRadius: '2px', textDecoration: 'none' }}>
          See Our Services
        </Link>
      </div>
    </div>
  );
}
