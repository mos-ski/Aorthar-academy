export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import { hasAdminPermission, normalizeAdminLevel } from '@/lib/admin/permissions';
import { requireRole } from '@/lib/auth';
import { getAdminCaseStudyById } from '@/lib/studio/case-studies';
import type { ReactElement } from 'react';
import CaseStudyEditor from './CaseStudyEditor';

type Props = { params: Promise<{ id: string }> };

export default async function AdminStudioWorkEditorPage({ params }: Props): Promise<ReactElement> {
  const { profile } = await requireRole('admin');
  const adminLevel = normalizeAdminLevel((profile as { admin_level?: string | null }).admin_level);
  if (!hasAdminPermission(adminLevel, 'content')) redirect('/unauthorized');

  const { id } = await params;
  const study = await getAdminCaseStudyById(id);
  if (!study) notFound();

  return <CaseStudyEditor study={study} />;
}
