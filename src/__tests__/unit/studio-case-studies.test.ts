import {
  normalizeCaseStudySlug,
  parseCaseStudyBlock,
  resolveNextCaseStudy,
  validateCaseStudyPublish,
} from '@/lib/studio/case-study-schema';

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
      blockCount: 0,
    })).toEqual([
      'Title is required.',
      'Slug is required.',
      'Subtitle is required before publishing.',
      'Cover URL is required before publishing.',
      'Year or release date is required before publishing.',
      'At least one content block is required before publishing.',
    ]);
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
