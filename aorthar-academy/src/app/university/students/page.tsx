import { redirect } from 'next/navigation';

export default function UniversityStudentsAliasPage() {
  redirect('/admin/users?module=university');
}
