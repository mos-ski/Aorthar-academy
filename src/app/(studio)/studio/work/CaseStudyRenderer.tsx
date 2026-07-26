import Image from 'next/image';
import Link from 'next/link';
import type {
  StudioCaseStudyBlock,
  StudioCaseStudyDetail,
  StudioCaseStudySummary,
} from '@/lib/studio/case-study-schema';

type Props = {
  study: StudioCaseStudyDetail;
  nextStudy: StudioCaseStudySummary | null;
};

function Media({ alt, src }: { alt: string; src: string }): React.ReactElement {
  return <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 1200px" unoptimized />;
}

function CoverMedia({ study }: Pick<Props, 'study'>): React.ReactElement | null {
  if (!study.cover_url) return null;

  if (study.cover_media_type === 'video') {
    return <video controls playsInline preload="metadata" src={study.cover_url} aria-label={`${study.title} project film`} />;
  }

  return <Media src={study.cover_url} alt={study.cover_alt ?? study.title} />;
}

function TextBlock({ body }: Pick<Extract<StudioCaseStudyBlock, { type: 'text' }>, 'body'>): React.ReactElement | null {
  if (!body) return null;

  return <div className="studio-case-text"><p>{body}</p></div>;
}

function MediaRow({ block }: { block: Extract<StudioCaseStudyBlock, { type: 'media_row' }> }): React.ReactElement | null {
  if (block.items.length === 0) return null;

  return (
    <div className={`studio-case-media-row studio-case-media-row--${block.layout}`}>
      {block.items.map((item, index) => (
        <div className="studio-case-media-row__item" key={`${item.url}-${index}`} style={{ aspectRatio: item.aspectRatio || undefined }}>
          {item.type === 'video' ? <video controls preload="metadata" src={item.url} /> : <Media src={item.url} alt={item.alt} />}
        </div>
      ))}
    </div>
  );
}

function VideoBlock({ block }: { block: Extract<StudioCaseStudyBlock, { type: 'video' }> }): React.ReactElement | null {
  if (!block.url) return null;

  return (
    <figure className="studio-case-video">
      <video controls preload="metadata" poster={block.coverUrl ?? undefined} src={block.url} />
      {block.caption ? <figcaption>{block.caption}</figcaption> : null}
    </figure>
  );
}

function QuoteBlock({ block }: { block: Extract<StudioCaseStudyBlock, { type: 'quote' }> }): React.ReactElement | null {
  if (!block.quote) return null;

  return (
    <figure className="studio-case-quote">
      <blockquote>{block.quote}</blockquote>
      {block.name || block.role ? <figcaption>{[block.name, block.role].filter(Boolean).join(', ')}</figcaption> : null}
    </figure>
  );
}

function ProcessNotesBlock({ block }: { block: Extract<StudioCaseStudyBlock, { type: 'process_notes' }> }): React.ReactElement {
  return (
    <section className={`studio-case-process studio-case-process--${block.orientation}`}>
      <div className="studio-case-process__copy">
        <p className="studio-work-kicker">Process notes</p>
        <h2>{block.title}</h2>
        <p>{block.body}</p>
      </div>
      {block.images.length > 0 ? (
        <div className="studio-case-process__images">
          {block.images.map((image, index) => (
            <div className="studio-case-process__image" key={`${image.url}-${index}`}>
              <Media src={image.url} alt={image.alt} />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function CreditsBlock({ block }: { block: Extract<StudioCaseStudyBlock, { type: 'credits' }> }): React.ReactElement | null {
  if (block.items.length === 0) return null;

  return (
    <section className="studio-case-credits">
      <p className="studio-work-kicker">Credits</p>
      <dl>
        {block.items.map((item, index) => (
          <div key={`${item.category}-${index}`}>
            <dt>{item.category}</dt>
            <dd>{item.url && item.names ? <a href={item.url} target="_blank" rel="noreferrer">{item.names}</a> : item.names}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function CaseStudyRenderer({ nextStudy, study }: Props): React.ReactElement {
  const featuredIn = study.featured_in.filter(Boolean);

  return (
    <article className="studio-case">
      <header className="studio-case-hero">
        <div className="studio-case-hero__media">
          <CoverMedia study={study} />
        </div>
        <div className="studio-case-hero__overlay">
          <p>{[...study.tags, ...study.services].join(' / ')}</p>
          <p>{study.year ?? study.release_date ?? ''}</p>
        </div>
      </header>

      <section className="studio-case-intro">
        <div>
          <p className="studio-work-kicker">Case study</p>
          <h1>{study.title}</h1>
        </div>
        <div className="studio-case-description">
          {study.subtitle ? <p className="studio-case-description__lead">{study.subtitle}</p> : null}
          <p>{study.client ? `Created for ${study.client}.` : 'Aorthar Studio project.'}</p>
        </div>
      </section>

      <section className="studio-case-details" aria-label="Project details">
        <div><p>Client</p><span>{study.client ?? 'Aorthar Studio'}</span></div>
        <div><p>Year</p><span>{study.year ?? study.release_date ?? '—'}</span></div>
        <div><p>Services</p><span>{study.services.join(', ') || '—'}</span></div>
        {featuredIn.length > 0 ? <div><p>Featured in</p><span>{featuredIn.join(', ')}</span></div> : null}
      </section>

      <div className="studio-case-blocks">
        {study.blocks.map((block) => {
          if (block.type === 'text') return <TextBlock key={block.id} body={block.body} />;
          if (block.type === 'media_row') return <MediaRow key={block.id} block={block} />;
          if (block.type === 'video') return <VideoBlock key={block.id} block={block} />;
          if (block.type === 'quote') return <QuoteBlock key={block.id} block={block} />;
          if (block.type === 'process_notes') return <ProcessNotesBlock key={block.id} block={block} />;
          return <CreditsBlock key={block.id} block={block} />;
        })}
      </div>

      {nextStudy ? (
        <Link href={`/studio/work/${nextStudy.slug}`} className="studio-case-next">
          <span>Next project</span>
          <strong>{nextStudy.title}</strong>
          <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </article>
  );
}
