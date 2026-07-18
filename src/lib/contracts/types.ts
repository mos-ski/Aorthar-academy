export type ContractDocumentType = 'agreement' | 'nda';

export type ContractMode = 'employee' | 'contractor' | 'client' | 'nda';

export type NdaRecipientRelationship =
  | 'employee'
  | 'contractor'
  | 'client'
  | 'partner'
  | 'vendor'
  | 'other';

export type NdaMetadata = {
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  recipientRelationship: NdaRecipientRelationship | '';
  recipientCompany?: string | null;
  projectName: string;
  projectPurpose: string;
  effectiveDate: string;
  confidentialityTerm: string;
};

export type ContractFieldType =
  | 'text'
  | 'long_text'
  | 'money'
  | 'date'
  | 'email'
  | 'phone'
  | 'address'
  | 'url'
  | 'checkbox';

export type ContractTemplateField = {
  key: string;
  label: string;
  mode: ContractMode;
  fieldType: ContractFieldType;
  required: boolean;
  sortOrder: number;
  helpText?: string | null;
};

export type ContractPaymentStatus =
  | 'not_required'
  | 'pending'
  | 'paid'
  | 'manual_paid'
  | 'failed';

export type ContractPaymentInput = {
  mode: ContractMode;
  amountNgn?: number | null;
  manualPaid?: boolean;
  paystackStatus?: 'success' | 'failed' | 'abandoned' | 'pending' | null;
};
