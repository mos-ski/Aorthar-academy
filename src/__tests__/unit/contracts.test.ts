import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildNdaWhatsAppUrl,
  isNdaDocument,
  ndaMetadataFieldValues,
  validateNdaMetadata,
} from '@/lib/contracts/nda';
import {
  extractPlaceholderKeys,
  findMissingContractFields,
  findMissingRequiredFields,
  renderContractHtml,
} from '@/lib/contracts/placeholders';
import {
  getContractFieldSuggestions,
  shouldUseRichContractInput,
  suggestContractFieldType,
} from '@/lib/contracts/field-suggestions';
import { createTokenExpiry, isTokenExpired } from '@/lib/contracts/tokens';
import { getContractPlaceholderState, hasMeaningfulContractValue } from '@/lib/contracts/field-state';
import { nextPaymentStatus } from '@/lib/contracts/payments';
import type { ContractTemplateField } from '@/lib/contracts/types';

const validNdaMetadata = {
  recipientName: 'Ada Lovelace',
  recipientEmail: 'ada@example.com',
  recipientPhone: '0803 123 4567',
  recipientRelationship: 'contractor' as const,
  recipientCompany: 'Analytical Engines Ltd',
  projectName: 'Atlas',
  projectPurpose: 'Design and deliver the private Atlas client portal.',
  effectiveDate: '2026-07-18',
  confidentialityTerm: '5 years',
};

const fields: ContractTemplateField[] = [
  {
    key: 'client_name',
    label: 'Client Name',
    mode: 'client',
    fieldType: 'text',
    required: true,
    sortOrder: 1,
  },
  {
    key: 'deliverables',
    label: 'Deliverables',
    mode: 'client',
    fieldType: 'long_text',
    required: true,
    sortOrder: 2,
  },
  {
    key: 'receipt_note',
    label: 'Receipt Note',
    mode: 'client',
    fieldType: 'long_text',
    required: false,
    sortOrder: 3,
  },
];

describe('contract placeholders', () => {
  it('extracts unique placeholder keys in first-seen order', () => {
    const html = '<p>Hello {{ client_name }}</p><p>{{deliverables}}</p><p>{{client_name}}</p>';

    expect(extractPlaceholderKeys(html)).toEqual(['client_name', 'deliverables']);
  });

  it('renders filled placeholders and leaves missing placeholders visible', () => {
    const html = '<p>Hello {{client_name}}</p><p>{{ deliverables }}</p>';

    expect(renderContractHtml(html, { client_name: 'Ada Lovelace' })).toBe(
      '<p>Hello Ada Lovelace</p><p><span data-contract-placeholder="deliverables">{{deliverables}}</span></p>',
    );
  });

  it('returns only required fields that have no meaningful value', () => {
    const missing = findMissingRequiredFields(fields, {
      client_name: 'Ada Lovelace',
      deliverables: '   ',
      receipt_note: '',
    });

    expect(missing.map((field) => field.key)).toEqual(['deliverables']);
  });

  it('blocks unfilled placeholders even when the template field row is missing', () => {
    const html = '<p>{{client_name}}</p><p>{{date_to_commence}}</p>';

    const missing = findMissingContractFields(html, fields, {
      client_name: 'Ada Lovelace',
    });

    expect(missing).toEqual(expect.arrayContaining([
      expect.objectContaining({
        key: 'date_to_commence',
        label: 'Date To Commence',
        required: true,
      }),
    ]));
  });

  it('escapes normal text fields and preserves rich long-text fields', () => {
    const html = '<p>{{client_name}}</p><section>{{deliverables}}</section>';

    expect(
      renderContractHtml(
        html,
        {
          client_name: '<script>alert("x")</script>',
          deliverables: '<ul><li>Landing page</li><li>Dashboard</li></ul>',
        },
        fields,
      ),
    ).toBe(
      '<p>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;</p><section><ul><li>Landing page</li><li>Dashboard</li></ul></section>',
    );
  });
});

describe('contract smart field suggestions', () => {
  it('offers duration options with complete wording', () => {
    expect(
      getContractFieldSuggestions({
        key: 'notice_period',
        label: 'Notice Period',
        fieldType: 'text',
      }),
    ).toEqual(expect.arrayContaining(['7 days', '30 days', '3 months', '6 months', '1 year']));
  });

  it('offers Aorthar defaults for provider details', () => {
    expect(
      getContractFieldSuggestions({
        key: 'provider_email',
        label: 'Provider Email',
        fieldType: 'email',
      }),
    ).toContain('aorthardesignteam@gmail.com');
  });

  it('offers date input values for issued date fields', () => {
    const suggestions = getContractFieldSuggestions({
      key: 'date_issued',
      label: 'Date Issued',
      fieldType: 'date',
    });

    expect(suggestions[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('offers fallback suggestions for plain fields', () => {
    expect(
      getContractFieldSuggestions({
        key: 'custom_clause',
        label: 'Custom Clause',
        fieldType: 'text',
      }),
    ).toEqual(expect.arrayContaining(['To be confirmed', 'As agreed by both parties']));
  });

  it('detects rich contract input fields', () => {
    expect(shouldUseRichContractInput({ key: 'responsibilities', label: 'Responsibilities', fieldType: 'text' })).toBe(true);
    expect(shouldUseRichContractInput({ key: 'client_phone', label: 'Client Phone', fieldType: 'phone' })).toBe(false);
  });

  it('suggests useful field types from missing placeholder names', () => {
    expect(suggestContractFieldType('date_to_commence', 'Date To Commence')).toBe('date');
    expect(suggestContractFieldType('company_address', 'Company Address')).toBe('address');
    expect(suggestContractFieldType('deliverables', 'Deliverables')).toBe('long_text');
  });
});

describe('contract field state', () => {
  it('treats empty optional placeholders as unfilled until a value is entered', () => {
    expect(getContractPlaceholderState(undefined)).toBe('empty');
    expect(getContractPlaceholderState('')).toBe('empty');
    expect(getContractPlaceholderState('<p></p>')).toBe('empty');
    expect(getContractPlaceholderState('https://aorthar.com')).toBe('filled');
  });

  it('detects meaningful rich text content', () => {
    expect(hasMeaningfulContractValue('<ul><li>&nbsp;</li></ul>')).toBe(false);
    expect(hasMeaningfulContractValue('<ul><li>Lead design reviews</li></ul>')).toBe(true);
  });
});

describe('contract signing tokens', () => {
  it('creates a token expiry exactly seven days from the given instant', () => {
    const now = new Date('2026-06-28T10:30:00.000Z');

    expect(createTokenExpiry(now).toISOString()).toBe('2026-07-05T10:30:00.000Z');
  });

  it('treats the expiry instant as expired', () => {
    expect(
      isTokenExpired(
        '2026-07-05T10:30:00.000Z',
        new Date('2026-07-05T10:30:00.000Z'),
      ),
    ).toBe(true);
  });
});

describe('contract payments', () => {
  it('marks employee contracts as not requiring payment', () => {
    expect(nextPaymentStatus({ mode: 'employee', amountNgn: 500000 })).toBe('not_required');
  });

  it('marks client contracts with an amount as pending', () => {
    expect(nextPaymentStatus({ mode: 'client', amountNgn: 250000 })).toBe('pending');
  });

  it('marks manually paid contracts as manual_paid', () => {
    expect(nextPaymentStatus({ mode: 'client', amountNgn: 250000, manualPaid: true })).toBe('manual_paid');
  });

  it('marks successful Paystack payments as paid', () => {
    expect(nextPaymentStatus({ mode: 'client', amountNgn: 250000, paystackStatus: 'success' })).toBe('paid');
  });

  it('never requires payment for an NDA', () => {
    expect(nextPaymentStatus({ mode: 'nda', amountNgn: 250000 })).toBe('not_required');
  });
});

describe('NDA contracts', () => {
  it('classifies only NDA documents as NDAs', () => {
    expect(isNdaDocument({ document_type: 'nda', mode: 'nda' })).toBe(true);
    expect(isNdaDocument({ document_type: 'agreement', mode: 'client' })).toBe(false);
  });

  it('requires recipient and project identity before sending', () => {
    expect(validateNdaMetadata({
      recipientName: '',
      recipientEmail: 'not-an-email',
      recipientPhone: '',
      recipientRelationship: '',
      projectName: '',
      projectPurpose: '',
      effectiveDate: '',
      confidentialityTerm: '',
    }).map((issue) => issue.field)).toEqual([
      'recipient_name',
      'recipient_email',
      'recipient_phone',
      'recipient_relationship',
      'project_name',
      'project_purpose',
      'effective_date',
      'confidentiality_term',
    ]);
  });

  it('maps NDA metadata into immutable template values', () => {
    expect(ndaMetadataFieldValues(validNdaMetadata)).toMatchObject({
      recipient_name: 'Ada Lovelace',
      recipient_email: 'ada@example.com',
      recipient_phone: '0803 123 4567',
      recipient_relationship: 'Contractor',
      project_name: 'Atlas',
    });
  });

  it('builds a manual WhatsApp share URL from a Nigerian local number', () => {
    const url = buildNdaWhatsAppUrl({
      phone: '0803 123 4567',
      recipientName: 'Ada',
      projectName: 'Atlas',
      signingUrl: 'https://aorthar.com/contracts/sign/token',
    });

    expect(url).toContain('https://wa.me/2348031234567?text=');
    expect(decodeURIComponent(url)).toContain('Atlas');
  });

  it('seeds a permanent no-portfolio restriction', () => {
    const migrationName = readdirSync('supabase/migrations')
      .find((name) => name.endsWith('_nda_inside_contracts.sql'));

    expect(migrationName).toBeDefined();
    const migration = readFileSync(join('supabase/migrations', migrationName ?? ''), 'utf8');
    expect(migration.toLowerCase()).toContain('portfolio');
    expect(migration.toLowerCase()).toContain('prior written permission');
    expect(migration.toLowerCase()).toContain('survive permanently');
  });
});
