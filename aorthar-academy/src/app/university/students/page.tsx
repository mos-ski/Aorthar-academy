import { redirect } from 'next/navigation';

export default function UniversityStudentsAliasPage() {
  redirect('/admin/ops?tab=students&module=university');
}
