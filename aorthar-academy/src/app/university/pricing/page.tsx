import { redirect } from 'next/navigation';

export default function UniversityPricingAliasPage() {
  redirect('/admin/ops?tab=transactions&module=university');
}
