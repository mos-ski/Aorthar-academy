import { redirect } from 'next/navigation';

// Backward-compatible typo alias: /univeristy/transaction -> /university/transaction
export default function UniveristyTransactionTypoAliasPage() {
  redirect('/admin/ops?tab=transactions&module=university');
}
