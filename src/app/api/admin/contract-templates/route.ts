import { NextRequest, NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { normalizeTemplateFields } from '@/lib/contracts/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ContractFieldType, ContractMode } from '@/lib/contracts/types';

type FieldPayload = {
  key: string;
  label: string;
  field_type?: ContractFieldType;
  is_required?: boolean;
  help_text?: string | null;
  sort_order?: number;
};

export async function GET(request: NextRequest) {
  try {
    await requireAdminApi('finance');
    const mode = request.nextUrl.searchParams.get('mode');
    const admin = createAdminClient();

    let query = admin
      .from('contract_templates')
      .select('*, contract_template_fields(*)')
      .order('created_at', { ascending: false });

    if (mode) query = query.eq('mode', mode);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ templates: data ?? [] });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAdminApi('finance');
    const body = await request.json() as {
      mode?: ContractMode;
      name?: string;
      description?: string | null;
      content_html?: string;
      status?: 'draft' | 'active' | 'archived';
      fields?: FieldPayload[];
    };

    const mode = body.mode;
    if (!mode || !['employee', 'contractor', 'client'].includes(mode)) {
      return NextResponse.json({ error: 'Valid template mode is required' }, { status: 400 });
    }
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }
    if (!body.content_html?.trim()) {
      return NextResponse.json({ error: 'Template content is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: template, error } = await admin
      .from('contract_templates')
      .insert({
        mode,
        name: body.name.trim(),
        description: body.description?.trim() || null,
        content_html: body.content_html,
        status: body.status ?? 'draft',
        created_by: userId,
      })
      .select()
      .single();

    if (error || !template) {
      return NextResponse.json({ error: error?.message ?? 'Failed to create template' }, { status: 500 });
    }

    const fields = normalizeTemplateFields(mode, body.fields ?? []);
    if (fields.length > 0) {
      const { error: fieldsError } = await admin
        .from('contract_template_fields')
        .insert(fields.map((field) => ({ ...field, template_id: template.id })));

      if (fieldsError) {
        return NextResponse.json({ error: fieldsError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ template });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
