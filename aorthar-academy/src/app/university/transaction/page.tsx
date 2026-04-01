import { redirect } from 'next/navigation';

export default function UniversityTransactionAliasPage() {
  redirect('/admin/ops?tab=transactions&module=university');
}
