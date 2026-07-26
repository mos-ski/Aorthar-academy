# Studio Case Studies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an admin-managed Studio Work CMS and public case-study presentation system for Aorthar Studio.

**Architecture:** Add Supabase tables for case-study metadata and ordered JSONB content blocks. Build typed server helpers and tests first, then replace the static Studio Work page with published database content, add the detail renderer, and finally add admin APIs and editor screens under `Admin > Studio > Work`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase, Tailwind CSS v4, shadcn/ui, Lucide icons, Zod, Sonner, Vitest.

## Global Constraints

- Package manager is `bun`; do not use `npm` or `pnpm`.
- Case studies belong to Studio: public routes are `/studio/work` and `/studio/work/[slug]`; `studio.aorthar.com/work` is handled by existing middleware.
- Admin routes live under `/admin/studio/work`.
- Super admins and content admins can manage case studies; finance admins cannot.
- Public routes must only show `status = 'published'`.
- First version uses external `https://` media URLs; do not build file upload.
- Use structured block forms, not freeform JSON editing.
- Use `createAdminClient()` for admin writes.
- Run `bun run test`, `bun run lint`, and `bun run build` before reporting implementation complete.

---

## File Structure

- `supabase/migrations/20260726000000_studio_case_studies.sql`: creates tables, policies, indexes, and updated timestamps.
- `src/lib/studio/case-study-schema.ts`: Zod schemas, type exports, slug normalization, publish validation, block parsing, next-project helper.
- `src/lib/studio/case-studies.ts`: Supabase fetch helpers for public and admin case-study data.
- `src/__tests__/unit/studio-case-studies.test.ts`: unit coverage for slug normalization, block parsing, publish validation, next-project selection.
- `src/app/(studio)/studio/work/page.tsx`: public Work index powered by published case studies.
- `src/app/(studio)/studio/work/[slug]/page.tsx`: public detail page and metadata.
- `src/app/(studio)/studio/work/CaseStudyRenderer.tsx`: detail renderer for hero, metadata, blocks, credits, and next project.
- `src/app/(studio)/studio/work/work.css`: focused responsive styling for the Work index and case-study detail pages.
- `src/app/api/admin/studio/case-studies/route.ts`: admin list and create API.
- `src/app/api/admin/studio/case-studies/[id]/route.ts`: admin read, update, archive/delete API.
- `src/app/api/admin/studio/case-studies/[id]/blocks/route.ts`: create block API.
- `src/app/api/admin/studio/case-studies/[id]/blocks/[blockId]/route.ts`: update and delete block API.
- `src/app/api/admin/studio/case-studies/[id]/blocks/reorder/route.ts`: reorder block API.
- `src/app/(admin)/admin/studio/work/page.tsx`: admin list page.
- `src/app/(admin)/admin/studio/work/StudioCaseStudiesAdmin.tsx`: client list/search/create/archive/publish UI.
- `src/app/(admin)/admin/studio/work/[id]/page.tsx`: admin editor server page.
- `src/app/(admin)/admin/studio/work/[id]/CaseStudyEditor.tsx`: editor client with tabs and block forms.
- `src/components/layout/Sidebar.tsx`: adds `Work` to the Studio nested admin nav.
- `src/lib/admin/permissions.ts`: maps `/admin/studio/work` and `/api/admin/studio/case-studies` to `content` permission.
- `docs/platform/database-schema.md`: documents the new Studio case-study tables.
- `docs/products/_shared/04-admin-cms.md`: documents `Studio > Work`.

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260726000000_studio_case_studies.sql`
- Modify: `docs/platform/database-schema.md`
- Modify: `docs/products/_shared/04-admin-cms.md`

**Interfaces:**
- Produces table: `public.studio_case_studies`
- Produces table: `public.studio_case_study_blocks`
- Produces public read policy for published rows only.
- Produces admin write policies for admin profiles.

- [ ] **Step 1: Create migration file**

Create `supabase/migrations/20260726000000_studio_case_studies.sql`.

- [ ] **Step 2: Add SQL schema**

Use this SQL as the migration body:

```sql
create table if not exists public.studio_case_studies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  client text,
  release_date date,
  year text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  display_order integer not null default 0,
  tags text[] not null default '{}',
  services text[] not null default '{}',
  featured_in text[] not null default '{}',
  cover_media_type text not null default 'image' check (cover_media_type in ('image', 'video')),
  cover_url text,
  cover_alt text,
  preview_video_url text,
  seo_title text,
  seo_description text,
  og_image_url text,
  created_by uuid references public.profiles(user_id),
  updated_by uuid references public.profiles(user_id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_case_study_blocks (
  id uuid primary key default gen_random_uuid(),
  case_study_id uuid not null references public.studio_case_studies(id) on delete cascade,
  type text not null check (type in ('text', 'media_row', 'video', 'quote', 'process_notes', 'credits')),
  sort_order integer not null default 0,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_case_studies_status_order_idx
  on public.studio_case_studies(status, display_order, published_at);

create index if not exists studio_case_studies_featured_idx
  on public.studio_case_studies(is_featured, display_order);

create index if not exists studio_case_study_blocks_case_order_idx
  on public.studio_case_study_blocks(case_study_id, sort_order);

create or replace function public.set_studio_case_studies_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_studio_case_studies_updated_at on public.studio_case_studies;
create trigger set_studio_case_studies_updated_at
  before update on public.studio_case_studies
  for each row execute function public.set_studio_case_studies_updated_at();

drop trigger if exists set_studio_case_study_blocks_updated_at on public.studio_case_study_blocks;
create trigger set_studio_case_study_blocks_updated_at
  before update on public.studio_case_study_blocks
  for each row execute function public.set_studio_case_studies_updated_at();

alter table public.studio_case_studies enable row level security;
alter table public.studio_case_study_blocks enable row level security;

drop policy if exists "Public can read published studio case studies" on public.studio_case_studies;
create policy "Public can read published studio case studies"
  on public.studio_case_studies
  for select
  using (status = 'published');

drop policy if exists "Admins can manage studio case studies" on public.studio_case_studies;
create policy "Admins can manage studio case studies"
  on public.studio_case_studies
  for all
  using (exists (
    select 1 from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  ))
  with check (exists (
    select 1 from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  ));

drop policy if exists "Public can read published studio case study blocks" on public.studio_case_study_blocks;
create policy "Public can read published studio case study blocks"
  on public.studio_case_study_blocks
  for select
  using (exists (
    select 1 from public.studio_case_studies
    where studio_case_studies.id = studio_case_study_blocks.case_study_id
      and studio_case_studies.status = 'published'
  ));

drop policy if exists "Admins can manage studio case study blocks" on public.studio_case_study_blocks;
create policy "Admins can manage studio case study blocks"
  on public.studio_case_study_blocks
  for all
  using (exists (
    select 1 from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  ))
  with check (exists (
    select 1 from public.profiles
    where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
  ));
```

- [ ] **Step 3: Document database tables**

Add a `Studio Tables` section to `docs/platform/database-schema.md` with the two tables and the exact columns from Step 2.

- [ ] **Step 4: Document admin module**

In `docs/products/_shared/04-admin-cms.md`, add `Work` under Studio management:

```markdown
### Studio Management

| Feature | Route | Description |
|---------|-------|-------------|
| Inquiries | `/admin/studio` | View Studio contact submissions |
| Work | `/admin/studio/work` | Create, edit, publish, and archive Studio case studies |
| Settings | `/admin/studio/settings` | Manage Studio contact details and social links |
```

- [ ] **Step 5: Verify migration references**

Run: `rg -n "studio_case_studies|studio_case_study_blocks" supabase/migrations docs/platform/database-schema.md docs/products/_shared/04-admin-cms.md`

Expected: both table names appear in the migration and database docs.

---

### Task 2: Types, Schemas, Helpers, And Unit Tests

**Files:**
- Create: `src/lib/studio/case-study-schema.ts`
- Create: `src/lib/studio/case-studies.ts`
- Create: `src/__tests__/unit/studio-case-studies.test.ts`

**Interfaces:**
- Produces type: `StudioCaseStudyStatus = 'draft' | 'published' | 'archived'`
- Produces type: `StudioCaseStudySummary`
- Produces type: `StudioCaseStudyAdminSummary`
- Produces type: `StudioCaseStudyDetail`
- Produces type: `StudioCaseStudyAdminDetail`
- Produces type: `StudioCaseStudyBlock`
- Produces function: `normalizeCaseStudySlug(value: string): string`
- Produces function: `parseCaseStudyBlock(row: StudioCaseStudyBlockRow): StudioCaseStudyBlock`
- Produces function: `validateCaseStudyPublish(input: CaseStudyPublishInput): string[]`
- Produces function: `resolveNextCaseStudy(currentId: string, studies: StudioCaseStudySummary[]): StudioCaseStudySummary | null`
- Produces function: `getPublishedCaseStudies(): Promise<StudioCaseStudySummary[]>`
- Produces function: `getPublishedCaseStudyBySlug(slug: string): Promise<StudioCaseStudyDetail | null>`
- Produces function: `getAdminCaseStudies(): Promise<StudioCaseStudyAdminSummary[]>`
- Produces function: `getAdminCaseStudyById(id: string): Promise<StudioCaseStudyAdminDetail | null>`

- [ ] **Step 1: Write failing unit tests**

Create `src/__tests__/unit/studio-case-studies.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify red**

Run: `bun run test src/__tests__/unit/studio-case-studies.test.ts`

Expected: FAIL because `src/lib/studio/case-study-schema.ts` does not exist.

- [ ] **Step 3: Implement schema helper module**

Create `src/lib/studio/case-study-schema.ts` with these exports and signatures:

```ts
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
```

Implement `normalizeCaseStudySlug`, Zod schemas for each block type, `parseCaseStudyBlock`, `validateCaseStudyPublish`, and `resolveNextCaseStudy`.

- [ ] **Step 4: Implement Supabase fetch helpers**

Create `src/lib/studio/case-studies.ts`:

```ts
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  parseCaseStudyBlock,
  type StudioCaseStudyAdminDetail,
  type StudioCaseStudyAdminSummary,
  type StudioCaseStudyDetail,
  type StudioCaseStudySummary,
} from '@/lib/studio/case-study-schema';
```

Implement:

```ts
export async function getPublishedCaseStudies(): Promise<StudioCaseStudySummary[]>
export async function getPublishedCaseStudyBySlug(slug: string): Promise<StudioCaseStudyDetail | null>
export async function getAdminCaseStudies(): Promise<StudioCaseStudyAdminSummary[]>
export async function getAdminCaseStudyById(id: string): Promise<StudioCaseStudyAdminDetail | null>
```

Query published lists with:

```ts
.from('studio_case_studies')
.select('id, slug, title, subtitle, client, year, tags, services, cover_url, cover_alt, cover_media_type, is_featured, display_order, published_at')
.eq('status', 'published')
.order('is_featured', { ascending: false })
.order('display_order', { ascending: true })
.order('published_at', { ascending: false })
```

Fetch detail blocks with:

```ts
.from('studio_case_study_blocks')
.select('id, case_study_id, type, sort_order, content')
.eq('case_study_id', caseStudy.id)
.order('sort_order', { ascending: true })
```

- [ ] **Step 5: Run unit tests to verify green**

Run: `bun run test src/__tests__/unit/studio-case-studies.test.ts`

Expected: PASS.

---

### Task 3: Public Work Index And Case Study Detail

**Files:**
- Modify: `src/app/(studio)/studio/work/page.tsx`
- Create: `src/app/(studio)/studio/work/[slug]/page.tsx`
- Create: `src/app/(studio)/studio/work/CaseStudyRenderer.tsx`
- Create: `src/app/(studio)/studio/work/work.css`

**Interfaces:**
- Consumes: `getPublishedCaseStudies`
- Consumes: `getPublishedCaseStudyBySlug`
- Consumes: `resolveNextCaseStudy`
- Consumes: `StudioCaseStudyDetail`

- [ ] **Step 1: Replace Work index with database-backed page**

Update `src/app/(studio)/studio/work/page.tsx` to:

```ts
import Image from 'next/image';
import Link from 'next/link';
import { getPublishedCaseStudies } from '@/lib/studio/case-studies';
import './work.css';

export default async function WorkPage(): Promise<React.ReactElement> {
  const studies = await getPublishedCaseStudies();

  if (studies.length === 0) {
    return (
      <section className="biz-section studio-work-empty">
        <p className="studio-work-kicker">Our Work</p>
        <h1>Case studies coming soon.</h1>
        <p>We are preparing a sharper look at the brands, products, and growth systems we build.</p>
      </section>
    );
  }

  return (
    <section className="studio-work-index">
      <div className="studio-work-index__intro">
        <p className="studio-work-kicker">Our Work</p>
        <h1>Selected case studies.</h1>
      </div>
      <div className="studio-work-grid">
        {studies.map((study) => (
          <Link key={study.id} href={`/studio/work/${study.slug}`} className="studio-work-card">
            <div className="studio-work-card__media">
              {study.cover_url ? (
                <Image src={study.cover_url} alt={study.cover_alt ?? study.title} fill sizes="(max-width: 768px) 100vw, 50vw" />
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
```

- [ ] **Step 2: Add detail route**

Create `src/app/(studio)/studio/work/[slug]/page.tsx`:

```ts
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedCaseStudies, getPublishedCaseStudyBySlug } from '@/lib/studio/case-studies';
import { resolveNextCaseStudy } from '@/lib/studio/case-study-schema';
import CaseStudyRenderer from '../CaseStudyRenderer';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = await getPublishedCaseStudyBySlug(slug);
  if (!study) return {};
  return {
    title: study.seo_title ?? `${study.title} - Aorthar Studio`,
    description: study.seo_description ?? study.subtitle ?? undefined,
    openGraph: {
      title: study.seo_title ?? study.title,
      description: study.seo_description ?? study.subtitle ?? undefined,
      images: study.og_image_url || study.cover_url ? [{ url: study.og_image_url ?? study.cover_url! }] : undefined,
    },
  };
}

export default async function StudioCaseStudyPage({ params }: Props): Promise<React.ReactElement> {
  const { slug } = await params;
  const study = await getPublishedCaseStudyBySlug(slug);
  if (!study) notFound();

  const studies = await getPublishedCaseStudies();
  const nextStudy = resolveNextCaseStudy(study.id, studies);

  return <CaseStudyRenderer study={study} nextStudy={nextStudy} />;
}
```

- [ ] **Step 3: Build renderer component**

Create `CaseStudyRenderer.tsx` as a server component that renders:

- Full viewport hero with `Image fill`.
- Hero overlay: tags/services bottom-left and year bottom-right.
- Right-column subtitle/description.
- Details grid: client, year, services, featured mentions.
- Block switch for `text`, `media_row`, `video`, `quote`, `process_notes`, `credits`.
- Next-project link.

Use this block switch skeleton:

```tsx
{study.blocks.map((block) => {
  if (block.type === 'text') return <TextBlock key={block.id} body={block.body} />;
  if (block.type === 'media_row') return <MediaRow key={block.id} block={block} />;
  if (block.type === 'video') return <VideoBlock key={block.id} block={block} />;
  if (block.type === 'quote') return <QuoteBlock key={block.id} block={block} />;
  if (block.type === 'process_notes') return <ProcessNotesBlock key={block.id} block={block} />;
  return <CreditsBlock key={block.id} block={block} />;
})}
```

- [ ] **Step 4: Add focused CSS**

Create `work.css` with classes used in Steps 1-3. Include responsive rules for:

- `.studio-case-hero`
- `.studio-case-hero__media`
- `.studio-case-hero__overlay`
- `.studio-case-description`
- `.studio-case-details`
- `.studio-case-media-row`
- `.studio-case-media-row--pair`
- `.studio-case-quote`
- `.studio-case-process`
- `.studio-case-credits`
- `.studio-case-next`

Set stable media dimensions with `aspect-ratio`, `position: relative`, and `overflow: hidden`.

- [ ] **Step 5: Run focused tests**

Run: `bun run test src/__tests__/unit/studio-case-studies.test.ts`

Expected: PASS.

---

### Task 4: Admin API Routes And Permission Mapping

**Files:**
- Modify: `src/lib/admin/permissions.ts`
- Create: `src/app/api/admin/studio/case-studies/route.ts`
- Create: `src/app/api/admin/studio/case-studies/[id]/route.ts`
- Create: `src/app/api/admin/studio/case-studies/[id]/blocks/route.ts`
- Create: `src/app/api/admin/studio/case-studies/[id]/blocks/[blockId]/route.ts`
- Create: `src/app/api/admin/studio/case-studies/[id]/blocks/reorder/route.ts`

**Interfaces:**
- Consumes: `requireAdminApi('content')`
- Consumes: `mapAdminApiError`
- Consumes: `createAdminClient`
- Consumes: `normalizeCaseStudySlug`
- Consumes: `validateCaseStudyPublish`

- [ ] **Step 1: Map Studio Work APIs to content permission**

In `src/lib/admin/permissions.ts`, add these path checks inside the `content` permission group:

```ts
|| pathname.startsWith('/admin/studio/work')
|| pathname.startsWith('/api/admin/studio/case-studies')
```

- [ ] **Step 2: Add list/create route**

Create `src/app/api/admin/studio/case-studies/route.ts` with `GET` and `POST`.

`POST` accepts `{ title: string; slug?: string }`, normalizes the slug, inserts a draft, and returns `{ id }`.

Error handling pattern:

```ts
try {
  const { userId } = await requireAdminApi('content');
  const admin = createAdminClient();
  // route work
} catch (err) {
  const { status, message } = mapAdminApiError(err);
  return NextResponse.json({ error: message }, { status });
}
```

- [ ] **Step 3: Add read/update/archive route**

Create `src/app/api/admin/studio/case-studies/[id]/route.ts`.

Implement:

- `GET`: fetch case study by `id` plus ordered blocks.
- `PATCH`: allow updates to overview/media/metadata/SEO/status fields.
- `DELETE`: if current status is `published`, update `status` to `archived`; otherwise delete the row.

When `PATCH` receives `status: 'published'`, fetch current block count and run:

```ts
const issues = validateCaseStudyPublish({
  title: payload.title,
  slug: payload.slug,
  subtitle: payload.subtitle,
  cover_url: payload.cover_url,
  year: payload.year,
  release_date: payload.release_date,
  blockCount,
});
```

If `issues.length > 0`, return `{ error: issues[0], issues }` with status `400`.

- [ ] **Step 4: Add block create route**

Create `src/app/api/admin/studio/case-studies/[id]/blocks/route.ts`.

`POST` accepts `{ type, content }`, computes the next `sort_order` as max existing + 1, inserts the block, and returns the inserted row.

- [ ] **Step 5: Add block update/delete route**

Create `src/app/api/admin/studio/case-studies/[id]/blocks/[blockId]/route.ts`.

Implement:

- `PATCH`: update `type` and `content`.
- `DELETE`: delete the block scoped by `case_study_id` and `id`.

- [ ] **Step 6: Add reorder route**

Create `src/app/api/admin/studio/case-studies/[id]/blocks/reorder/route.ts`.

`POST` accepts `{ orderedIds: string[] }` and updates each block with a zero-based `sort_order` matching the array index.

- [ ] **Step 7: Run lint on touched routes**

Run: `bun run lint`

Expected: no lint errors from new API routes.

---

### Task 5: Admin Work List And Create Flow

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`
- Create: `src/app/(admin)/admin/studio/work/page.tsx`
- Create: `src/app/(admin)/admin/studio/work/StudioCaseStudiesAdmin.tsx`

**Interfaces:**
- Consumes: `getAdminCaseStudies`
- Consumes API: `POST /api/admin/studio/case-studies`
- Consumes API: `PATCH /api/admin/studio/case-studies/[id]`
- Consumes API: `DELETE /api/admin/studio/case-studies/[id]`

- [ ] **Step 1: Add sidebar item**

In `src/components/layout/Sidebar.tsx`, add `Work` to `adminStudioNav`:

```ts
const adminStudioNav: NavItem[] = [
  { href: '/admin/studio', label: 'Inquiries', icon: Inbox },
  { href: '/admin/studio/work', label: 'Work', icon: BriefcaseBusiness },
  { href: '/admin/studio/settings', label: 'Settings', icon: Settings },
];
```

- [ ] **Step 2: Add server page**

Create `src/app/(admin)/admin/studio/work/page.tsx`:

```ts
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { hasAdminPermission, normalizeAdminLevel } from '@/lib/admin/permissions';
import { requireRole } from '@/lib/auth';
import { getAdminCaseStudies } from '@/lib/studio/case-studies';
import StudioCaseStudiesAdmin from './StudioCaseStudiesAdmin';

export default async function AdminStudioWorkPage(): Promise<React.ReactElement> {
  const { profile } = await requireRole('admin');
  const adminLevel = normalizeAdminLevel((profile as { admin_level?: string | null }).admin_level);
  if (!hasAdminPermission(adminLevel, 'content')) redirect('/unauthorized');

  const studies = await getAdminCaseStudies();
  return <StudioCaseStudiesAdmin studies={studies} />;
}
```

- [ ] **Step 3: Add client list UI**

Create `StudioCaseStudiesAdmin.tsx` with:

- `useState` for `creating`, `newTitle`, `newSlug`, `submitting`, `query`, `status`.
- Summary cards for total/draft/published/archived.
- Search input and status select.
- Create form that posts to `/api/admin/studio/case-studies`.
- Table/list rows with title, client, year, tags, status, display order, and actions.

Use these action links:

```tsx
<Link href={`/admin/studio/work/${study.id}`}>Edit</Link>
<a href={`/studio/work/${study.slug}`} target="_blank" rel="noreferrer">Preview</a>
```

- [ ] **Step 4: Add archive action**

In the client, implement:

```ts
async function archiveStudy(id: string): Promise<void> {
  const res = await fetch(`/api/admin/studio/case-studies/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) {
    toast.error(data.error ?? 'Failed to archive case study');
    return;
  }
  toast.success(data.archived ? 'Case study archived' : 'Case study deleted');
  router.refresh();
}
```

- [ ] **Step 5: Run lint**

Run: `bun run lint`

Expected: no lint errors from sidebar or admin list files.

---

### Task 6: Admin Case Study Editor And Block Forms

**Files:**
- Create: `src/app/(admin)/admin/studio/work/[id]/page.tsx`
- Create: `src/app/(admin)/admin/studio/work/[id]/CaseStudyEditor.tsx`

**Interfaces:**
- Consumes: `getAdminCaseStudyById`
- Consumes API: `PATCH /api/admin/studio/case-studies/[id]`
- Consumes API: `POST /api/admin/studio/case-studies/[id]/blocks`
- Consumes API: `PATCH /api/admin/studio/case-studies/[id]/blocks/[blockId]`
- Consumes API: `DELETE /api/admin/studio/case-studies/[id]/blocks/[blockId]`
- Consumes API: `POST /api/admin/studio/case-studies/[id]/blocks/reorder`

- [ ] **Step 1: Add server editor page**

Create `src/app/(admin)/admin/studio/work/[id]/page.tsx`:

```ts
export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import { hasAdminPermission, normalizeAdminLevel } from '@/lib/admin/permissions';
import { requireRole } from '@/lib/auth';
import { getAdminCaseStudyById } from '@/lib/studio/case-studies';
import CaseStudyEditor from './CaseStudyEditor';

type Props = { params: Promise<{ id: string }> };

export default async function AdminStudioWorkEditorPage({ params }: Props): Promise<React.ReactElement> {
  const { profile } = await requireRole('admin');
  const adminLevel = normalizeAdminLevel((profile as { admin_level?: string | null }).admin_level);
  if (!hasAdminPermission(adminLevel, 'content')) redirect('/unauthorized');

  const { id } = await params;
  const study = await getAdminCaseStudyById(id);
  if (!study) notFound();

  return <CaseStudyEditor study={study} />;
}
```

- [ ] **Step 2: Add editor shell**

Create `CaseStudyEditor.tsx` with `'use client'`, `useState`, `useRouter`, `toast`, `Tabs`, `Button`, `Input`, `Textarea`, and `Select`.

Tabs:

- `Overview`
- `Media`
- `Metadata`
- `Story`
- `Credits`
- `SEO`

- [ ] **Step 3: Implement overview/media/metadata/SEO save**

Keep a single `draft` state object. Save with:

```ts
async function saveStudy(nextStatus?: 'draft' | 'published' | 'archived'): Promise<void> {
  const res = await fetch(`/api/admin/studio/case-studies/${study.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...draft, status: nextStatus ?? draft.status }),
  });
  const data = await res.json();
  if (!res.ok) {
    toast.error(data.error ?? 'Failed to save case study');
    return;
  }
  toast.success(nextStatus === 'published' ? 'Case study published' : 'Case study saved');
  router.refresh();
}
```

For arrays (`tags`, `services`, `featured_in`), use comma-separated text fields and convert with:

```ts
function splitList(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}
```

- [ ] **Step 4: Implement block creation**

In the Story tab, add buttons for each block type:

```ts
const emptyContentByType = {
  text: { body: '' },
  media_row: { layout: 'single', items: [{ type: 'image', url: '', alt: '', aspectRatio: '3/2' }] },
  video: { url: '', coverUrl: '', caption: '' },
  quote: { quote: '', name: '', role: '' },
  process_notes: { orientation: 'horizontal', title: '', body: '', images: [{ url: '', alt: '' }] },
  credits: { items: [{ category: '', names: '', url: '' }] },
} as const;
```

Post to `/api/admin/studio/case-studies/${study.id}/blocks`.

- [ ] **Step 5: Implement block editors**

Create local render helpers inside `CaseStudyEditor.tsx`:

- `TextBlockEditor`
- `MediaRowBlockEditor`
- `VideoBlockEditor`
- `QuoteBlockEditor`
- `ProcessNotesBlockEditor`
- `CreditsBlockEditor`

Each helper receives `{ block, onChange }` and writes valid content shapes from the spec.

- [ ] **Step 6: Implement block save/delete/reorder**

For each block row, include:

- Save button: `PATCH /api/admin/studio/case-studies/${study.id}/blocks/${block.id}`
- Delete button: `DELETE /api/admin/studio/case-studies/${study.id}/blocks/${block.id}`
- Move up/down buttons: update local order and post `{ orderedIds }` to reorder route.

- [ ] **Step 7: Run focused tests and lint**

Run:

```bash
bun run test src/__tests__/unit/studio-case-studies.test.ts
bun run lint
```

Expected: tests pass and lint reports no new issues.

---

### Task 7: Visual Polish, Accessibility, And Final Verification

**Files:**
- Modify: `src/app/(studio)/studio/work/work.css`
- Modify: `src/app/(studio)/studio/work/page.tsx`
- Modify: `src/app/(studio)/studio/work/[slug]/page.tsx`
- Modify: `src/app/(studio)/studio/work/CaseStudyRenderer.tsx`
- Modify: `src/app/(admin)/admin/studio/work/StudioCaseStudiesAdmin.tsx`
- Modify: `src/app/(admin)/admin/studio/work/[id]/CaseStudyEditor.tsx`

**Interfaces:**
- Verifies public pages render nonblank at desktop and mobile widths.
- Verifies admin page remains usable in the existing admin shell.

- [ ] **Step 1: Start dev server**

Run: `bun dev`

Keep the server running until visual checks are complete.

- [ ] **Step 2: Capture public Work index**

Use Playwright or browser checks at:

- `http://localhost:3000/studio/work`
- viewport `1440x1000`
- viewport `390x844`

Check:

- No horizontal scroll.
- No overlapping text.
- Empty state is polished when there are no published rows.

- [ ] **Step 3: Capture a seeded/manual case-study detail**

Check whether the local database has a published case study. When no published row exists, insert one through the admin UI or Supabase before visual verification. Use at least:

- One cover image URL.
- One text block.
- One image media row.
- One credits block.

Check:

- Hero fills first viewport.
- Tags/year are readable.
- Text stacks on mobile.
- Media rows keep stable aspect ratios.
- Next project either appears or is absent without layout breakage.

- [ ] **Step 4: Verify admin workflow**

In browser:

- Visit `/admin/studio/work`.
- Create a draft.
- Open editor.
- Add title, slug, subtitle, cover URL, year, one text block, and one media row.
- Publish.
- Open preview `/studio/work/[slug]`.
- Unpublish or archive.
- Confirm public route returns 404 or no longer appears in `/studio/work`.

- [ ] **Step 5: Run full test suite**

Run: `bun run test`

Expected: PASS.

- [ ] **Step 6: Run lint**

Run: `bun run lint`

Expected: PASS.

- [ ] **Step 7: Run production build**

Run: `bun run build`

Expected: PASS.

- [ ] **Step 8: Final diff review**

Run:

```bash
git diff --stat
git diff --check
```

Expected: changes are scoped to Studio case studies, admin navigation/permissions, docs, tests, and migration.
