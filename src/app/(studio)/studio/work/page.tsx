import Image from 'next/image';
import Link from 'next/link';
import { getPublishedCaseStudies } from '@/lib/studio/case-studies';

export default async function WorkPage(): Promise<React.ReactElement> {
  const studies = await getPublishedCaseStudies();

  if (studies.length === 0) {
    return (
      <div className="studio-work-index studio-work-empty" style={{ paddingTop: '80px', paddingLeft: '64px', paddingRight: '64px', paddingBottom: '80px' }}>
        <p className="studio-work-kicker">Our Work</p>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 1.5rem', color: '#fff' }}>
          Case studies coming soon.
        </h1>
        <p style={{ color: '#888', fontSize: '1.05rem', maxWidth: 520, lineHeight: 1.6 }}>
          We are preparing a sharper look at the brands, products, and growth systems we build.
        </p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '80px' }}>
      <div style={{ padding: '0 64px 48px', display: 'flex', alignItems: 'baseline', gap: '16px' }}>
        <p className="studio-work-kicker" style={{ margin: 0 }}>Our Work</p>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: '#fff' }}>
          Selected case studies
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {studies.map((study) => {
          const tags = study.services.length > 0 ? study.services : study.tags;
          return (
            <Link
              key={study.id}
              href={`/studio/work/${study.slug}`}
              style={{ display: 'flex', gap: '21.6px', alignItems: 'center', padding: '60px 64px', borderTop: '1px solid #2d2d2d', textDecoration: 'none' }}
            >
              {/* Left: meta */}
              <div style={{ width: 320, flexShrink: 0 }}>
                <h2 style={{ fontSize: '32px', fontWeight: 400, color: '#fff', margin: '0 0 8px', lineHeight: 1.2 }}>
                  {study.client ?? study.title}
                </h2>
                {tags.length > 0 && (
                  <p style={{ fontSize: '14px', color: '#a6a6a6', margin: '0 0 4px' }}>{tags.join(', ')}</p>
                )}
                {study.year && (
                  <p style={{ fontSize: '12px', color: '#989898', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{study.year}</p>
                )}
              </div>

              {/* Right: cover image */}
              <div style={{ flex: 1, position: 'relative', height: '340px', overflow: 'hidden', background: '#111' }}>
                {study.cover_url && (
                  <Image
                    src={study.cover_url}
                    alt={study.cover_alt ?? study.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'white', mixBlendMode: 'saturation', pointerEvents: 'none' }} aria-hidden />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%,-50%)',
                  background: '#ebefe0',
                  color: '#18191a',
                  fontSize: '15px',
                  fontWeight: 700,
                  padding: '10px',
                  whiteSpace: 'nowrap',
                }}>
                  View Case Study →
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
