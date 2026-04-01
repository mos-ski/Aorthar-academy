import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type Props = { params: Promise<{ slug: string }> };

// Called after Paystack redirects back to /courses-app/learn/[slug]
// → finds the first lesson and forwards the user there
export default async function LearnCoursePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/courses-app/learn/${slug}`);

  const { data: course } = await supabase
    .from('standalone_courses')
    .select('id')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!course) notFound();

  // Verify purchase
  const { data: purchase } = await supabase
    .from('standalone_purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle();

  if (!purchase) redirect(`/courses-app/${slug}`);

  // Get first lesson
  const { data: first } = await supabase
    .from('standalone_lessons')
    .select('id')
    .eq('course_id', course.id)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .limit(1)
    .single();

  if (!first) redirect(`/courses-app/${slug}`);

  redirect(`/courses-app/learn/${slug}/${first.id}`);
}
