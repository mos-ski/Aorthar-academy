import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string; topicId: string }> };
const topicFields = 'id, case_study_id, title, sort_order, created_at, updated_at';
const uuidSchema = z.string().uuid();

function invalidIds(caseStudyId: string, topicId: string): NextResponse | null {
  if (!uuidSchema.safeParse(caseStudyId).success) {
    return NextResponse.json({ error: 'Invalid case study ID.' }, { status: 400 });
  }
  if (!uuidSchema.safeParse(topicId).success) {
    return NextResponse.json({ error: 'Invalid topic ID.' }, { status: 400 });
  }
  return null;
}

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await requireAdminApi('content');
    const { id: caseStudyId, topicId } = await params;
    const body = await request.json() as { title?: unknown };

    const idError = invalidIds(caseStudyId, topicId);
    if (idError) return idError;

    if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim() === '')) {
      return NextResponse.json({ error: 'Title must be a non-empty string.' }, { status: 400 });
    }

    const patch: { title?: string } = {};
    if (typeof body.title === 'string') patch.title = body.title.trim();

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided.' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: caseStudy, error: caseStudyError } = await admin
      .from('studio_case_studies')
      .select('id')
      .eq('id', caseStudyId)
      .maybeSingle();

    if (caseStudyError) return NextResponse.json({ error: caseStudyError.message }, { status: 500 });
    if (!caseStudy) return NextResponse.json({ error: 'Case study not found.' }, { status: 404 });

    const { data, error } = await admin
      .from('studio_case_study_topics')
      .update(patch)
      .eq('case_study_id', caseStudyId)
      .eq('id', topicId)
      .select(topicFields)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Topic not found.' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await requireAdminApi('content');
    const { id: caseStudyId, topicId } = await params;

    const idError = invalidIds(caseStudyId, topicId);
    if (idError) return idError;

    const admin = createAdminClient();

    const { data, error } = await admin
      .from('studio_case_study_topics')
      .delete()
      .eq('case_study_id', caseStudyId)
      .eq('id', topicId)
      .select('id')
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Topic not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
