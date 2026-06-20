import Link from 'next/link';

const lime = '#a7d252';
const muted = '#888';
const border = '#1f1f1f';

export default function WorkPage() {
  return (
    <div className="biz-section">
      <p style={{ color: lime, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
        Our Work
      </p>
      <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
        Case studies<br />coming soon.
      </h1>
      <p style={{ color: muted, fontSize: '1.05rem', maxWidth: 520, lineHeight: 1.6, marginBottom: '4rem' }}>
        We&apos;re just getting started — but our first clients will be featured right here. Want to be one of them?
      </p>

      <div style={{ border: `1px dashed ${border}`, borderRadius: '4px', padding: '5rem 3rem', textAlign: 'center', maxWidth: 600 }}>
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>→</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Your project could be first.</h2>
        <p style={{ color: muted, fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Early clients get priority attention, founder pricing, and the full weight of our focus. Let&apos;s build something worth showing off.
        </p>
        <Link href="/studio/contact" style={{ background: lime, color: '#000', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.08em', padding: '0.875rem 2rem', borderRadius: '2px', textDecoration: 'none', textTransform: 'uppercase' }}>
          Start a Project
        </Link>
      </div>
    </div>
  );
}
