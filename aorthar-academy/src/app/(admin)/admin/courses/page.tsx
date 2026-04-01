import { redirect } from 'next/navigation';

export default function AdminCoursesLegacyPage() {
  redirect('/admin/ops?tab=courses&courseTab=university');
}
