# Studio Case Studies Design

## Goal

Build an admin-managed Studio Work system that lets Aorthar publish case studies at the presentation standard of the Belonwus Sporting Lagos reference: immersive cover media, compact metadata, editorial storytelling, image/video sequences, credits, and a next-project handoff.

Reference: https://belonwus.com/work/sporting-lagos

## Scope

Case studies belong to the Studio product.

Public routes:

- `/studio/work` lists published case studies.
- `/studio/work/[slug]` renders one published case study.
- On `studio.aorthar.com`, middleware already rewrites `/work` and `/work/[slug]` to the Studio routes.

Admin routes:

- `/admin/studio/work` lists case studies.
- `/admin/studio/work/new` creates a draft.
- `/admin/studio/work/[id]` edits metadata, content blocks, credits, SEO, and publish state.

The first version includes:

- Draft and published lifecycle.
- Manual display order.
- Featured flag for public listing priority.
- Cover image and optional preview video.
- Project metadata: title, slug, subtitle, client, release date, year, tags, services, featured mentions.
- Ordered blocks for text, media rows, video embeds, quotes, process notes, and credits.
- Admin preview link.
- SEO title, SEO description, and Open Graph image.
- Supabase-backed storage using external media URLs for the first version.

The first version does not include:

- In-browser file upload to Supabase Storage.
- Full visual drag-and-drop layout editing.
- Per-block animation controls.
- Private/password-protected case studies.
- Comments or approval workflows.

## Presentation Standard

The public case-study page should feel more like an editorial portfolio piece than a blog article.

The detail page uses:

- A full-viewport cover image or video with nav above it.
- A small fixed or sticky project label on desktop.
- Bottom-left tags/services and bottom-right year over the hero.
- A short, right-column project description after the hero.
- A compact details row for client, year, services, and featured mentions.
- Large media rows with one or two assets per row.
- Optional Vimeo/video rows.
- Optional process notes with paired images and explanatory text.
- Optional pull quotes.
- Credits grouped by role.
- A next-project section using the next published case study by display order.

The design should use the Studio visual language, not the University dashboard language. It should be dark, image-led, spacious, and restrained, with minimal UI chrome and strong typography.

## Data Model

Create `studio_case_studies`.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `slug text not null unique`
- `title text not null`
- `subtitle text`
- `client text`
- `release_date date`
- `year text`
- `status text not null default 'draft' check (status in ('draft', 'published', 'archived'))`
- `is_featured boolean not null default false`
- `display_order integer not null default 0`
- `tags text[] not null default '{}'`
- `services text[] not null default '{}'`
- `featured_in text[] not null default '{}'`
- `cover_media_type text not null default 'image' check (cover_media_type in ('image', 'video'))`
- `cover_url text`
- `cover_alt text`
- `preview_video_url text`
- `seo_title text`
- `seo_description text`
- `og_image_url text`
- `created_by uuid references public.profiles(user_id)`
- `updated_by uuid references public.profiles(user_id)`
- `published_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Create `studio_case_study_blocks`.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `case_study_id uuid not null references public.studio_case_studies(id) on delete cascade`
- `type text not null check (type in ('text', 'media_row', 'video', 'quote', 'process_notes', 'credits'))`
- `sort_order integer not null default 0`
- `content jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Block content shapes:

- `text`: `{ "body": "Paragraph text with blank lines between paragraphs." }`
- `media_row`: `{ "layout": "single" | "pair", "items": [{ "type": "image" | "video", "url": "...", "alt": "...", "aspectRatio": "3/2" }] }`
- `video`: `{ "url": "https://vimeo.com/...", "coverUrl": "...", "caption": "..." }`
- `quote`: `{ "quote": "...", "name": "...", "role": "..." }`
- `process_notes`: `{ "orientation": "horizontal" | "vertical", "title": "...", "body": "...", "images": [{ "url": "...", "alt": "..." }] }`
- `credits`: `{ "items": [{ "category": "Creative Director", "names": "Name", "url": "https://..." }] }`

RLS:

- Public users can read only `studio_case_studies.status = 'published'`.
- Public users can read blocks only for published case studies.
- Admins can read and write all case studies and blocks.
- API and admin page write operations use `createAdminClient()`.

Indexes:

- Unique index on `studio_case_studies.slug`.
- Index on `studio_case_studies(status, display_order)`.
- Index on `studio_case_study_blocks(case_study_id, sort_order)`.

## Admin Experience

Add `Work` as a nested Studio nav item between `Inquiries` and `Settings`.

`/admin/studio/work` shows:

- Total, draft, published, and archived counts.
- Search by title, client, slug, tag, or service.
- Status filter.
- Table cards with cover thumbnail, title, client, status, display order, updated date, and quick actions.
- Buttons for New Case Study, Preview, Publish/Unpublish, Archive, and Edit.

`/admin/studio/work/new`:

- Creates a draft with title and slug.
- Redirects to `/admin/studio/work/[id]`.

`/admin/studio/work/[id]` has tabs:

- Overview: title, slug, subtitle, client, release date, year, status, featured, display order.
- Media: cover type, cover URL, cover alt, preview video URL, OG image URL.
- Metadata: tags, services, featured mentions.
- Story: ordered block editor.
- Credits: credit items, stored as a `credits` block.
- SEO: SEO title and description.

The block editor should be structured forms, not freeform JSON. Each block can be added, edited, duplicated, deleted, moved up, and moved down.

Validation:

- Title is required.
- Slug is required, lowercase, unique, and URL-safe.
- Published case studies require title, slug, subtitle, cover URL, year or release date, and at least one content block.
- Media URLs must start with `https://` in production.
- Vimeo URLs are accepted for video blocks.

## Public Experience

`/studio/work`:

- Fetches published case studies ordered by `is_featured desc`, then `display_order asc`, then `published_at desc`.
- Shows an image-led grid with title, tags, client, and year.
- Uses existing Studio nav and footer.
- Empty state should be hidden from normal visitors by showing a tasteful "Work coming soon" section.

`/studio/work/[slug]`:

- Returns 404 for missing, archived, or draft case studies.
- Renders the full case-study template from structured data.
- Uses `generateMetadata` from SEO fields, falling back to title/subtitle/cover.
- Uses responsive media sizing with stable aspect ratios.
- Keeps text readable on mobile with stacked metadata and no overlapping hero labels.
- Includes a next published case study link by display order.

## API and Actions

Use admin-only API routes or server actions following existing admin patterns.

Routes:

- `POST /api/admin/studio/case-studies`
- `PATCH /api/admin/studio/case-studies/[id]`
- `DELETE /api/admin/studio/case-studies/[id]`
- `POST /api/admin/studio/case-studies/[id]/blocks`
- `PATCH /api/admin/studio/case-studies/[id]/blocks/[blockId]`
- `DELETE /api/admin/studio/case-studies/[id]/blocks/[blockId]`
- `POST /api/admin/studio/case-studies/[id]/blocks/reorder`

Deletion behavior:

- Draft case studies with no public history may be hard-deleted.
- Published case studies should archive by default to avoid breaking public URLs.
- Blocks can be hard-deleted because they are child content and not independently public.

## Types and Utilities

Add typed helpers under `src/lib/studio/case-studies.ts`.

Responsibilities:

- Fetch published case-study list.
- Fetch published case-study detail by slug.
- Fetch admin case-study list.
- Normalize and validate slugs.
- Parse block JSON into typed render models.
- Resolve next published case study.

Add Zod schemas under `src/utils/validators.ts` or a focused `src/lib/studio/case-study-schema.ts`.

## Security

Admin pages require `requireRole('admin')`.

Admin writes must also check content-level permission. Super admins and content admins can manage case studies. Finance admins cannot.

Public routes must never expose drafts or archived case studies.

Public routes read through the server Supabase client and rely on RLS plus explicit `status = 'published'` filters.

## Verification

Automated checks:

- Unit tests for slug normalization, block parsing, and next-project selection.
- API tests for draft creation, publish validation, and block reorder if the existing integration test setup supports these routes.
- `bun run lint`
- `bun run build`

Manual checks:

- `studio.aorthar.com/work` shows only published case studies.
- `/studio/work/[slug]` renders hero, metadata, story blocks, credits, and next project.
- Draft case studies 404 publicly.
- Admin can create a draft, add blocks, publish, unpublish, reorder blocks, and archive.
- Mobile hero metadata stacks without overlap.
- External image and Vimeo rows render without layout shift.

## Implementation Notes

This feature should be implemented in small slices:

1. Database migration, RLS, and typed helpers.
2. Public read-only routes using seeded or manually inserted data.
3. Admin list and draft creation.
4. Admin detail editor for metadata and publish state.
5. Admin block editor.
6. Visual polish, metadata, tests, and documentation.

No unrelated Studio redesign is required, but the existing static `/studio/work` page should be replaced by the new published work index.
