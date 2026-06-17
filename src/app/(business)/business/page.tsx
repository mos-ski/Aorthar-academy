import Link from 'next/link';

const services = [
  {
    label: 'Marketing',
    desc: 'Content strategy, content creation, and UGC networks that grow audiences and drive conversions.',
  },
  {
    label: 'Branding',
    desc: 'Logo & identity, brand guidelines, naming, and visual systems that make you unmistakable.',
  },
  {
    label: 'Product',
    desc: 'Web apps, mobile apps, landing pages, SaaS MVPs, and e-commerce built to perform.',
  },
];

const lime = '#a7d252';
const muted = '#888';
const border = '#1f1f1f';

export default function BusinessHome() {
  return (
    <>
      {/* Hero */}
      <section className="biz-hero">
        <p style={{ color: lime, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Marketing · Branding · Product Development
        </p>
        <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '2rem', maxWidth: 900 }}>
          We build brands<br />that <span style={{ color: lime }}>dominate.</span>
        </h1>
        <p style={{ color: muted, fontSize: '1.125rem', maxWidth: 560, lineHeight: 1.6, marginBottom: '3rem' }}>
          Aorthar Agency delivers marketing strategy, brand identity, and digital products for businesses at every stage — from day-one founders to established companies ready to scale.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/business/contact" style={{ background: lime, color: '#000', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em', padding: '0.875rem 2rem', borderRadius: '2px', textDecoration: 'none', textTransform: 'uppercase' }}>
            Start a Project
          </Link>
          <Link href="/business/packages" style={{ border: `1px solid ${border}`, color: muted, fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.04em', padding: '0.875rem 2rem', borderRadius: '2px', textDecoration: 'none' }}>
            View Packages
          </Link>
        </div>
      </section>

      {/* Services strip */}
      <section style={{ borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
          {services.map((s) => (
            <div key={s.label}>
              <div style={{ width: 32, height: 3, background: lime, marginBottom: '1.25rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>{s.label}</h2>
              <p style={{ color: muted, fontSize: '0.925rem', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="biz-cta-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '8rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
          Ready to build something <span style={{ color: lime }}>real?</span>
        </h2>
        <p style={{ color: muted, fontSize: '1rem', marginBottom: '2.5rem' }}>
          Tell us what you need. We&apos;ll tell you how to get there.
        </p>
        <Link href="/business/contact" style={{ background: lime, color: '#000', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em', padding: '0.875rem 2.5rem', borderRadius: '2px', textDecoration: 'none', textTransform: 'uppercase' }}>
          Get in Touch
        </Link>
      </section>
    </>
  );
}
