import { NextRequest, NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeCaseStudySlug } from '@/lib/studio/case-study-schema';

const summaryFields = 'id, slug, title, subtitle, client, year, tags, services, cover_url, cover_alt, cover_media_type, is_featured, display_order, published_at, status, updated_at';

export async function GET(): Promise<NextResponse> {
  try {
    await requireAdminApi('content');
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('studio_case_studies')
      .select(summaryFields)
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('published_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireAdminApi('content');
    const body = await request.json() as { title?: unknown; slug?: unknown };
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const slugSource = typeof body.slug === 'string' && body.slug.trim() ? body.slug : title;
    const slug = normalizeCaseStudySlug(slugSource);

    if (!title) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('studio_case_studies')
      .insert({
        title,
        slug,
        status: 'draft',
        created_by: userId,
        updated_by: userId,
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A case study with this slug already exists.' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
