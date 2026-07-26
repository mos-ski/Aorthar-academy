import { z } from 'zod';

export type StudioCaseStudyStatus = 'draft' | 'published' | 'archived';
export type StudioMediaType = 'image' | 'video';
export type StudioCaseStudyBlockType = 'text' | 'media_row' | 'video' | 'quote' | 'process_notes' | 'credits';

export type StudioCaseStudyBlockRow = {
  id: string;
  case_study_id: string;
  type: string;
  sort_order: number;
  content: unknown;
};

export type StudioCaseStudySummary = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  client: string | null;
  year: string | null;
  tags: string[];
  services: string[];
  cover_url: string | null;
  cover_alt: string | null;
  cover_media_type: StudioMediaType;
  is_featured: boolean;
  display_order: number;
  published_at: string | null;
};

export type StudioCaseStudyAdminSummary = StudioCaseStudySummary & {
  status: StudioCaseStudyStatus;
  updated_at: string;
};

export type StudioCaseStudyDetail = StudioCaseStudySummary & {
  release_date: string | null;
  featured_in: string[];
  preview_video_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  blocks: StudioCaseStudyBlock[];
};

export type StudioCaseStudyAdminDetail = StudioCaseStudyDetail & {
  status: StudioCaseStudyStatus;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type StudioCaseStudyBlock =
  | { id: string; type: 'text'; sort_order: number; body: string }
  | { id: string; type: 'media_row'; sort_order: number; layout: 'single' | 'pair'; items: Array<{ type: StudioMediaType; url: string; alt: string; aspectRatio: string }> }
  | { id: string; type: 'video'; sort_order: number; url: string; coverUrl: string | null; caption: string | null }
  | { id: string; type: 'quote'; sort_order: number; quote: string; name: string | null; role: string | null }
  | { id: string; type: 'process_notes'; sort_order: number; orientation: 'horizontal' | 'vertical'; title: string; body: string; images: Array<{ url: string; alt: string }> }
  | { id: string; type: 'credits'; sort_order: number; items: Array<{ category: string; names: string | null; url: string | null }> };

export type CaseStudyPublishInput = {
  title: string | null;
  slug: string | null;
  subtitle: string | null;
  cover_url: string | null;
  year: string | null;
  release_date: string | null;
  blockCount: number;
};

const mediaItemSchema = z.object({
  type: z.enum(['image', 'video']),
  url: z.string(),
  alt: z.string(),
  aspectRatio: z.string().default(''),
});

const textBlockSchema = z.object({ body: z.string() });
const mediaRowBlockSchema = z.object({
  layout: z.enum(['single', 'pair']),
  items: z.array(mediaItemSchema),
});
const videoBlockSchema = z.object({
  url: z.string(),
  coverUrl: z.string().nullable(),
  caption: z.string().nullable(),
});
const quoteBlockSchema = z.object({
  quote: z.string(),
  name: z.string().nullable(),
  role: z.string().nullable(),
});
const processNotesBlockSchema = z.object({
  orientation: z.enum(['horizontal', 'vertical']),
  title: z.string(),
  body: z.string(),
  images: z.array(z.object({ url: z.string(), alt: z.string() })),
});
const creditsBlockSchema = z.object({
  items: z.array(z.object({
    category: z.string(),
    names: z.string().nullable(),
    url: z.string().nullable(),
  })),
});

export function normalizeCaseStudySlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseCaseStudyBlock(row: StudioCaseStudyBlockRow): StudioCaseStudyBlock {
  const base = { id: row.id, sort_order: row.sort_order };

  switch (row.type) {
    case 'text': {
      const parsed = textBlockSchema.safeParse(row.content);
      return { ...base, type: 'text', body: parsed.success ? parsed.data.body : '' };
    }
    case 'media_row': {
      const parsed = mediaRowBlockSchema.safeParse(row.content);
      return {
        ...base,
        type: 'media_row',
        layout: parsed.success ? parsed.data.layout : 'single',
        items: parsed.success ? parsed.data.items : [],
      };
    }
    case 'video': {
      const parsed = videoBlockSchema.safeParse(row.content);
      return {
        ...base,
        type: 'video',
        url: parsed.success ? parsed.data.url : '',
        coverUrl: parsed.success ? parsed.data.coverUrl : null,
        caption: parsed.success ? parsed.data.caption : null,
      };
    }
    case 'quote': {
      const parsed = quoteBlockSchema.safeParse(row.content);
      return {
        ...base,
        type: 'quote',
        quote: parsed.success ? parsed.data.quote : '',
        name: parsed.success ? parsed.data.name : null,
        role: parsed.success ? parsed.data.role : null,
      };
    }
    case 'process_notes': {
      const parsed = processNotesBlockSchema.safeParse(row.content);
      return {
        ...base,
        type: 'process_notes',
        orientation: parsed.success ? parsed.data.orientation : 'horizontal',
        title: parsed.success ? parsed.data.title : '',
        body: parsed.success ? parsed.data.body : '',
        images: parsed.success ? parsed.data.images : [],
      };
    }
    case 'credits': {
      const parsed = creditsBlockSchema.safeParse(row.content);
      return { ...base, type: 'credits', items: parsed.success ? parsed.data.items : [] };
    }
    default:
      return { ...base, type: 'text', body: '' };
  }
}

export function validateCaseStudyPublish(input: CaseStudyPublishInput): string[] {
  const errors: string[] = [];

  if (!input.title?.trim()) errors.push('Title is required.');
  if (!input.slug?.trim()) errors.push('Slug is required.');
  if (!input.subtitle?.trim()) errors.push('Subtitle is required before publishing.');
  if (!input.cover_url?.trim()) errors.push('Cover URL is required before publishing.');
  if (!input.year?.trim() && !input.release_date) {
    errors.push('Year or release date is required before publishing.');
  }
  if (input.blockCount < 1) errors.push('At least one content block is required before publishing.');

  return errors;
}

export function resolveNextCaseStudy(
  currentId: string,
  studies: StudioCaseStudySummary[],
): StudioCaseStudySummary | null {
  const currentIndex = studies.findIndex((study) => study.id === currentId);
  if (currentIndex === -1 || studies.length < 2) return null;

  return studies[(currentIndex + 1) % studies.length] ?? null;
}
