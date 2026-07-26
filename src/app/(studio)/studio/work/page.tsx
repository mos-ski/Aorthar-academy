import Image from 'next/image';
import Link from 'next/link';
import { getPublishedCaseStudies } from '@/lib/studio/case-studies';
import { isCaseStudyImageUrl } from '@/lib/studio/case-study-schema';
import './work.css';

export default async function WorkPage(): Promise<React.ReactElement> {
  const studies = await getPublishedCaseStudies();

  if (studies.length === 0) {
    return (
      <section className="studio-work-index studio-work-empty" aria-labelledby="studio-work-heading">
        <p className="studio-work-kicker">Our Work</p>
        <h1 id="studio-work-heading">Case studies coming soon.</h1>
        <p>We are preparing a sharper look at the brands, products, and growth systems we build.</p>
      </section>
    );
  }

  return (
    <section className="studio-work-index">
      <div className="studio-work-index__intro">
        <p className="studio-work-kicker">Our Work</p>
        <h1 id="studio-work-heading">Selected case studies.</h1>
      </div>
      <div className="studio-work-grid" aria-labelledby="studio-work-heading">
        {studies.map((study) => (
          <Link key={study.id} href={`/studio/work/${study.slug}`} className="studio-work-card">
            <div className="studio-work-card__media" aria-hidden={!study.cover_url || !isCaseStudyImageUrl(study.cover_url)}>
              {study.cover_url && isCaseStudyImageUrl(study.cover_url) ? (
                <Image
                  src={study.cover_url}
                  alt={study.cover_alt ?? study.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
              ) : null}
            </div>
            <div className="studio-work-card__meta">
              <h2>{study.title}</h2>
              <p>{[study.client, study.year].filter(Boolean).join(' / ')}</p>
              <span>{study.tags.join(', ')}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
