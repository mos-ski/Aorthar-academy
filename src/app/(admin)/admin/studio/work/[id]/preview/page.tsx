export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import { hasAdminPermission, normalizeAdminLevel } from '@/lib/admin/permissions';
import { requireRole } from '@/lib/auth';
import { getAdminCaseStudyById } from '@/lib/studio/case-studies';
import type { ReactElement } from 'react';
import PreviewPage from './PreviewPage';

type Props = { params: Promise<{ id: string }> };

export default async function AdminStudioWorkPreviewPage({ params }: Props): Promise<ReactElement> {
  const { profile } = await requireRole('admin');
  const adminLevel = normalizeAdminLevel((profile as { admin_level?: string | null }).admin_level);
  if (!hasAdminPermission(adminLevel, 'content')) redirect('/unauthorized');

  const { id } = await params;
  const study = await getAdminCaseStudyById(id);
  if (!study) notFound();

  return <PreviewPage study={study} />;
}
