import type { NdaMetadata, NdaRecipientRelationship } from '@/lib/contracts/types';

type NdaDocumentIdentity = {
  document_type?: string | null;
  mode?: string | null;
};

export type NdaValidationIssue = {
  field: string;
  message: string;
};

type NdaWhatsAppInput = {
  phone: string;
  recipientName: string;
  projectName: string;
  signingUrl: string;
};

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const NDA_RELATIONSHIPS: NdaRecipientRelationship[] = [
  'employee',
  'contractor',
  'client',
  'partner',
  'vendor',
  'other',
];

export function isNdaDocument(document: NdaDocumentIdentity): boolean {
  return document.document_type === 'nda' || document.mode === 'nda';
}

export function validateNdaMetadata(input: NdaMetadata): NdaValidationIssue[] {
  const issues: NdaValidationIssue[] = [];

  if (!input.recipientName.trim()) {
    issues.push({ field: 'recipient_name', message: 'Recipient legal name is required' });
  }
  if (!EMAIL_PATTERN.test(input.recipientEmail.trim())) {
    issues.push({ field: 'recipient_email', message: 'A valid recipient email is required' });
  }
  if (!normalizeWhatsAppPhone(input.recipientPhone)) {
    issues.push({ field: 'recipient_phone', message: 'Recipient phone or WhatsApp number is required' });
  }
  if (!input.recipientRelationship || !NDA_RELATIONSHIPS.includes(input.recipientRelationship)) {
    issues.push({ field: 'recipient_relationship', message: 'Recipient relationship is required' });
  }
  if (!input.projectName.trim()) {
    issues.push({ field: 'project_name', message: 'Project name is required' });
  }
  if (!input.projectPurpose.trim()) {
    issues.push({ field: 'project_purpose', message: 'Project purpose is required' });
  }
  if (!input.effectiveDate.trim()) {
    issues.push({ field: 'effective_date', message: 'Effective date is required' });
  }
  if (!input.confidentialityTerm.trim()) {
    issues.push({ field: 'confidentiality_term', message: 'Confidentiality term is required' });
  }

  return issues;
}

export function ndaMetadataFieldValues(input: NdaMetadata): Record<string, string> {
  return {
    recipient_name: input.recipientName.trim(),
    recipient_email: input.recipientEmail.trim().toLowerCase(),
    recipient_phone: input.recipientPhone.trim(),
    recipient_relationship: humanizeRelationship(input.recipientRelationship),
    recipient_company: input.recipientCompany?.trim() ?? '',
    project_name: input.projectName.trim(),
    project_purpose: input.projectPurpose.trim(),
    effective_date: input.effectiveDate.trim(),
    confidentiality_term: input.confidentialityTerm.trim(),
  };
}

export function normalizeWhatsAppPhone(value: string, defaultCountryCode: string = '234'): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `${defaultCountryCode}${digits.slice(1)}`;
  return digits;
}

export function buildNdaWhatsAppUrl(input: NdaWhatsAppInput): string {
  const phone = normalizeWhatsAppPhone(input.phone);
  const message = [
    `Hi ${input.recipientName.trim() || 'there'},`,
    `Aorthar has sent you a Non-Disclosure Agreement for ${input.projectName.trim() || 'your project'}.`,
    `Please review and sign it using this secure link: ${input.signingUrl}`,
  ].join(' ');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function humanizeRelationship(value: NdaRecipientRelationship | ''): string {
  if (!value) return '';
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
