import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  validateCaseStudyBlockContent,
  validatePublishedCaseStudyState,
  type StudioCaseStudyBlockRow,
  type StudioCaseStudyPublishRecord,
} from '@/lib/studio/case-study-schema';

type Params = { params: Promise<{ id: string }> };
const blockTypes = ['text', 'media_row', 'video', 'quote', 'process_notes', 'credits'] as const;
const blockFields = 'id, case_study_id, type, sort_order, content';
const publishFields = 'title, slug, subtitle, cover_url, cover_media_type, preview_video_url, og_image_url, year, release_date, status';
const uuidSchema = z.string().uuid();

function publishIntegrityError(error: { code?: string; message: string }): NextResponse | null {
  return error.code === '23514'
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : null;
}

export async function POST(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await requireAdminApi('content');
    const { id: caseStudyId } = await params;
    const body = await request.json() as { type?: unknown; content?: unknown };

    if (!uuidSchema.safeParse(caseStudyId).success) {
      return NextResponse.json({ error: 'Invalid case study ID.' }, { status: 400 });
    }
    if (!blockTypes.includes(body.type as typeof blockTypes[number])) {
      return NextResponse.json({ error: 'Invalid block type.' }, { status: 400 });
    }
    const contentIssues = validateCaseStudyBlockContent(body.type, body.content);
    if (contentIssues.length > 0) {
      return NextResponse.json({ error: contentIssues[0], issues: contentIssues }, { status: 400 });
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

    const existingBlocks = (blocks ?? []) as StudioCaseStudyBlockRow[];
    const nextSortOrder = existingBlocks.reduce(
      (highest, block) => Math.max(highest, block.sort_order),
      -1,
    ) + 1;
    const nextBlock: StudioCaseStudyBlockRow = {
      id: 'pending',
      case_study_id: caseStudyId,
      type: body.type as typeof blockTypes[number],
      sort_order: nextSortOrder,
      content: body.content,
    };
    const publishIssues = validatePublishedCaseStudyState(
      caseStudy as StudioCaseStudyPublishRecord,
      [...existingBlocks, nextBlock],
    );
    if (publishIssues.length > 0) {
      return NextResponse.json({ error: publishIssues[0], issues: publishIssues }, { status: 400 });
    }

    const { data, error } = await admin
      .from('studio_case_study_blocks')
      .insert({
        case_study_id: caseStudyId,
        type: body.type,
        content: body.content,
        sort_order: nextSortOrder,
      })
      .select(blockFields)
      .single();

    if (error) {
      const integrityError = publishIntegrityError(error);
      if (integrityError) return integrityError;
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
