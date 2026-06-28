import { NextRequest, NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { normalizeTemplateFields } from '@/lib/contracts/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ContractMode } from '@/lib/contracts/types';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireAdminApi('finance');
    const { id } = await params;
    const body = await request.json() as {
      mode?: ContractMode;
      name?: string;
      description?: string | null;
      content_html?: string;
      status?: 'draft' | 'active' | 'archived';
      fields?: Parameters<typeof normalizeTemplateFields>[1];
    };

    const admin = createAdminClient();
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.content_html !== undefined) updateData.content_html = body.content_html;
    if (body.status !== undefined) updateData.status = body.status;

    const { data: template, error } = await admin
      .from('contract_templates')
      .update(updateData)
      .eq('id', id)
      .select('id, mode')
      .single();

    if (error || !template) {
      return NextResponse.json({ error: error?.message ?? 'Template not found' }, { status: 404 });
    }

    if (body.fields) {
      await admin.from('contract_template_fields').delete().eq('template_id', id);
      const fields = normalizeTemplateFields((body.mode ?? template.mode) as ContractMode, body.fields);
      if (fields.length > 0) {
        const { error: fieldsError } = await admin
          .from('contract_template_fields')
          .insert(fields.map((field) => ({ ...field, template_id: id })));
        if (fieldsError) return NextResponse.json({ error: fieldsError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAdminApi('finance');
    const { id } = await params;
    const admin = createAdminClient();
    const { error } = await admin
      .from('contract_templates')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
