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
  | { id: string; type: 'media_row'; sort_order: number; layout: 'single' | 'pair'; items: Array<{ type: StudioMediaType; url: string; alt: string; aspectRatio: string; objectPosition?: string }> }
  | { id: string; type: 'video'; sort_order: number; url: string; coverUrl: string | null; caption: string | null }
  | { id: string; type: 'quote'; sort_order: number; quote: string; name: string | null; role: string | null }
  | { id: string; type: 'process_notes'; sort_order: number; orientation: 'horizontal' | 'vertical'; title: string; body: string; images: Array<{ url: string; alt: string }> }
  | { id: string; type: 'credits'; sort_order: number; items: Array<{ category: string; names: string | null; url: string | null }> };

export type CaseStudyPublishInput = {
  title: string | null;
  slug: string | null;
  subtitle: string | null;
  cover_url: string | null;
  cover_media_type?: StudioMediaType;
  preview_video_url?: string | null;
  og_image_url?: string | null;
  year: string | null;
  release_date: string | null;
  blocks: StudioCaseStudyBlockRow[];
};

export type StudioCaseStudyPublishRecord = Omit<CaseStudyPublishInput, 'blocks'> & {
  status: StudioCaseStudyStatus;
};

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

const httpsUrlSchema = z.string().url().refine(
  isHttpsUrl,
  'URL must use HTTPS.',
);

const draftMediaItemSchema = z.object({
  type: z.enum(['image', 'video']),
  url: z.string(),
  alt: z.string(),
  aspectRatio: z.string(),
  objectPosition: z.string().optional(),
}).strict();

const draftTextBlockSchema = z.object({ body: z.string() }).strict();
const draftMediaRowBlockSchema = z.object({
  layout: z.enum(['single', 'pair']),
  items: z.array(draftMediaItemSchema).max(2),
}).strict();
const draftVideoBlockSchema = z.object({
  url: z.string(),
  coverUrl: z.string().nullable(),
  caption: z.string().nullable(),
}).strict();
const draftQuoteBlockSchema = z.object({
  quote: z.string(),
  name: z.string().nullable(),
  role: z.string().nullable(),
}).strict();
const draftProcessNotesBlockSchema = z.object({
  orientation: z.enum(['horizontal', 'vertical']),
  title: z.string(),
  body: z.string(),
  images: z.array(z.object({ url: z.string(), alt: z.string() }).strict()),
}).strict();
const draftCreditsBlockSchema = z.object({
  items: z.array(z.object({
    category: z.string(),
    names: z.string().nullable(),
    url: z.string().nullable(),
  }).strict()),
}).strict();

const mediaItemSchema = z.object({
  type: z.enum(['image', 'video']),
  url: httpsUrlSchema,
  alt: z.string(),
  aspectRatio: z.string().default(''),
  objectPosition: z.string().optional(),
}).strict();

const textBlockSchema = z.object({ body: z.string() }).strict();
const mediaRowBlockSchema = z.object({
  layout: z.enum(['single', 'pair']),
  items: z.array(mediaItemSchema),
}).strict();
const videoBlockSchema = z.object({
  url: httpsUrlSchema,
  coverUrl: httpsUrlSchema.nullable(),
  caption: z.string().nullable(),
}).strict();
const quoteBlockSchema = z.object({
  quote: z.string(),
  name: z.string().nullable(),
  role: z.string().nullable(),
}).strict();
const processNotesBlockSchema = z.object({
  orientation: z.enum(['horizontal', 'vertical']),
  title: z.string(),
  body: z.string(),
  images: z.array(z.object({ url: httpsUrlSchema, alt: z.string() }).strict()),
}).strict();
const creditsBlockSchema = z.object({
  items: z.array(z.object({
    category: z.string(),
    names: z.string().nullable(),
    url: z.string().nullable(),
  }).strict()),
}).strict();

const draftBlockSchemas = {
  text: draftTextBlockSchema,
  media_row: draftMediaRowBlockSchema,
  video: draftVideoBlockSchema,
  quote: draftQuoteBlockSchema,
  process_notes: draftProcessNotesBlockSchema,
  credits: draftCreditsBlockSchema,
} as const;

const blockLabels: Record<StudioCaseStudyBlockType, string> = {
  text: 'Text',
  media_row: 'Media row',
  video: 'Video',
  quote: 'Quote',
  process_notes: 'Process notes',
  credits: 'Credits',
};

function isCaseStudyBlockType(value: unknown): value is StudioCaseStudyBlockType {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(draftBlockSchemas, value);
}

function isLikelyVideoUrl(value: string): boolean {
  const vimeoUrl = getVimeoEmbedUrl(value);
  if (vimeoUrl) return true;

  try {
    const pathname = new URL(value).pathname.toLowerCase();
    return /\.(mp4|m4v|webm|ogv|ogg|mov)$/.test(pathname);
  } catch {
    return false;
  }
}

function publishBlockIssues(row: StudioCaseStudyBlockRow, index: number): { errors: string[]; renderable: boolean } {
  if (!isCaseStudyBlockType(row.type)) {
    return { errors: [`Block ${index + 1} has an invalid type.`], renderable: false };
  }

  const label = blockLabels[row.type];
  const parsed = draftBlockSchemas[row.type].safeParse(row.content);
  if (!parsed.success) {
    return { errors: [`Block ${index + 1} (${label}) has malformed content.`], renderable: false };
  }

  switch (row.type) {
    case 'text': {
      const content = draftTextBlockSchema.parse(row.content);
      return content.body.trim()
        ? { errors: [], renderable: true }
        : { errors: [`Block ${index + 1} (${label}) must include body text before publishing.`], renderable: false };
    }
    case 'media_row': {
      const content = draftMediaRowBlockSchema.parse(row.content);
      if (content.items.length === 0) {
        return { errors: [`Block ${index + 1} (${label}) must include media before publishing.`], renderable: false };
      }
      const hasInvalidMedia = content.items.some((item) => {
        if (!isHttpsUrl(item.url)) return true;
        return item.type === 'image' && !isCaseStudyImageUrl(item.url);
      });
      return hasInvalidMedia
        ? { errors: [`Block ${index + 1} (${label}) has an invalid media URL.`], renderable: false }
        : { errors: [], renderable: true };
    }
    case 'video': {
      const content = draftVideoBlockSchema.parse(row.content);
      if (!isHttpsUrl(content.url)) {
        return { errors: [`Block ${index + 1} (${label}) must include an HTTPS video URL before publishing.`], renderable: false };
      }
      if (content.coverUrl && !isCaseStudyImageUrl(content.coverUrl)) {
        return { errors: [`Block ${index + 1} (${label}) cover must be an HTTPS image URL.`], renderable: false };
      }
      return { errors: [], renderable: true };
    }
    case 'quote': {
      const content = draftQuoteBlockSchema.parse(row.content);
      return content.quote.trim()
        ? { errors: [], renderable: true }
        : { errors: [`Block ${index + 1} (${label}) must include quote text before publishing.`], renderable: false };
    }
    case 'process_notes': {
      const content = draftProcessNotesBlockSchema.parse(row.content);
      if (!content.title.trim() || !content.body.trim()) {
        return { errors: [`Block ${index + 1} (${label}) must include a title and body before publishing.`], renderable: false };
      }
      if (content.images.some((image) => !isCaseStudyImageUrl(image.url))) {
        return { errors: [`Block ${index + 1} (${label}) has an invalid image URL.`], renderable: false };
      }
      return { errors: [], renderable: true };
    }
    case 'credits': {
      const content = draftCreditsBlockSchema.parse(row.content);
      const hasInvalidCredit = content.items.length === 0 || content.items.some((item) => (
        !item.category.trim()
        || !item.names?.trim()
        || Boolean(item.url && !isHttpsUrl(item.url))
      ));
      return hasInvalidCredit
        ? { errors: [`Block ${index + 1} (${label}) must include complete credit entries before publishing.`], renderable: false }
        : { errors: [], renderable: true };
    }
  }
}

export function normalizeCaseStudySlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getVimeoEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;

    const hostname = url.hostname.toLowerCase();
    if (hostname === 'player.vimeo.com') {
      return /^\/video\/\d+/.test(url.pathname) ? url.toString() : null;
    }
    if (hostname !== 'vimeo.com' && hostname !== 'www.vimeo.com') return null;

    const videoId = url.pathname.split('/').filter(Boolean).findLast((part) => /^\d+$/.test(part));
    return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
  } catch {
    return null;
  }
}

export function isCaseStudyImageUrl(value: string): boolean {
  return isHttpsUrl(value) && !isLikelyVideoUrl(value);
}

export function validateCaseStudyBlockContent(type: unknown, content: unknown): string[] {
  if (!isCaseStudyBlockType(type)) return ['Invalid block type.'];
  return draftBlockSchemas[type].safeParse(content).success
    ? []
    : ['Block content has malformed or unknown fields.'];
}

export function matchesCaseStudySearch(
  study: Pick<StudioCaseStudyAdminSummary, 'title' | 'slug' | 'client' | 'tags' | 'services'>,
  query: string,
): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [
    study.title,
    study.slug,
    study.client ?? '',
    ...study.tags,
    ...study.services,
  ].some((value) => value.toLowerCase().includes(normalizedQuery));
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
  if (!input.cover_url?.trim()) {
    errors.push('Cover URL is required before publishing.');
  } else if (!httpsUrlSchema.safeParse(input.cover_url.trim()).success) {
    errors.push('Cover URL must use HTTPS before publishing.');
  } else if (!isCaseStudyImageUrl(input.cover_url.trim())) {
    errors.push('Cover URL must be an image before publishing.');
  }
  if (input.preview_video_url?.trim() && !isHttpsUrl(input.preview_video_url.trim())) {
    errors.push('Preview video URL must use HTTPS before publishing.');
  }
  if (input.og_image_url?.trim() && !isCaseStudyImageUrl(input.og_image_url.trim())) {
    errors.push('Open Graph image URL must be an HTTPS image before publishing.');
  }
  if (!input.year?.trim() && !input.release_date) {
    errors.push('Year or release date is required before publishing.');
  }

  let renderableBlockCount = 0;
  input.blocks.forEach((block, index) => {
    const result = publishBlockIssues(block, index);
    errors.push(...result.errors);
    if (result.renderable) renderableBlockCount += 1;
  });
  if (renderableBlockCount < 1) {
    errors.push(input.blocks.length === 0
      ? 'At least one content block is required before publishing.'
      : 'At least one renderable content block is required before publishing.');
  }

  return errors;
}

export function validatePublishedCaseStudyState(
  study: StudioCaseStudyPublishRecord,
  blocks: StudioCaseStudyBlockRow[],
): string[] {
  if (study.status !== 'published') return [];
  return validateCaseStudyPublish({ ...study, blocks });
}

export function resolveNextCaseStudy(
  currentId: string,
  studies: StudioCaseStudySummary[],
): StudioCaseStudySummary | null {
  const currentIndex = studies.findIndex((study) => study.id === currentId);
  if (currentIndex === -1 || studies.length < 2) return null;

  return studies[(currentIndex + 1) % studies.length] ?? null;
}
