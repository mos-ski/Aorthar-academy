import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string }> };
const topicFields = 'id, case_study_id, title, sort_order, created_at, updated_at';
const uuidSchema = z.string().uuid();

export async function GET(_request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await requireAdminApi('content');
    const { id: caseStudyId } = await params;

    if (!uuidSchema.safeParse(caseStudyId).success) {
      return NextResponse.json({ error: 'Invalid case study ID.' }, { status: 400 });
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
      .select(topicFields)
      .eq('case_study_id', caseStudyId)
      .order('sort_order', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data ?? [] });
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await requireAdminApi('content');
    const { id: caseStudyId } = await params;
    const body = await request.json() as { title?: unknown };

    if (!uuidSchema.safeParse(caseStudyId).success) {
      return NextResponse.json({ error: 'Invalid case study ID.' }, { status: 400 });
    }
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: caseStudy, error: caseStudyError } = await admin
      .from('studio_case_studies')
      .select('id')
      .eq('id', caseStudyId)
      .maybeSingle();

    if (caseStudyError) return NextResponse.json({ error: caseStudyError.message }, { status: 500 });
    if (!caseStudy) return NextResponse.json({ error: 'Case study not found.' }, { status: 404 });

    const { data: maxRow, error: maxError } = await admin
      .from('studio_case_study_topics')
      .select('sort_order')
      .eq('case_study_id', caseStudyId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxError) return NextResponse.json({ error: maxError.message }, { status: 500 });

    const nextSortOrder = ((maxRow as { sort_order: number } | null)?.sort_order ?? -1) + 1;

    const { data, error } = await admin
      .from('studio_case_study_topics')
      .insert({
        case_study_id: caseStudyId,
        title: body.title.trim(),
        sort_order: nextSortOrder,
      })
      .select(topicFields)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
