import { redirect } from 'next/navigation';

export default function UniversityPricingAliasPage() {
  redirect('/admin/pricing?module=university');
}
