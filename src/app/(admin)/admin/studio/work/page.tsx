export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { hasAdminPermission, normalizeAdminLevel } from '@/lib/admin/permissions';
import { requireRole } from '@/lib/auth';
import { getAdminCaseStudies } from '@/lib/studio/case-studies';
import type { ReactElement } from 'react';
import StudioCaseStudiesAdmin from './StudioCaseStudiesAdmin';

export default async function AdminStudioWorkPage(): Promise<ReactElement> {
  const { profile } = await requireRole('admin');
  const adminLevel = normalizeAdminLevel((profile as { admin_level?: string | null }).admin_level);
  if (!hasAdminPermission(adminLevel, 'content')) redirect('/unauthorized');

  const studies = await getAdminCaseStudies();
  return <StudioCaseStudiesAdmin studies={studies} />;
}
