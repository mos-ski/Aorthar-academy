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
