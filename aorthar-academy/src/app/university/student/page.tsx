import { redirect } from 'next/navigation';

export default function UniversityStudentAliasPage() {
  redirect('/admin/ops?tab=students&module=university');
}
