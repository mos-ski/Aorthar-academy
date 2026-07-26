import { NextRequest, NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await requireAdminApi('content');
    const { id: caseStudyId } = await params;
    const body = await request.json() as { orderedIds?: unknown };

    if (!Array.isArray(body.orderedIds) || !body.orderedIds.every((id) => typeof id === 'string')) {
      return NextResponse.json({ error: 'orderedIds must be an array of block IDs.' }, { status: 400 });
    }
    if (new Set(body.orderedIds).size !== body.orderedIds.length) {
      return NextResponse.json({ error: 'orderedIds must not contain duplicate block IDs.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: blocks, error: blocksError } = await admin
      .from('studio_case_study_blocks')
      .select('id, case_study_id, type, content')
      .eq('case_study_id', caseStudyId);

    if (blocksError) return NextResponse.json({ error: blocksError.message }, { status: 500 });

    const blocksById = new Map((blocks ?? []).map((block) => [block.id, block]));
    if (blocksById.size !== body.orderedIds.length || body.orderedIds.some((id) => !blocksById.has(id))) {
      return NextResponse.json({ error: 'orderedIds must include every block for this case study exactly once.' }, { status: 400 });
    }

    if (body.orderedIds.length === 0) {
      return NextResponse.json({ ok: true });
    }

    const reorderedBlocks = body.orderedIds.map((id, sort_order) => ({
      ...blocksById.get(id)!,
      sort_order,
    }));
    const { error } = await admin.from('studio_case_study_blocks').upsert(reorderedBlocks);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
