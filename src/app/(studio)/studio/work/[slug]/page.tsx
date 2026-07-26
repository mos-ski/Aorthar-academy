import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedCaseStudies, getPublishedCaseStudyBySlug } from '@/lib/studio/case-studies';
import { resolveNextCaseStudy } from '@/lib/studio/case-study-schema';
import CaseStudyRenderer from '../CaseStudyRenderer';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = await getPublishedCaseStudyBySlug(slug);
  if (!study) return {};

  return {
    title: study.seo_title ?? `${study.title} - Aorthar Studio`,
    description: study.seo_description ?? study.subtitle ?? undefined,
    openGraph: {
      title: study.seo_title ?? study.title,
      description: study.seo_description ?? study.subtitle ?? undefined,
      images: study.og_image_url || study.cover_url ? [{ url: study.og_image_url ?? study.cover_url! }] : undefined,
    },
  };
}

export default async function StudioCaseStudyPage({ params }: Props): Promise<React.ReactElement> {
  const { slug } = await params;
  const study = await getPublishedCaseStudyBySlug(slug);
  if (!study) notFound();

  const studies = await getPublishedCaseStudies();
  const nextStudy = resolveNextCaseStudy(study.id, studies);

  return <CaseStudyRenderer study={study} nextStudy={nextStudy} />;
}
