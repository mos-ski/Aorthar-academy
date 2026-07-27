'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { ReactElement, CSSProperties } from 'react';
import type { StudioCaseStudyAdminDetail, StudioCaseStudyBlock } from '@/lib/studio/case-study-schema';

const ROW_H = 300;
const CANVAS_BG = '#0f1112';
const BLOCK_BG = '#18191a';
const TEXT_PRIMARY = '#ebefe0';
const TEXT_MUTED = '#6b6b6b';
const ACCENT = '#a7d252';
const BORDER = '#2a2a2a';

// ── Block renderers ────────────────────────────────────────────────────────────

function PreviewMediaBlock({ block }: { block: Extract<StudioCaseStudyBlock, { type: 'media_row' }> }): ReactElement {
  const rowH = block.height ?? ROW_H;
  const isTrio = block.layout === 'trio-left' || block.layout === 'trio-right';

  function cell(idx: number, style?: CSSProperties): ReactElement {
    const item = block.items[idx];
    return (
      <div key={idx} style={{ position: 'relative', overflow: 'hidden', background: '#080808', ...style }}>
        {item?.url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={item.url} alt={item.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: item.objectPosition ?? '50% 50%', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT_MUTED, fontSize: 12 }}>No image</div>
        }
      </div>
    );
  }

  if (isTrio) {
    const isLeft = block.layout === 'trio-left';
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: `${rowH}px ${rowH}px`, gap: 2 }}>
        {isLeft
          ? <>{cell(0, { gridRow: '1 / 3', gridColumn: '1', height: rowH * 2 + 2 })}{cell(1, { height: rowH })}{cell(2, { height: rowH })}</>
          : <>{cell(1, { height: rowH, gridRow: '1', gridColumn: '1' })}{cell(0, { gridRow: '1 / 3', gridColumn: '2', height: rowH * 2 + 2 })}{cell(2, { height: rowH, gridRow: '2', gridColumn: '1' })}</>
        }
      </div>
    );
  }
  if (block.layout === 'pair') {
    return <div style={{ display: 'flex', gap: 2 }}>{cell(0, { flex: '1', height: rowH })}{cell(1, { flex: '1', height: rowH })}</div>;
  }
  return cell(0, { width: '100%', height: rowH });
}

function PreviewTextBlock({ block }: { block: Extract<StudioCaseStudyBlock, { type: 'text' }> }): ReactElement {
  return (
    <>
      <div className="preview-prose" style={{ background: BLOCK_BG, padding: '20px 24px', color: TEXT_PRIMARY }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: block.body }}
      />
      <style>{`.preview-prose h1{font-size:2rem;font-weight:700;margin:.5em 0 .25em;color:${TEXT_PRIMARY}}.preview-prose h2{font-size:1.4rem;font-weight:700;margin:.5em 0 .25em;color:${TEXT_PRIMARY}}.preview-prose p{margin:0 0 .75em;font-size:16px;line-height:1.8;color:${TEXT_PRIMARY}}.preview-prose strong{font-weight:700}.preview-prose em{font-style:italic}.preview-prose ul{list-style:disc;padding-left:1.5rem;margin:.25rem 0;color:${TEXT_PRIMARY}}.preview-prose ol{list-style:decimal;padding-left:1.5rem;margin:.25rem 0;color:${TEXT_PRIMARY}}`}</style>
    </>
  );
}

function PreviewVideoBlock({ block }: { block: Extract<StudioCaseStudyBlock, { type: 'video' }> }): ReactElement {
  const vimeoMatch = block.url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const embedUrl = vimeoMatch ? `https://player.vimeo.com/video/${vimeoMatch[1]}` : null;
  const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(block.url);
  return (
    <div style={{ background: BLOCK_BG, overflow: 'hidden', aspectRatio: '16/9' }}>
      {embedUrl
        ? <iframe src={embedUrl} style={{ width: '100%', height: '100%', border: 'none' }} allow="autoplay; fullscreen" allowFullScreen title="Video" />
        : isDirectVideo
          // eslint-disable-next-line jsx-a11y/media-has-caption
          ? <video src={block.url} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT_MUTED }}>{block.url || 'No video'}</div>
      }
    </div>
  );
}

function PreviewQuoteBlock({ block }: { block: Extract<StudioCaseStudyBlock, { type: 'quote' }> }): ReactElement {
  return (
    <div style={{ background: BLOCK_BG, padding: '32px 40px', borderLeft: `3px solid ${ACCENT}` }}>
      <p style={{ color: TEXT_PRIMARY, fontSize: 22, fontStyle: 'italic', lineHeight: 1.55, margin: '0 0 16px' }}>{block.quote}</p>
      {(block.name ?? block.role) && (
        <div style={{ display: 'flex', gap: 16 }}>
          {block.name && <span style={{ color: TEXT_MUTED, fontSize: 13 }}>{block.name}</span>}
          {block.role && <span style={{ color: TEXT_MUTED, fontSize: 13 }}>{block.role}</span>}
        </div>
      )}
    </div>
  );
}

function PreviewProcessNotesBlock({ block }: { block: Extract<StudioCaseStudyBlock, { type: 'process_notes' }> }): ReactElement {
  const isHorizontal = block.orientation === 'horizontal';
  return (
    <div style={{ background: BLOCK_BG, padding: '32px 40px', display: 'flex', flexDirection: isHorizontal ? 'row' : 'column', gap: 32, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 240 }}>
        {block.title && <p style={{ color: TEXT_PRIMARY, fontSize: 18, fontWeight: 600, margin: '0 0 12px' }}>{block.title}</p>}
        <p style={{ color: TEXT_MUTED, fontSize: 15, lineHeight: 1.7, margin: 0 }}>{block.body}</p>
      </div>
      {block.images.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {block.images.map((img, i) => (
            img.url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img key={i} src={img.url} alt={img.alt} style={{ height: 180, width: 'auto', objectFit: 'cover', display: 'block' }} />
              : null
          ))}
        </div>
      )}
    </div>
  );
}

function PreviewCreditsBlock({ block }: { block: Extract<StudioCaseStudyBlock, { type: 'credits' }> }): ReactElement {
  return (
    <div style={{ background: BLOCK_BG, padding: '32px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 24 }}>
      {block.items.map((item, i) => (
        <div key={i}>
          <p style={{ color: TEXT_MUTED, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>{item.category}</p>
          {item.url
            ? <a href={item.url} target="_blank" rel="noreferrer" style={{ color: ACCENT, fontSize: 14, textDecoration: 'none' }}>{item.names ?? item.category}</a>
            : <p style={{ color: TEXT_PRIMARY, fontSize: 14, margin: 0 }}>{item.names}</p>
          }
        </div>
      ))}
    </div>
  );
}

function BlockRenderer({ block }: { block: StudioCaseStudyBlock }): ReactElement {
  switch (block.type) {
    case 'media_row': return <PreviewMediaBlock block={block} />;
    case 'text': return <PreviewTextBlock block={block} />;
    case 'video': return <PreviewVideoBlock block={block} />;
    case 'quote': return <PreviewQuoteBlock block={block} />;
    case 'process_notes': return <PreviewProcessNotesBlock block={block} />;
    case 'credits': return <PreviewCreditsBlock block={block} />;
  }
}

// ── Main PreviewPage ───────────────────────────────────────────────────────────

export default function PreviewPage({ study }: { study: StudioCaseStudyAdminDetail }): ReactElement {
  const { topics, blocks } = study;
  const [activeTopicId, setActiveTopicId] = useState<string | null>(topics[0]?.id ?? null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const refs = sectionRefs.current;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) {
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        const id = topmost.target.getAttribute('data-topic-id');
        if (id) setActiveTopicId(id);
      }
    }, { threshold: 0, rootMargin: '-10% 0px -60% 0px' });

    for (const el of refs.values()) observer.observe(el);
    return () => observer.disconnect();
  }, [topics]);

  function scrollToTopic(topicId: string): void {
    const el = sectionRefs.current.get(topicId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveTopicId(topicId);
  }

  const untopicked = blocks.filter((b) => b.topic_id == null);

  return (
    <div style={{ position: 'fixed', inset: 0, background: CANVAS_BG, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 28px', borderBottom: `1px solid ${BORDER}`, background: '#18191a', flexShrink: 0 }}>
        <Link href={`/admin/studio/work/${study.id}`} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textDecoration: 'none' }}>← Editor</Link>
        <span style={{ color: TEXT_PRIMARY, fontSize: 15, fontWeight: 600 }}>{study.title}</span>
        <span style={{ color: ACCENT, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Preview</span>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* Sticky left nav — only shown when there are topics */}
        {topics.length > 0 && (
          <nav style={{ width: 220, flexShrink: 0, borderRight: `1px solid ${BORDER}`, overflowY: 'auto', paddingTop: 32 }}>
            <p style={{ color: '#555', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px', padding: '0 16px', fontWeight: 600 }}>Contents</p>
            {topics.map((topic) => (
              <button key={topic.id} type="button"
                onClick={() => scrollToTopic(topic.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none',
                  borderLeft: `2px solid ${activeTopicId === topic.id ? ACCENT : 'transparent'}`,
                  color: activeTopicId === topic.id ? TEXT_PRIMARY : '#989898',
                  fontSize: 14, padding: '7px 16px', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'color 0.15s, border-color 0.15s',
                }}>
                {topic.title}
              </button>
            ))}
          </nav>
        )}

        {/* Scrollable content */}
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 120 }}>

          {/* Cover image */}
          {study.cover_url && study.cover_media_type === 'image' && (
            <div style={{ width: '100%', height: 480, overflow: 'hidden', marginBottom: 2 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={study.cover_url} alt={study.cover_alt ?? study.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Project header */}
          <div style={{ padding: '48px 48px 32px 56px', maxWidth: 960, margin: '0 auto' }}>
            {(study.client ?? study.year) && (
              <p style={{ color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px', fontWeight: 600 }}>
                {[study.client, study.year].filter(Boolean).join(' · ')}
              </p>
            )}
            <h1 style={{ color: TEXT_PRIMARY, fontSize: 40, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{study.title}</h1>
            {study.subtitle && <p style={{ color: TEXT_MUTED, fontSize: 18, lineHeight: 1.55, margin: 0 }}>{study.subtitle}</p>}
          </div>

          {/* Untopicked blocks */}
          {untopicked.length > 0 && (
            <div style={{ maxWidth: 960, margin: '0 auto 32px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {untopicked.map((b) => <BlockRenderer key={b.id} block={b} />)}
            </div>
          )}

          {/* Topic sections */}
          {topics.map((topic) => {
            const topicBlocks = blocks.filter((b) => b.topic_id === topic.id);
            return (
              <section key={topic.id} data-topic-id={topic.id}
                ref={(el) => {
                  if (el) sectionRefs.current.set(topic.id, el);
                  else sectionRefs.current.delete(topic.id);
                }}
                style={{ scrollMarginTop: 24 }}>
                <div style={{ padding: '56px 48px 24px 56px', maxWidth: 960, margin: '0 auto' }}>
                  <h2 style={{ color: TEXT_PRIMARY, fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.2, letterSpacing: '-0.015em' }}>{topic.title}</h2>
                </div>
                <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 8 }}>
                  {topicBlocks.length > 0
                    ? topicBlocks.map((b) => <BlockRenderer key={b.id} block={b} />)
                    : <p style={{ color: TEXT_MUTED, fontSize: 14, padding: '16px 48px 16px 56px', margin: 0 }}>No content yet</p>
                  }
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}
