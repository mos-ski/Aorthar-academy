import type { ContractTemplateField } from '@/lib/contracts/types';
import { humanizeContractFieldKey } from '@/lib/contracts/field-suggestions';
import { hasMeaningfulContractValue } from '@/lib/contracts/field-state';

const PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export function extractPlaceholderKeys(html: string): string[] {
  const keys: string[] = [];
  const seen = new Set<string>();

  for (const match of html.matchAll(PLACEHOLDER_PATTERN)) {
    const key = match[1]?.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    keys.push(key);
  }

  return keys;
}

export function renderContractHtml(
  html: string,
  values: Record<string, string>,
  fields: ContractTemplateField[] = [],
): string {
  const fieldsByKey = new Map(fields.map((field) => [field.key, field]));

  return html.replace(PLACEHOLDER_PATTERN, (_match, rawKey: string) => {
    const key = rawKey.trim();
    const value = values[key]?.trim();
    const field = fieldsByKey.get(key);

    if (!value) {
      return `<span data-contract-placeholder="${escapeHtml(key)}">{{${escapeHtml(key)}}}</span>`;
    }

    if (field?.fieldType === 'long_text') {
      return sanitizeRichHtml(value);
    }

    return escapeHtml(value).replace(/\n/g, '<br>');
  });
}

export function findMissingRequiredFields(
  fields: ContractTemplateField[],
  values: Record<string, string>,
): ContractTemplateField[] {
  return fields
    .filter((field) => field.required)
    .filter((field) => !hasMeaningfulContractValue(values[field.key]));
}

export function findMissingContractFields(
  html: string,
  fields: ContractTemplateField[],
  values: Record<string, string>,
): ContractTemplateField[] {
  const fieldsByKey = new Map(fields.map((field) => [field.key, field]));
  const placeholderFields = extractPlaceholderKeys(html).map((key, index) => {
    const field = fieldsByKey.get(key);
    if (field) return field;

    return {
      key,
      label: humanizeContractFieldKey(key),
      mode: fields[0]?.mode ?? 'client',
      fieldType: 'text',
      required: true,
      sortOrder: fields.length + index,
    } satisfies ContractTemplateField;
  });

  const allFieldsByKey = new Map<string, ContractTemplateField>();
  [...fields, ...placeholderFields].forEach((field) => allFieldsByKey.set(field.key, field));

  return Array.from(allFieldsByKey.values())
    .filter((field) => field.required || extractPlaceholderKeys(html).includes(field.key))
    .filter((field) => !hasMeaningfulContractValue(values[field.key]));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeRichHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<\/?(iframe|object|embed|form|input|button|textarea|select|option|link|meta)[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, '')
    .replace(/\n/g, '');
}
