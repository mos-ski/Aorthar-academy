import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getPublishedCaseStudies,
  getPublishedCaseStudyBySlug,
} from '@/lib/studio/case-studies';
import {
  resolveNextCaseStudy,
  type StudioCaseStudyBlock,
  type StudioCaseStudyDetail,
  type StudioCaseStudySummary,
} from '@/lib/studio/case-study-schema';
import './case-study.css';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = await getPublishedCaseStudyBySlug(slug);
  if (!study) return {};

  const ogImage = study.og_image_url ?? study.cover_url;
  return {
    title: study.seo_title ?? `${study.title} — Aorthar Studio`,
    description: study.seo_description ?? study.subtitle ?? undefined,
    openGraph: ogImage
      ? { images: [{ url: ogImage, alt: study.cover_alt ?? study.title }] }
      : undefined,
  };
}

/* ── Sidebar ────────────────────────────────────────────────────────── */

function tocLabel(block: StudioCaseStudyBlock): string | null {
  if (block.type === 'text') {
    const firstLine = block.body.split('\n')[0].trim();
    if (firstLine.length > 0 && firstLine.length <= 48) return firstLine;
    return firstLine.slice(0, 46) + '…';
  }
  if (block.type === 'process_notes') return block.title || 'Process';
  if (block.type === 'quote') return 'Quote';
  if (block.type === 'credits') return 'Credits';
  return null;
}

function Sidebar({ study, blocks }: { study: StudioCaseStudyDetail; blocks: StudioCaseStudyBlock[] }) {
  const tags = study.services.length > 0 ? study.services : study.tags;
  const tocItems = blocks
    .map((b, i) => ({ label: tocLabel(b), id: `block-${i}` }))
    .filter((t): t is { label: string; id: string } => t.label !== null);

  return (
    <aside className="cs-sidebar">
      <Link href="/studio/work" className="cs-sidebar__back">← Work</Link>
      <div className="cs-sidebar__title-area">
        <h1 className="cs-sidebar__name">{study.client ?? study.title}</h1>
        <div className="cs-sidebar__meta">
          {tags.slice(0, 1).map((t, i) => (
            <span key={i} className="cs-sidebar__meta-tag">{t}</span>
          ))}
          {tags.length > 0 && study.year && <span className="cs-sidebar__dot" />}
          {study.year && <span className="cs-sidebar__meta-tag">{study.year}</span>}
        </div>
      </div>

      {tocItems.length > 0 && (
        <nav className="cs-sidebar__toc" aria-label="Sections">
          {tocItems.map((item, i) => (
            <a key={item.id} href={`#${item.id}`} className="cs-sidebar__toc-item" style={i === 0 ? { color: '#fff' } : undefined}>
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </aside>
  );
}

/* ── Block renderers ─────────────────────────────────────────────────── */

function CoverImage({ study }: { study: StudioCaseStudyDetail }) {
  if (!study.cover_url) {
    return <div className="cs-cover" style={{ background: '#111' }} />;
  }
  if (study.cover_media_type === 'video') {
    return (
      <div className="cs-cover">
        <video
          src={study.cover_url}
          autoPlay
          muted
          loop
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }
  return (
    <div className="cs-cover">
      <Image
        src={study.cover_url}
        alt={study.cover_alt ?? study.title}
        fill
        sizes="(max-width: 1024px) 100vw, calc(100vw - 180px)"
        className="cs-cover__img"
        priority
        unoptimized
      />
    </div>
  );
}

function MetadataGrid({ study }: { study: StudioCaseStudyDetail }) {
  const services = study.services;
  const featured = study.featured_in.filter(Boolean);
  if (!study.client && !study.year && services.length === 0 && featured.length === 0) return null;

  return (
    <div className="cs-metadata">
      {study.client && (
        <div className="cs-metadata__col">
          <p className="cs-metadata__label">Client</p>
          <p className="cs-metadata__value">{study.client}</p>
        </div>
      )}
      {study.year && (
        <div className="cs-metadata__col">
          <p className="cs-metadata__label">Year</p>
          <p className="cs-metadata__value">{study.year}</p>
        </div>
      )}
      {services.length > 0 && (
        <div className="cs-metadata__col">
          <p className="cs-metadata__label">Services</p>
          <p className="cs-metadata__value">{services.join('\n')}</p>
        </div>
      )}
      {featured.length > 0 && (
        <div className="cs-metadata__col">
          <p className="cs-metadata__label">Featured In</p>
          <p className="cs-metadata__value">{featured.join('\n')}</p>
        </div>
      )}
    </div>
  );
}

/* Renders a single image or video within a block slot */
function BlockMedia({ url, alt, type }: { url: string; alt: string; type: 'image' | 'video' }) {
  if (type === 'video') {
    return <video src={url} controls preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  }
  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes="(max-width: 1024px) 100vw, calc(100vw - 180px)"
      style={{ objectFit: 'cover' }}
      unoptimized
    />
  );
}

function MediaRowBlock({ block, blockIndex }: { block: Extract<StudioCaseStudyBlock, { type: 'media_row' }>; blockIndex: number }) {
  const { items } = block;
  if (items.length === 0) return null;

  if (items.length === 1) {
    return (
      <div id={`block-${blockIndex}`} className="cs-block-image">
        <BlockMedia url={items[0].url} alt={items[0].alt} type={items[0].type} />
      </div>
    );
  }

  if (items.length === 2) {
    return (
      <div id={`block-${blockIndex}`} className="cs-block-pair">
        {items.map((item, i) => (
          <div key={i} className="cs-block-pair__item">
            <BlockMedia url={item.url} alt={item.alt} type={item.type} />
          </div>
        ))}
      </div>
    );
  }

  // 3 items: 2 stacked on left, 1 tall on right
  const [left1, left2, right] = items;
  return (
    <div id={`block-${blockIndex}`} className="cs-block-trio">
      <div className="cs-block-trio__stack">
        <div className="cs-block-trio__stack-item">
          <BlockMedia url={left1.url} alt={left1.alt} type={left1.type} />
        </div>
        {left2 && (
          <div className="cs-block-trio__stack-item">
            <BlockMedia url={left2.url} alt={left2.alt} type={left2.type} />
          </div>
        )}
      </div>
      <div className="cs-block-trio__main">
        <BlockMedia url={right.url} alt={right.alt} type={right.type} />
      </div>
    </div>
  );
}

function TextBlock({ block, blockIndex, isFirst, study }: {
  block: Extract<StudioCaseStudyBlock, { type: 'text' }>;
  blockIndex: number;
  isFirst: boolean;
  study: StudioCaseStudyDetail;
}) {
  const lines = block.body.split('\n').filter(Boolean);
  const hasShortFirstLine = lines[0] && lines[0].length <= 48;
  const heading = hasShortFirstLine ? lines[0] : study.subtitle ?? '';
  const bodyParagraphs = hasShortFirstLine ? lines.slice(1) : lines;

  return (
    <div id={`block-${blockIndex}`} className="cs-caption">
      <h2 className="cs-caption__heading">{heading}</h2>
      <div className="cs-caption__body">
        {bodyParagraphs.map((p, i) => <p key={i}>{p}</p>)}
        {isFirst && <MetadataGrid study={study} />}
      </div>
    </div>
  );
}

function QuoteBlock({ block, blockIndex }: { block: Extract<StudioCaseStudyBlock, { type: 'quote' }>; blockIndex: number }) {
  return (
    <figure id={`block-${blockIndex}`} className="cs-block-quote">
      <blockquote>{block.quote}</blockquote>
      {(block.name ?? block.role) && (
        <figcaption>{[block.name, block.role].filter(Boolean).join(', ')}</figcaption>
      )}
    </figure>
  );
}

function VideoBlock({ block, blockIndex }: { block: Extract<StudioCaseStudyBlock, { type: 'video' }>; blockIndex: number }) {
  return (
    <div id={`block-${blockIndex}`} className="cs-block-video">
      <video src={block.url} controls preload="metadata" poster={block.coverUrl ?? undefined} />
    </div>
  );
}

function ProcessBlock({ block, blockIndex }: { block: Extract<StudioCaseStudyBlock, { type: 'process_notes' }>; blockIndex: number }) {
  return (
    <section id={`block-${blockIndex}`} className={`cs-block-process cs-block-process--${block.orientation}`}>
      <div className="cs-block-process__copy">
        <h2>{block.title}</h2>
        <p>{block.body}</p>
      </div>
      {block.images.length > 0 && (
        <div className="cs-block-process__images">
          {block.images.map((img, i) => (
            <div key={i} className="cs-block-process__image">
              <Image src={img.url} alt={img.alt} fill style={{ objectFit: 'cover' }} unoptimized />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CreditsBlock({ block, blockIndex }: { block: Extract<StudioCaseStudyBlock, { type: 'credits' }>; blockIndex: number }) {
  if (block.items.length === 0) return null;
  return (
    <section id={`block-${blockIndex}`} className="cs-block-credits">
      <p>Credits</p>
      <dl>
        {block.items.map((item, i) => (
          <div key={i}>
            <dt>{item.category}</dt>
            <dd>
              {item.url && item.names
                ? <a href={item.url} target="_blank" rel="noreferrer">{item.names}</a>
                : item.names}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ── Next project teaser (matches homepage case study style) ─────────── */

function NextProject({ study }: { study: StudioCaseStudySummary }) {
  return (
    <div className="studio-case-section cs-next">
      <div className="studio-case-section__meta">
        <div>
          <p style={{ color: '#a7d252', fontSize: '14px', fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Next</p>
          <h2 className="studio-case-section__client">{study.client ?? study.title}</h2>
        </div>
        <div>
          {(study.services.length > 0 || study.tags.length > 0) && (
            <p className="studio-case-section__tags">
              {(study.services.length > 0 ? study.services : study.tags).join(', ')}
            </p>
          )}
          {study.subtitle && <p className="studio-case-section__desc">{study.subtitle}</p>}
        </div>
      </div>

      <div className="studio-case-section__image-wrap">
        <div className="studio-case-section__saturation" aria-hidden />
        {study.cover_url
          ? <Image src={study.cover_url} alt={study.cover_alt ?? study.title} fill sizes="65vw" className="studio-case-section__image" unoptimized />
          : <div style={{ position: 'absolute', inset: 0, background: '#222' }} />}
        <Link href={`/studio/work/${study.slug}`} className="studio-case-section__cta">
          View Case Study →
        </Link>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default async function StudioCaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = await getPublishedCaseStudyBySlug(slug);
  if (!study) notFound();

  const allStudies = await getPublishedCaseStudies();
  const nextStudy = resolveNextCaseStudy(study.id, allStudies);

  const blocks = study.blocks;
  let firstTextSeen = false;

  return (
    <div className="cs-page">
      <div className="cs-layout">
        <Sidebar study={study} blocks={blocks} />

        <main className="cs-content">
          <CoverImage study={study} />

          {/* If no text blocks, show metadata inline after cover */}
          {!blocks.some((b) => b.type === 'text') && (
            <div className="cs-caption">
              <h2 className="cs-caption__heading">{study.title}</h2>
              <div className="cs-caption__body">
                {study.subtitle && <p>{study.subtitle}</p>}
                <MetadataGrid study={study} />
              </div>
            </div>
          )}

          {blocks.map((block, i) => {
            if (block.type === 'media_row') {
              return <MediaRowBlock key={block.id} block={block} blockIndex={i} />;
            }
            if (block.type === 'text') {
              const isFirst = !firstTextSeen;
              if (isFirst) firstTextSeen = true;
              return <TextBlock key={block.id} block={block} blockIndex={i} isFirst={isFirst} study={study} />;
            }
            if (block.type === 'quote') {
              return <QuoteBlock key={block.id} block={block} blockIndex={i} />;
            }
            if (block.type === 'video') {
              return <VideoBlock key={block.id} block={block} blockIndex={i} />;
            }
            if (block.type === 'process_notes') {
              return <ProcessBlock key={block.id} block={block} blockIndex={i} />;
            }
            if (block.type === 'credits') {
              return <CreditsBlock key={block.id} block={block} blockIndex={i} />;
            }
            return null;
          })}
        </main>
      </div>

      {nextStudy && <NextProject study={nextStudy} />}
    </div>
  );
}
