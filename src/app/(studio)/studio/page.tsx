import Link from 'next/link';
import Image from 'next/image';
import { getPublishedCaseStudies } from '@/lib/studio/case-studies';
import type { StudioCaseStudySummary } from '@/lib/studio/case-study-schema';

const aboutParagraphs = [
  'Aorthar is a design studio centred on the premise of More New, Less Déjà Vu. More new ideas, less "this reminds me of this." We appreciate what exists in the past, but we are adamantly opposed to mindless repetition. We believe there are more new things in the world than old ones, so we strive to discover and adapt that newness in everything we create.',
  'We believe beauty is a function, so execution and aesthetics exist in harmony — like synchronised swimmers, neither taking the glory.',
  'Our studio is both big and small. Grounded in the deeply researched thinking of a large agency, with the enhanced attention to detail of a small studio. We are a close-knit, masterful team of highly skilled craftspeople with access to an extended network of partners and collaborators. This ensures we tell the most compelling version of your brand story, in ways that move people and turn customers into fans.',
  'For the past 5 years, Aorthar has helped define multiple industries. Our outcomes are not defined by a house style, nor by allegiance to a single medium or method. We have tackled every kind of brief, continue to expand what we take on, and thrive on pushing our work into new territory each time.',
  'We are ecstatic about building brand worlds. Through strategy, research, architecture, fabrication, graphic design, and copywriting, we collectively create expansive brand universes that continue to grow, telling larger stories while solving real business problems.',
  'We are here for people and businesses with an unshakable belief in seeing new things, and less déjà vu.',
];

function CaseStudySection({ study }: { study: StudioCaseStudySummary }) {
  const tags = study.services.length > 0 ? study.services : study.tags;

  return (
    <section className="studio-case-section">
      <div className="studio-case-section__meta">
        <h2 className="studio-case-section__client">{study.client ?? study.title}</h2>
        <div>
          {tags.length > 0 && (
            <p className="studio-case-section__tags">{tags.join(', ')}</p>
          )}
          {study.subtitle && (
            <p className="studio-case-section__desc">{study.subtitle}</p>
          )}
        </div>
      </div>

      <div className="studio-case-section__image-wrap">
        <div className="studio-case-section__saturation" aria-hidden />
        {study.cover_url ? (
          <Image
            src={study.cover_url}
            alt={study.cover_alt ?? study.title}
            fill
            sizes="(max-width: 1024px) 100vw, 65vw"
            className="studio-case-section__image"
            unoptimized
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: '#222' }} />
        )}
        <Link href={`/studio/work/${study.slug}`} className="studio-case-section__cta">
          View Case Study →
        </Link>
      </div>
    </section>
  );
}

export default async function StudioHome() {
  const studies = await getPublishedCaseStudies();

  return (
    <>
      {/* Hero */}
      <div className="studio-hero">
        <h1 className="studio-hero__headline">
          We build brands<br />that dominate
        </h1>
        <div>
          <p className="studio-hero__body">
            We are a Lagos-based creative agency, operating across the spectrum of strategy and design, creating more new, less déjà vu
          </p>
        </div>
        <div className="studio-hero__ctas">
          <Link
            href="/studio/contact"
            style={{
              background: '#a7d252',
              color: '#000',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 800,
              fontSize: '12.24px',
              letterSpacing: '0.962px',
              textTransform: 'uppercase',
              padding: '12.6px 28.8px',
              borderRadius: '2px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Start a Project
          </Link>
          <Link
            href="/studio/packages"
            style={{
              border: '1px solid #b1b1b1',
              color: '#dbdbdb',
              fontWeight: 600,
              fontSize: '12.24px',
              letterSpacing: '0.4724px',
              padding: '13.6px 29.8px',
              borderRadius: '2px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            View Packages
          </Link>
        </div>
      </div>

      {/* Case Studies */}
      {studies.map((study) => (
        <CaseStudySection key={study.id} study={study} />
      ))}

      {/* About */}
      <div className="studio-about-section">
        <div style={{ paddingTop: '80px', paddingBottom: '42px' }}>
          <hr className="studio-about-section__rule" />
        </div>
        <div className="studio-about-section__inner">
          <p className="studio-about-section__label">About Us</p>
          <div className="studio-about-section__body">
            {aboutParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
