import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string }> };
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
      return NextResponse.json({ error: 'orderedIds must be an array of topic IDs.' }, { status: 400 });
    }
    if (new Set(body.orderedIds).size !== body.orderedIds.length) {
      return NextResponse.json({ error: 'orderedIds must not contain duplicate topic IDs.' }, { status: 400 });
    }
    if (!body.orderedIds.every((id) => uuidSchema.safeParse(id).success)) {
      return NextResponse.json({ error: 'orderedIds must contain valid topic UUIDs.' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: caseStudy, error: caseStudyError } = await admin
      .from('studio_case_studies')
      .select('id')
      .eq('id', caseStudyId)
      .maybeSingle();

    if (caseStudyError) return NextResponse.json({ error: caseStudyError.message }, { status: 500 });
    if (!caseStudy) return NextResponse.json({ error: 'Case study not found.' }, { status: 404 });

    const { error } = await admin.rpc('reorder_studio_case_study_topics', {
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
