import { NextRequest, NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeCaseStudySlug, validateCaseStudyPublish } from '@/lib/studio/case-study-schema';

type Params = { params: Promise<{ id: string }> };

type CaseStudyPayload = {
  title?: unknown;
  slug?: unknown;
  subtitle?: unknown;
  client?: unknown;
  release_date?: unknown;
  year?: unknown;
  status?: unknown;
  is_featured?: unknown;
  display_order?: unknown;
  tags?: unknown;
  services?: unknown;
  featured_in?: unknown;
  cover_media_type?: unknown;
  cover_url?: unknown;
  cover_alt?: unknown;
  preview_video_url?: unknown;
  seo_title?: unknown;
  seo_description?: unknown;
  og_image_url?: unknown;
};

const detailFields = 'id, slug, title, subtitle, client, release_date, year, status, is_featured, display_order, tags, services, featured_in, cover_media_type, cover_url, cover_alt, preview_video_url, seo_title, seo_description, og_image_url, created_at, updated_at, published_at';
const blockFields = 'id, case_study_id, type, sort_order, content';

function nullableString(value: unknown): string | null | undefined {
  if (value === null) return null;
  return typeof value === 'string' ? value.trim() : undefined;
}

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) return undefined;
  return value.map((item) => item.trim()).filter(Boolean);
}

function pendingValue<T>(updates: Record<string, unknown>, field: string, currentValue: T): T | null {
  if (Object.prototype.hasOwnProperty.call(updates, field)) {
    return updates[field] as T | null;
  }
  return currentValue;
}

export async function GET(_request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await requireAdminApi('content');
    const { id } = await params;
    const admin = createAdminClient();
    const { data: caseStudy, error } = await admin
      .from('studio_case_studies')
      .select(detailFields)
      .eq('id', id)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!caseStudy) return NextResponse.json({ error: 'Case study not found.' }, { status: 404 });

    const { data: blocks, error: blocksError } = await admin
      .from('studio_case_study_blocks')
      .select(blockFields)
      .eq('case_study_id', id)
      .order('sort_order', { ascending: true });

    if (blocksError) return NextResponse.json({ error: blocksError.message }, { status: 500 });
    return NextResponse.json({ data: { ...caseStudy, blocks: blocks ?? [] } });
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { userId } = await requireAdminApi('content');
    const { id } = await params;
    const payload = await request.json() as CaseStudyPayload;
    const admin = createAdminClient();
    const { data: current, error: currentError } = await admin
      .from('studio_case_studies')
      .select(detailFields)
      .eq('id', id)
      .maybeSingle();

    if (currentError) return NextResponse.json({ error: currentError.message }, { status: 500 });
    if (!current) return NextResponse.json({ error: 'Case study not found.' }, { status: 404 });

    const updates: Record<string, unknown> = { updated_by: userId };
    const title = nullableString(payload.title);
    const slugValue = nullableString(payload.slug);
    const subtitle = nullableString(payload.subtitle);
    const client = nullableString(payload.client);
    const releaseDate = nullableString(payload.release_date);
    const year = nullableString(payload.year);
    const coverUrl = nullableString(payload.cover_url);
    const coverAlt = nullableString(payload.cover_alt);
    const previewVideoUrl = nullableString(payload.preview_video_url);
    const seoTitle = nullableString(payload.seo_title);
    const seoDescription = nullableString(payload.seo_description);
    const ogImageUrl = nullableString(payload.og_image_url);
    const tags = stringArray(payload.tags);
    const services = stringArray(payload.services);
    const featuredIn = stringArray(payload.featured_in);

    if (title !== undefined) updates.title = title;
    if (slugValue !== undefined) updates.slug = slugValue === null ? null : normalizeCaseStudySlug(slugValue);
    if (subtitle !== undefined) updates.subtitle = subtitle;
    if (client !== undefined) updates.client = client;
    if (releaseDate !== undefined) updates.release_date = releaseDate;
    if (year !== undefined) updates.year = year;
    if (coverUrl !== undefined) updates.cover_url = coverUrl;
    if (coverAlt !== undefined) updates.cover_alt = coverAlt;
    if (previewVideoUrl !== undefined) updates.preview_video_url = previewVideoUrl;
    if (seoTitle !== undefined) updates.seo_title = seoTitle;
    if (seoDescription !== undefined) updates.seo_description = seoDescription;
    if (ogImageUrl !== undefined) updates.og_image_url = ogImageUrl;
    if (tags !== undefined) updates.tags = tags;
    if (services !== undefined) updates.services = services;
    if (featuredIn !== undefined) updates.featured_in = featuredIn;
    if (typeof payload.is_featured === 'boolean') updates.is_featured = payload.is_featured;
    if (typeof payload.display_order === 'number' && Number.isInteger(payload.display_order)) updates.display_order = payload.display_order;
    if (payload.cover_media_type === 'image' || payload.cover_media_type === 'video') updates.cover_media_type = payload.cover_media_type;
    if (payload.status === 'draft' || payload.status === 'published' || payload.status === 'archived') updates.status = payload.status;

    if (payload.status === 'published') {
      const { count, error: countError } = await admin
        .from('studio_case_study_blocks')
        .select('id', { count: 'exact', head: true })
        .eq('case_study_id', id);

      if (countError) return NextResponse.json({ error: countError.message }, { status: 500 });

      const issues = validateCaseStudyPublish({
        title: pendingValue(updates, 'title', current.title),
        slug: pendingValue(updates, 'slug', current.slug),
        subtitle: pendingValue(updates, 'subtitle', current.subtitle),
        cover_url: pendingValue(updates, 'cover_url', current.cover_url),
        year: pendingValue(updates, 'year', current.year),
        release_date: pendingValue(updates, 'release_date', current.release_date),
        blockCount: count ?? 0,
      });

      if (issues.length > 0) {
        return NextResponse.json({ error: issues[0], issues }, { status: 400 });
      }

      updates.published_at = current.published_at ?? new Date().toISOString();
    }

    if (Object.keys(updates).length === 1) {
      return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
    }

    const { data, error } = await admin
      .from('studio_case_studies')
      .update(updates)
      .eq('id', id)
      .select(detailFields)
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A case study with this slug already exists.' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { userId } = await requireAdminApi('content');
    const { id } = await params;
    const admin = createAdminClient();
    const { data: current, error: currentError } = await admin
      .from('studio_case_studies')
      .select('status')
      .eq('id', id)
      .maybeSingle();

    if (currentError) return NextResponse.json({ error: currentError.message }, { status: 500 });
    if (!current) return NextResponse.json({ error: 'Case study not found.' }, { status: 404 });

    if (current.status === 'published') {
      const { error } = await admin
        .from('studio_case_studies')
        .update({ status: 'archived', updated_by: userId })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, archived: true });
    }

    const { error } = await admin.from('studio_case_studies').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, archived: false });
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
