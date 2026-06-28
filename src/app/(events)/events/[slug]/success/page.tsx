export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import EventSuccessClient from '@/components/events/EventSuccessClient';
import { createClient } from '@/lib/supabase/server';
import { eventPublicUrl } from '@/lib/urls';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ community?: string }>;
};

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: 'Registration Confirmed — Aorthar Live',
    robots: { index: false, follow: false },
    alternates: { canonical: `${eventPublicUrl(slug)}/success` },
  };
}

export default async function EventSuccessPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const supabase = await createClient();

  const { data: webinar } = await supabase
    .from('webinars')
    .select('slug, title, whatsapp_community_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!webinar) notFound();

  return (
    <EventSuccessClient
      eventTitle={webinar.title}
      eventUrl={eventPublicUrl(webinar.slug)}
      communityUrl={webinar.whatsapp_community_url}
      shouldRedirectToCommunity={query.community === '1'}
    />
  );
}
