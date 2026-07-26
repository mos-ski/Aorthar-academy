import { NextRequest, NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string }> };
const blockTypes = ['text', 'media_row', 'video', 'quote', 'process_notes', 'credits'] as const;

export async function POST(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await requireAdminApi('content');
    const { id: caseStudyId } = await params;
    const body = await request.json() as { type?: unknown; content?: unknown };

    if (!blockTypes.includes(body.type as typeof blockTypes[number])) {
      return NextResponse.json({ error: 'Invalid block type.' }, { status: 400 });
    }
    if (!body.content || typeof body.content !== 'object' || Array.isArray(body.content)) {
      return NextResponse.json({ error: 'Block content must be an object.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: lastBlock, error: lastBlockError } = await admin
      .from('studio_case_study_blocks')
      .select('sort_order')
      .eq('case_study_id', caseStudyId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastBlockError) return NextResponse.json({ error: lastBlockError.message }, { status: 500 });

    const { data, error } = await admin
      .from('studio_case_study_blocks')
      .insert({
        case_study_id: caseStudyId,
        type: body.type,
        content: body.content,
        sort_order: (lastBlock?.sort_order ?? -1) + 1,
      })
      .select('id, case_study_id, type, sort_order, content')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
