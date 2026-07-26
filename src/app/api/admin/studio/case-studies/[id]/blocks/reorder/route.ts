import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  validatePublishedCaseStudyState,
  type StudioCaseStudyBlockRow,
  type StudioCaseStudyPublishRecord,
} from '@/lib/studio/case-study-schema';

type Params = { params: Promise<{ id: string }> };
const blockFields = 'id, case_study_id, type, sort_order, content';
const publishFields = 'title, slug, subtitle, cover_url, cover_media_type, preview_video_url, og_image_url, year, release_date, status';
const uuidSchema = z.string().uuid();

export async function POST(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await requireAdminApi('content');
    const { id: caseStudyId } = await params;
    const body = await request.json() as { orderedIds?: unknown };

    if (!uuidSchema.safeParse(caseStudyId).success) {
      return NextResponse.json({ error: 'Invalid case study ID.' }, { status: 400 });
    }
    if (!Array.isArray(body.orderedIds) || !body.orderedIds.every((id) => typeof id === 'string')) {
      return NextResponse.json({ error: 'orderedIds must be an array of block IDs.' }, { status: 400 });
    }
    if (new Set(body.orderedIds).size !== body.orderedIds.length) {
      return NextResponse.json({ error: 'orderedIds must not contain duplicate block IDs.' }, { status: 400 });
    }
    if (!body.orderedIds.every((id) => uuidSchema.safeParse(id).success)) {
      return NextResponse.json({ error: 'orderedIds must contain valid block UUIDs.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: caseStudy, error: caseStudyError } = await admin
      .from('studio_case_studies')
      .select(publishFields)
      .eq('id', caseStudyId)
      .maybeSingle();

    if (caseStudyError) return NextResponse.json({ error: caseStudyError.message }, { status: 500 });
    if (!caseStudy) return NextResponse.json({ error: 'Case study not found.' }, { status: 404 });

    const { data: blocks, error: blocksError } = await admin
      .from('studio_case_study_blocks')
      .select(blockFields)
      .eq('case_study_id', caseStudyId)
      .order('sort_order', { ascending: true });

    if (blocksError) return NextResponse.json({ error: blocksError.message }, { status: 500 });

    const publishIssues = validatePublishedCaseStudyState(
      caseStudy as StudioCaseStudyPublishRecord,
      (blocks ?? []) as StudioCaseStudyBlockRow[],
    );
    if (publishIssues.length > 0) {
      return NextResponse.json({ error: publishIssues[0], issues: publishIssues }, { status: 400 });
    }

    const { error } = await admin.rpc('reorder_studio_case_study_blocks', {
      p_case_study_id: caseStudyId,
      p_ordered_ids: body.orderedIds,
    });

    if (error) {
      if (error.code === '22023') {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.code === 'P0002') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
