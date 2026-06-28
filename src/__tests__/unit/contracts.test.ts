import { describe, expect, it } from 'vitest';
import {
  extractPlaceholderKeys,
  findMissingRequiredFields,
  renderContractHtml,
} from '@/lib/contracts/placeholders';
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
