import type { ContractTemplateField } from '@/lib/contracts/types';

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

export function renderContractHtml(html: string, values: Record<string, string>): string {
  return html.replace(PLACEHOLDER_PATTERN, (_match, rawKey: string) => {
    const key = rawKey.trim();
    const value = values[key]?.trim();

    if (!value) {
      return `<span data-contract-placeholder="${escapeHtml(key)}">{{${escapeHtml(key)}}}</span>`;
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
    .filter((field) => !values[field.key]?.trim());
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
