import type { ContractFieldType } from '@/lib/contracts/types';

type SuggestionField = {
  key: string;
  label: string;
  fieldType: ContractFieldType;
};

const AORTHAR_DEFAULTS: Record<string, string[]> = {
  provider_name: ['Aorthar Design Studio'],
  provider_email: ['aorthardesignteam@gmail.com'],
  provider_phone: ['09058653400'],
  provider_address: ['33 Adeshina Street, Fagba, Lagos State'],
  provider_website: ['https://www.aorthar.com'],
  company_name: ['Aorthar Design Studio'],
  company_email: ['aorthardesignteam@gmail.com'],
  company_phone: ['09058653400'],
  company_address: ['33 Adeshina Street, Fagba, Lagos State'],
  company_website: ['https://www.aorthar.com'],
  bank_details: ['Bank Transfer: Opay | Account Name: Adedamola Adewale | Account No: 8103674006'],
  payment_options: ['Paystack checkout or direct bank transfer to the account details provided by Aorthar.'],
};

const DURATION_SUGGESTIONS = [
  '24 hours',
  '48 hours',
  '2 business days',
  '5 business days',
  '7 days',
  '14 days',
  '30 days',
  '3 months',
  '6 months',
  '1 year',
];

const WORK_HOUR_SUGGESTIONS = [
  'Monday - Friday, 9:00 AM - 6:00 PM WAT',
  'Flexible remote hours',
  '20 hours per week',
  '40 hours per week',
];

const TERM_SUGGESTIONS = ['1 month', '3 months', '6 months', '12 months', '1 year'];
const REVISION_SUGGESTIONS = ['1 round', '2 rounds', '3 rounds'];
const REPORTING_SUGGESTIONS = ['Adewale Adedamola', 'The Principal', 'Aorthar Management'];
const CHANNEL_SUGGESTIONS = ['Email and WhatsApp', 'Email, WhatsApp, and Google Meet', 'Slack, email, and weekly calls'];

const RICH_FIELD_PATTERNS = [
  'responsibil',
  'deliverable',
  'milestone',
  'scope',
  'duties',
  'obligation',
  'requirement',
  'exclusion',
  'payment_schedule',
  'project_description',
  'service_description',
  'confidential',
  'termination',
  'intellectual_property',
];

export function getContractFieldSuggestions(field: SuggestionField): string[] {
  const normalized = normalizeFieldText(field);
  const suggestions = new Set<string>(AORTHAR_DEFAULTS[field.key] ?? []);

  if (matchesAny(normalized, ['day', 'days', 'period', 'duration', 'deadline', 'notice', 'window', 'response'])) {
    DURATION_SUGGESTIONS.forEach((value) => suggestions.add(value));
  }

  if (matchesAny(normalized, ['work_hour', 'working_hour', 'core_hour', 'availability', 'schedule'])) {
    WORK_HOUR_SUGGESTIONS.forEach((value) => suggestions.add(value));
  }

  if (matchesAny(normalized, ['term', 'contract_length', 'engagement_period'])) {
    TERM_SUGGESTIONS.forEach((value) => suggestions.add(value));
  }

  if (matchesAny(normalized, ['revision'])) {
    REVISION_SUGGESTIONS.forEach((value) => suggestions.add(value));
  }

  if (matchesAny(normalized, ['report_to', 'reports_to', 'supervisor', 'principal'])) {
    REPORTING_SUGGESTIONS.forEach((value) => suggestions.add(value));
  }

  if (matchesAny(normalized, ['communication', 'channel'])) {
    CHANNEL_SUGGESTIONS.forEach((value) => suggestions.add(value));
  }

  return Array.from(suggestions).slice(0, 12);
}

export function shouldUseRichContractInput(field: SuggestionField): boolean {
  if (field.fieldType === 'long_text') return true;
  const normalized = normalizeFieldText(field);
  return matchesAny(normalized, RICH_FIELD_PATTERNS);
}

export function suggestContractFieldType(key: string, label: string): ContractFieldType {
  const normalized = `${key} ${label}`.toLowerCase();

  if (matchesAny(normalized, ['email'])) return 'email';
  if (matchesAny(normalized, ['phone', 'whatsapp', 'mobile'])) return 'phone';
  if (matchesAny(normalized, ['address', 'location'])) return 'address';
  if (matchesAny(normalized, ['date', 'commence', 'start_day', 'deadline'])) return 'date';
  if (matchesAny(normalized, ['amount', 'salary', 'fee', 'price', 'deposit', 'balance', 'budget'])) return 'money';
  if (matchesAny(normalized, ['url', 'website', 'link'])) return 'url';
  if (matchesAny(normalized, RICH_FIELD_PATTERNS)) return 'long_text';

  return 'text';
}

export function humanizeContractFieldKey(key: string): string {
  return key
    .replace(/[_.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeFieldText(field: SuggestionField): string {
  return `${field.key} ${field.label}`.toLowerCase();
}

function matchesAny(value: string, patterns: string[]): boolean {
  return patterns.some((pattern) => value.includes(pattern));
}
