import Link from 'next/link';

const lime = '#a7d252';
const muted = '#888';
const border = '#1f1f1f';
const surface = '#111';
const green = '#08694a';

const packages = [
  {
    name: 'Brand Starter',
    price: '₦350,000',
    category: 'Branding',
    description: 'Everything you need to launch with a professional identity.',
    includes: [
      'Logo design (3 concepts, 2 revisions)',
      'Colour palette & typography',
      'Brand guidelines (PDF)',
      'Social media kit (profile + cover sizes)',
    ],
    cta: 'Get Your Brand',
    featured: false,
  },
  {
    name: 'Content Engine',
    price: '₦200,000 / mo',
    category: 'Marketing',
    description: 'A done-for-you content operation that runs every month.',
    includes: [
      'Monthly content strategy session',
      '12 social media posts (captions + graphics)',
      '2 long-form articles or newsletters',
      'UGC brief + creator outreach (up to 3 creators)',
    ],
    cta: 'Start the Engine',
    featured: true,
  },
  {
    name: 'MVP Launch',
    price: 'From ₦1,500,000',
    category: 'Product',
    description: 'A fully functional web or mobile MVP, shipped in 6 weeks.',
    includes: [
      'Discovery & scoping session',
      'UI/UX design (Figma)',
      'Full-stack development (Next.js or React Native)',
      'Deployment + 30-day post-launch support',
    ],
    cta: 'Build My MVP',
    featured: false,
  },
  {
    name: 'Full Agency Retainer',
    price: 'Custom',
    category: 'All Services',
    description: 'Marketing, branding, and product working together under one roof.',
    includes: [
      'Dedicated account lead',
      'Monthly strategy + content',
      'Ongoing brand management',
      'Product iteration sprints',
    ],
    cta: "Let's Talk",
    featured: false,
  },
];

export default function PackagesPage() {
  return (
    <div className="biz-section">
      <p style={{ color: lime, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
        Packages & Pricing
      </p>
      <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
        No surprises.<br />Just results.
      </h1>
      <p style={{ color: muted, fontSize: '1.05rem', maxWidth: 520, lineHeight: 1.6, marginBottom: '5rem' }}>
        Every package is a starting point. We customise scope, timeline, and budget to fit your specific needs — just reach out.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {packages.map((pkg) => (
          <div key={pkg.name} style={{ background: pkg.featured ? green : surface, border: `1px solid ${pkg.featured ? green : border}`, borderRadius: '4px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
            {pkg.featured && (
              <div style={{ position: 'absolute', top: '-1px', right: '1.5rem', background: lime, color: '#000', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', padding: '0.3rem 0.75rem', textTransform: 'uppercase' }}>
                Popular
              </div>
            )}
            <div>
              <p style={{ color: pkg.featured ? lime : muted, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{pkg.category}</p>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800 }}>{pkg.name}</h2>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', color: pkg.featured ? '#fff' : lime }}>{pkg.price}</div>
            <p style={{ color: pkg.featured ? 'rgba(255,255,255,0.7)' : muted, fontSize: '0.9rem', lineHeight: 1.5 }}>{pkg.description}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', flexGrow: 1 }}>
              {pkg.includes.map((item) => (
                <li key={item} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.85rem', color: pkg.featured ? 'rgba(255,255,255,0.85)' : '#fff', lineHeight: 1.4 }}>
                  <span style={{ color: lime, flexShrink: 0, fontWeight: 700 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/studio/contact" style={{ display: 'block', textAlign: 'center', background: pkg.featured ? lime : 'transparent', color: pkg.featured ? '#000' : lime, border: pkg.featured ? 'none' : `1px solid ${lime}`, fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.06em', padding: '0.75rem', borderRadius: '2px', textDecoration: 'none', textTransform: 'uppercase', marginTop: 'auto' }}>
              {pkg.cta}
            </Link>
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', color: muted, fontSize: '0.85rem', marginTop: '3rem' }}>
        All prices in Nigerian Naira (NGN). Custom scopes available.{' '}
        <Link href="/studio/contact" style={{ color: lime, textDecoration: 'none' }}>Get a quote →</Link>
      </p>
    </div>
  );
}
