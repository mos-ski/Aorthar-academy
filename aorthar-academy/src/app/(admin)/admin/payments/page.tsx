import { redirect } from 'next/navigation';

export default function AdminPaymentsLegacyPage() {
  redirect('/admin/ops?tab=transactions');
}
