import { redirect } from 'next/navigation';

export default function UniversityTransactionAliasPage() {
  redirect('/admin/payments?module=university');
}
