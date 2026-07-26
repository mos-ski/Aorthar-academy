import { NextRequest, NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string; blockId: string }> };
const blockTypes = ['text', 'media_row', 'video', 'quote', 'process_notes', 'credits'] as const;

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await requireAdminApi('content');
    const { id: caseStudyId, blockId } = await params;
    const body = await request.json() as { type?: unknown; content?: unknown };

    if (!blockTypes.includes(body.type as typeof blockTypes[number])) {
      return NextResponse.json({ error: 'Invalid block type.' }, { status: 400 });
    }
    if (!body.content || typeof body.content !== 'object' || Array.isArray(body.content)) {
      return NextResponse.json({ error: 'Block content must be an object.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('studio_case_study_blocks')
      .update({ type: body.type, content: body.content })
      .eq('case_study_id', caseStudyId)
      .eq('id', blockId)
      .select('id, case_study_id, type, sort_order, content')
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
    const admin = createAdminClient();
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
