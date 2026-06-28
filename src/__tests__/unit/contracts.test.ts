import { describe, expect, it } from 'vitest';
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
import { nextPaymentStatus } from '@/lib/contracts/payments';
import type { ContractTemplateField } from '@/lib/contracts/types';

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
});
