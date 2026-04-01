import { redirect } from 'next/navigation';

export default function UniversityCoursesAliasPage() {
  redirect('/admin/ops?tab=courses&courseTab=university&module=university');
}
