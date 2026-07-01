export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import RegisterButton from '@/components/events/RegisterButton';
import VerifyPaymentOnReturn from '@/components/events/VerifyPaymentOnReturn';
import { eventPublicUrl } from '@/lib/urls';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;
const LIVE_JOIN_WINDOW_MS = 3 * 60 * 60 * 1000;

type Params = { params: Promise<{ slug: string }> };

function eventDescription(description: string): string {
  const clean = description.replace(/\s+/g, ' ').trim();
  return clean.length > 180 ? `${clean.slice(0, 177)}...` : clean;
}

function normalizeJoinUrl(url: string): string {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: webinar } = await supabase
    .from('webinars')
    .select('slug, title, description, thumbnail_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!webinar) return { title: 'Event Not Found' };

  const title = `${webinar.title} — Aorthar Live`;
  const description = eventDescription(webinar.description || 'Reserve your spot for this Aorthar live session.');
  const url = eventPublicUrl(webinar.slug);
  const image = webinar.thumbnail_url ? [{ url: webinar.thumbnail_url, alt: webinar.title }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: image,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: webinar.thumbnail_url ? [webinar.thumbnail_url] : undefined,
    },
  };
}

export default async function EventDetailPage({ params }: Params) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: webinar } = await supabase
    .from('webinars')
    .select('id, slug, title, description, scheduled_at, duration_minutes, price_ngn, thumbnail_url, whatsapp_community_url, join_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!webinar) notFound();

  const startsAt = new Date(webinar.scheduled_at);
  const joinUrl = normalizeJoinUrl(webinar.join_url);
  const showJoinLink = Boolean(joinUrl) && Date.now() >= startsAt.getTime() - LIVE_JOIN_WINDOW_MS;
  const when = new Date(webinar.scheduled_at).toLocaleString('en-NG', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  });

  return (
    <div>
      <Suspense fallback={null}>
        <VerifyPaymentOnReturn slug={slug} />
      </Suspense>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <section>
          <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
            {webinar.thumbnail_url ? (
              <Image src={webinar.thumbnail_url} alt="" fill className="object-cover" priority unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                AORTHAR LIVE
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{when} (WAT) · {webinar.duration_minutes} min</p>
          <h1 className="text-4xl font-bold tracking-tight mb-4">{webinar.title}</h1>
          <p className="text-base leading-7 text-muted-foreground whitespace-pre-line">{webinar.description}</p>
        </section>

        <aside className="rounded-lg border bg-card p-5 shadow-sm lg:sticky lg:top-6">
          {showJoinLink ? (
            <div>
              <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                Class in session
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">Build with Moski is live</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                The live class has started. Join the Google Meet now and keep this page open if you need to rejoin.
              </p>
              <a
                href={joinUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex min-h-12 w-full items-center justify-center rounded-md bg-emerald-700 px-4 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
              >
                Join Google Meet
              </a>
              <p className="mt-3 break-all text-xs text-muted-foreground">{joinUrl}</p>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium uppercase text-muted-foreground">Reserve your spot</p>
              <p className="mt-2 text-3xl font-bold">
                {webinar.price_ngn > 0 ? naira(webinar.price_ngn) : 'Free'}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your details and we&apos;ll email the event link with a calendar invite.
              </p>
              <div className="mt-5">
                <RegisterButton
                  slug={webinar.slug}
                  priceNgn={webinar.price_ngn}
                  communityEnabled={Boolean(webinar.whatsapp_community_url)}
                />
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
