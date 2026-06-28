import type { ContractPaymentInput, ContractPaymentStatus } from '@/lib/contracts/types';

export function nextPaymentStatus(input: ContractPaymentInput): ContractPaymentStatus {
  if (input.mode !== 'client' || !input.amountNgn || input.amountNgn <= 0) {
    return 'not_required';
  }

  if (input.manualPaid) return 'manual_paid';
  if (input.paystackStatus === 'success') return 'paid';
  if (input.paystackStatus === 'failed' || input.paystackStatus === 'abandoned') return 'failed';

  return 'pending';
}
