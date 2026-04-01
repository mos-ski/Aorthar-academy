import { redirect } from 'next/navigation';

export default function AdminUsersLegacyPage() {
  redirect('/admin/ops?tab=students');
}
