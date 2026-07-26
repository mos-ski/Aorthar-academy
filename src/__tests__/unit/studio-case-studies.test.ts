import {
  getVimeoEmbedUrl,
  isCaseStudyImageUrl,
  matchesCaseStudySearch,
  normalizeCaseStudySlug,
  parseCaseStudyBlock,
  resolveNextCaseStudy,
  validateCaseStudyBlockContent,
  validateCaseStudyPublish,
} from '@/lib/studio/case-study-schema';
import {
  createCaseStudyListFields,
  parseCaseStudyListFields,
} from '@/lib/studio/case-study-editor';

describe('studio case-study helpers', () => {
  test('normalizes slugs for public work URLs', () => {
    expect(normalizeCaseStudySlug(' Sporting Lagos: Case Study! ')).toBe('sporting-lagos-case-study');
    expect(normalizeCaseStudySlug('Aorthar___Studio')).toBe('aorthar-studio');
  });

  test('validates publish requirements', () => {
    expect(validateCaseStudyPublish({
      title: '',
      slug: '',
      subtitle: '',
      cover_url: '',
      year: '',
      release_date: null,
      blocks: [],
    })).toEqual([
      'Title is required.',
      'Slug is required.',
      'Subtitle is required before publishing.',
      'Cover URL is required before publishing.',
      'Year or release date is required before publishing.',
      'At least one content block is required before publishing.',
    ]);

    expect(validateCaseStudyPublish({
      title: 'Sporting Lagos',
      slug: 'sporting-lagos',
      subtitle: 'A studio case study',
      cover_url: 'http://example.com/cover.jpg',
      year: '2026',
      release_date: null,
      blocks: [{
        id: 'block-1',
        case_study_id: 'case-1',
        type: 'text',
        sort_order: 0,
        content: { body: 'A complete story.' },
      }],
    })).toEqual(['Cover URL must use HTTPS before publishing.']);
  });

  test('rejects empty or malformed persisted blocks when publishing', () => {
    expect(validateCaseStudyPublish({
      title: 'Sporting Lagos',
      slug: 'sporting-lagos',
      subtitle: 'A studio case study',
      cover_url: 'https://example.com/cover.jpg',
      year: '2026',
      release_date: null,
      blocks: [{
        id: 'block-1',
        case_study_id: 'case-1',
        type: 'text',
        sort_order: 0,
        content: { body: '' },
      }],
    })).toEqual([
      'Block 1 (Text) must include body text before publishing.',
      'At least one renderable content block is required before publishing.',
    ]);

    expect(validateCaseStudyPublish({
      title: 'Sporting Lagos',
      slug: 'sporting-lagos',
      subtitle: 'A studio case study',
      cover_url: 'https://example.com/cover.jpg',
      year: '2026',
      release_date: null,
      blocks: [{
        id: 'block-1',
        case_study_id: 'case-1',
        type: 'text',
        sort_order: 0,
        content: { body: 'Visible copy', unexpected: true },
      }],
    })).toEqual([
      'Block 1 (Text) has malformed content.',
      'At least one renderable content block is required before publishing.',
    ]);
  });

  test('accepts blank draft block fields but rejects unknown block structures', () => {
    expect(validateCaseStudyBlockContent('video', {
      url: '',
      coverUrl: null,
      caption: null,
    })).toEqual([]);

    expect(validateCaseStudyBlockContent('video', {
      url: '',
      coverUrl: null,
      caption: null,
      autoplay: true,
    })).toEqual(['Block content has malformed or unknown fields.']);
  });

  test('classifies Vimeo embeds and keeps video URLs out of image sources', () => {
    expect(getVimeoEmbedUrl('https://vimeo.com/123456789')).toBe('https://player.vimeo.com/video/123456789');
    expect(getVimeoEmbedUrl('https://player.vimeo.com/video/987654321?h=abc')).toBe('https://player.vimeo.com/video/987654321?h=abc');
    expect(getVimeoEmbedUrl('https://cdn.example.com/project.mp4')).toBeNull();
    expect(isCaseStudyImageUrl('https://vimeo.com/123456789')).toBe(false);
    expect(isCaseStudyImageUrl('https://cdn.example.com/project.webm?token=abc')).toBe(false);
    expect(isCaseStudyImageUrl('https://cdn.example.com/project-cover.jpg')).toBe(true);
  });

  test('includes services when matching admin search text', () => {
    expect(matchesCaseStudySearch({
      title: 'Sporting Lagos',
      slug: 'sporting-lagos',
      client: 'Sporting Lagos',
      tags: ['Football'],
      services: ['Brand strategy'],
    }, 'strategy')).toBe(true);
  });

  test('keeps comma-separated metadata as editable strings until save', () => {
    expect(createCaseStudyListFields({
      tags: ['Identity'],
      services: ['Brand strategy', 'Design'],
      featured_in: [],
    })).toEqual({
      tags: 'Identity',
      services: 'Brand strategy, Design',
      featured_in: '',
    });

    expect(parseCaseStudyListFields({
      tags: 'Identity, Strategy,',
      services: 'Brand strategy, Design',
      featured_in: 'Brand New,',
    })).toEqual({
      tags: ['Identity', 'Strategy'],
      services: ['Brand strategy', 'Design'],
      featured_in: ['Brand New'],
    });
  });

  test('parses known block rows and falls back safely', () => {
    expect(parseCaseStudyBlock({
      id: 'block-1',
      case_study_id: 'case-1',
      type: 'text',
      sort_order: 1,
      content: { body: 'First paragraph' },
    })).toMatchObject({ type: 'text', body: 'First paragraph' });

    expect(parseCaseStudyBlock({
      id: 'block-2',
      case_study_id: 'case-1',
      type: 'media_row',
      sort_order: 2,
      content: { layout: 'pair', items: [{ type: 'image', url: 'https://example.com/a.jpg', alt: 'A' }] },
    })).toMatchObject({ type: 'media_row', layout: 'pair' });

    expect(parseCaseStudyBlock({
      id: 'block-3',
      case_study_id: 'case-1',
      type: 'media_row',
      sort_order: 3,
      content: { layout: 'single', items: [{ type: 'image', url: '/relative.jpg', alt: 'Invalid' }] },
    })).toMatchObject({ type: 'media_row', layout: 'single', items: [] });

    expect(parseCaseStudyBlock({
      id: 'block-4',
      case_study_id: 'case-1',
      type: 'unknown',
      sort_order: 4,
      content: {},
    })).toMatchObject({ type: 'text', body: '' });
  });

  test('resolves the next published project by ordered list', () => {
    const studies = [
      { id: 'a', slug: 'alpha', title: 'Alpha', subtitle: null, client: null, year: '2026', tags: [], services: [], cover_url: null, cover_alt: null, cover_media_type: 'image' as const, is_featured: false, display_order: 1, published_at: '2026-01-01T00:00:00Z' },
      { id: 'b', slug: 'beta', title: 'Beta', subtitle: null, client: null, year: '2026', tags: [], services: [], cover_url: null, cover_alt: null, cover_media_type: 'image' as const, is_featured: false, display_order: 2, published_at: '2026-01-02T00:00:00Z' },
    ];

    expect(resolveNextCaseStudy('a', studies)?.slug).toBe('beta');
    expect(resolveNextCaseStudy('b', studies)?.slug).toBe('alpha');
    expect(resolveNextCaseStudy('missing', studies)).toBeNull();
  });
});
