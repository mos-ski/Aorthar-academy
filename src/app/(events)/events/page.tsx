export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export default async function EventsListPage() {
  const supabase = await createClient();
  const { data: webinars } = await supabase
    .from('webinars')
    .select('id, slug, title, description, scheduled_at, price_ngn, thumbnail_url')
    .eq('status', 'published')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true });

  return (
    <div className="pb-10">
      <div className="mb-10 max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Events</p>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Upcoming Aorthar live sessions</h1>
        <p className="text-base leading-7 text-muted-foreground">
          Browse public webinars, live classes, and community sessions. Pick an event, register with your details, and get the join link in your email.
        </p>
      </div>

      {(!webinars || webinars.length === 0) ? (
        <div className="rounded-lg border bg-card px-6 py-12 text-center">
          <h2 className="text-xl font-semibold">No upcoming events right now</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Check back soon. New webinars and live classes will appear here once they are published.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {webinars.map((webinar) => (
            <Link
              key={webinar.id}
              href={`/events/${webinar.slug}`}
              className="group overflow-hidden rounded-lg border bg-card transition-colors hover:border-foreground/30 hover:bg-muted/30"
            >
              <div className="relative aspect-[16/9] bg-muted">
                {webinar.thumbnail_url ? (
                  <Image src={webinar.thumbnail_url} alt="" fill className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                    AORTHAR LIVE
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="text-xs text-muted-foreground mb-1">
                  {new Date(webinar.scheduled_at).toLocaleString('en-NG', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    timeZone: 'Africa/Lagos',
                  })}
                </p>
                <h2 className="font-semibold text-lg mb-1">{webinar.title}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{webinar.description}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">
                    {webinar.price_ngn > 0 ? naira(webinar.price_ngn) : 'Free'}
                  </span>
                  <span className="text-sm font-semibold text-primary">Register</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
