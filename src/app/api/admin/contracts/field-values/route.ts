import { NextRequest, NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';

const SETTINGS_KEY = 'contract_saved_field_values';
const MAX_VALUES_PER_FIELD = 12;

type SavedFieldValues = Record<string, string[]>;

export async function GET(request: NextRequest) {
  try {
    await requireAdminApi('finance');
    const fieldKey = request.nextUrl.searchParams.get('field_key')?.trim();
    if (!fieldKey) return NextResponse.json({ values: [] });

    const savedValues = await readSavedFieldValues();
    return NextResponse.json({ values: savedValues[fieldKey] ?? [] });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminApi('finance');
    const body = await request.json() as { field_key?: string; value?: string };
    const fieldKey = body.field_key?.trim();
    const value = body.value?.trim();

    if (!fieldKey || !value) {
      return NextResponse.json({ error: 'Field key and value are required' }, { status: 400 });
    }

    const savedValues = await readSavedFieldValues();
    const currentValues = savedValues[fieldKey] ?? [];
    savedValues[fieldKey] = [
      value,
      ...currentValues.filter((candidate) => candidate.toLowerCase() !== value.toLowerCase()),
    ].slice(0, MAX_VALUES_PER_FIELD);

    const admin = createAdminClient();
    const { error } = await admin
      .from('site_settings')
      .upsert({
        key: SETTINGS_KEY,
        label: 'Contract saved field values',
        group_name: 'contracts',
        value: JSON.stringify(savedValues),
      }, { onConflict: 'key' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ values: savedValues[fieldKey] });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}

async function readSavedFieldValues(): Promise<SavedFieldValues> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('site_settings')
    .select('value')
    .eq('key', SETTINGS_KEY)
    .maybeSingle();

  if (!data?.value) return {};

  try {
    const parsed = JSON.parse(data.value) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed)
        .filter((entry): entry is [string, unknown[]] => Array.isArray(entry[1]))
        .map(([key, values]) => [
          key,
          values
            .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
            .slice(0, MAX_VALUES_PER_FIELD),
        ]),
    );
  } catch {
    return {};
  }
}
