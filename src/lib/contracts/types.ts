export type ContractMode = 'employee' | 'contractor' | 'client';

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
