import type { createAdminClient } from '@/lib/supabase/admin';
import type { ContractFieldType, ContractMode } from '@/lib/contracts/types';

type FieldPayload = {
  key: string;
  label: string;
  field_type?: ContractFieldType;
  is_required?: boolean;
  help_text?: string | null;
  sort_order?: number;
};

export function normalizeTemplateFields(mode: ContractMode, fields: FieldPayload[]) {
  return fields
    .filter((field) => field.key.trim() && field.label.trim())
    .map((field, index) => ({
      mode,
      key: field.key.trim(),
      label: field.label.trim(),
      field_type: field.field_type ?? 'text',
      is_required: field.is_required ?? true,
      help_text: field.help_text?.trim() || null,
      sort_order: field.sort_order ?? (index + 1) * 10,
    }));
}

export async function upsertContractFieldValues(
  admin: ReturnType<typeof createAdminClient>,
  contractId: string,
  values: Record<string, string>,
  fieldMeta: Record<string, { label: string; fieldType: string }> = {},
): Promise<void> {
  const rows = Object.entries(values).map(([fieldKey, value]) => ({
    contract_id: contractId,
    field_key: fieldKey,
    field_label: fieldMeta[fieldKey]?.label ?? fieldKey.replace(/[_-]+/g, ' '),
    field_type: fieldMeta[fieldKey]?.fieldType ?? 'text',
    value: String(value ?? ''),
  }));

  if (rows.length === 0) return;

  await admin
    .from('contract_field_values')
    .upsert(rows, { onConflict: 'contract_id,field_key' });
}
