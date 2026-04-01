import { redirect } from 'next/navigation';

export default function AdminStandaloneCoursesLegacyPage() {
  redirect('/admin/ops?tab=courses&courseTab=external');
}
