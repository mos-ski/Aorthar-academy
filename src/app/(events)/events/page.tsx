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
    <div>
      <h1 className="text-3xl font-bold mb-2">Upcoming live classes</h1>
      <p className="text-muted-foreground mb-8">Register for a free or paid live session and get a join link in your inbox.</p>

      {(!webinars || webinars.length === 0) ? (
        <p className="text-muted-foreground text-sm py-10 text-center">No upcoming classes right now — check back soon.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {webinars.map((webinar) => (
            <Link
              key={webinar.id}
              href={`/events/${webinar.slug}`}
              className="group overflow-hidden rounded-lg border bg-card transition-colors hover:bg-muted/30"
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
                <span className="text-sm font-medium">
                  {webinar.price_ngn > 0 ? naira(webinar.price_ngn) : 'Free'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
