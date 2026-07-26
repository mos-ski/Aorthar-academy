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

type Params = { params: Promise<{ id: string; blockId: string }> };
const blockTypes = ['text', 'media_row', 'video', 'quote', 'process_notes', 'credits'] as const;
const blockFields = 'id, case_study_id, type, sort_order, content';
const publishFields = 'title, slug, subtitle, cover_url, cover_media_type, preview_video_url, og_image_url, year, release_date, status';
const uuidSchema = z.string().uuid();

function invalidIds(caseStudyId: string, blockId: string): NextResponse | null {
  if (!uuidSchema.safeParse(caseStudyId).success) {
    return NextResponse.json({ error: 'Invalid case study ID.' }, { status: 400 });
  }
  if (!uuidSchema.safeParse(blockId).success) {
    return NextResponse.json({ error: 'Invalid block ID.' }, { status: 400 });
  }
  return null;
}

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await requireAdminApi('content');
    const { id: caseStudyId, blockId } = await params;
    const body = await request.json() as { type?: unknown; content?: unknown };

    const idError = invalidIds(caseStudyId, blockId);
    if (idError) return idError;
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
    const existingBlock = existingBlocks.find((block) => block.id === blockId);
    if (!existingBlock) return NextResponse.json({ error: 'Block not found.' }, { status: 404 });

    const updatedBlocks = existingBlocks.map((block): StudioCaseStudyBlockRow => (
      block.id === blockId
        ? { ...block, type: body.type as typeof blockTypes[number], content: body.content }
        : block
    ));
    const publishIssues = validatePublishedCaseStudyState(
      caseStudy as StudioCaseStudyPublishRecord,
      updatedBlocks,
    );
    if (publishIssues.length > 0) {
      return NextResponse.json({ error: publishIssues[0], issues: publishIssues }, { status: 400 });
    }

    const { data, error } = await admin
      .from('studio_case_study_blocks')
      .update({ type: body.type, content: body.content })
      .eq('case_study_id', caseStudyId)
      .eq('id', blockId)
      .select(blockFields)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Block not found.' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await requireAdminApi('content');
    const { id: caseStudyId, blockId } = await params;
    const idError = invalidIds(caseStudyId, blockId);
    if (idError) return idError;

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
    if (!existingBlocks.some((block) => block.id === blockId)) {
      return NextResponse.json({ error: 'Block not found.' }, { status: 404 });
    }

    const publishIssues = validatePublishedCaseStudyState(
      caseStudy as StudioCaseStudyPublishRecord,
      existingBlocks.filter((block) => block.id !== blockId),
    );
    if (publishIssues.length > 0) {
      return NextResponse.json({ error: publishIssues[0], issues: publishIssues }, { status: 400 });
    }

    const { data, error } = await admin
      .from('studio_case_study_blocks')
      .delete()
      .eq('case_study_id', caseStudyId)
      .eq('id', blockId)
      .select('id')
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Block not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
