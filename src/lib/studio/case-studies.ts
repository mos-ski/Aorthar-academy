import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  parseCaseStudyBlock,
  type StudioCaseStudyAdminDetail,
  type StudioCaseStudyAdminSummary,
  type StudioCaseStudyDetail,
  type StudioCaseStudySummary,
} from '@/lib/studio/case-study-schema';

const summaryFields = 'id, slug, title, subtitle, client, year, tags, services, cover_url, cover_alt, cover_media_type, is_featured, display_order, published_at';
const detailFields = `${summaryFields}, release_date, featured_in, preview_video_url, seo_title, seo_description, og_image_url`;
const blockFields = 'id, case_study_id, type, sort_order, content';

export async function getPublishedCaseStudies(): Promise<StudioCaseStudySummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('studio_case_studies')
    .select(summaryFields)
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true })
    .order('published_at', { ascending: false });

  if (error || !data) return [];
  return data as StudioCaseStudySummary[];
}

export async function getPublishedCaseStudyBySlug(slug: string): Promise<StudioCaseStudyDetail | null> {
  const supabase = await createClient();
  const { data: caseStudy, error } = await supabase
    .from('studio_case_studies')
    .select(detailFields)
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !caseStudy) return null;

  const { data: blocks, error: blocksError } = await supabase
    .from('studio_case_study_blocks')
    .select(blockFields)
    .eq('case_study_id', caseStudy.id)
    .order('sort_order', { ascending: true });

  if (blocksError) return null;
  return { ...caseStudy, blocks: (blocks ?? []).map(parseCaseStudyBlock) } as StudioCaseStudyDetail;
}

export async function getAdminCaseStudies(): Promise<StudioCaseStudyAdminSummary[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('studio_case_studies')
    .select(`${summaryFields}, status, updated_at`)
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true })
    .order('published_at', { ascending: false });

  if (error || !data) return [];
  return data as StudioCaseStudyAdminSummary[];
}

export async function getAdminCaseStudyById(id: string): Promise<StudioCaseStudyAdminDetail | null> {
  const admin = createAdminClient();
  const { data: caseStudy, error } = await admin
    .from('studio_case_studies')
    .select(`${detailFields}, status, created_at, updated_at`)
    .eq('id', id)
    .maybeSingle();

  if (error || !caseStudy) return null;

  const { data: blocks, error: blocksError } = await admin
    .from('studio_case_study_blocks')
    .select(blockFields)
    .eq('case_study_id', caseStudy.id)
    .order('sort_order', { ascending: true });

  if (blocksError) return null;
  return { ...caseStudy, blocks: (blocks ?? []).map(parseCaseStudyBlock) } as StudioCaseStudyAdminDetail;
}
