export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function MyTicketsPage() {
  const { user } = await requireAuth();
  const supabase = await createClient();

  const { data: registrations } = await supabase
    .from('webinar_registrations')
    .select('id, registered_at, amount_paid_ngn, webinars(slug, title, scheduled_at, join_url)')
    .eq('user_id', user.id)
    .order('registered_at', { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My tickets</h1>

      {(!registrations || registrations.length === 0) ? (
        <p className="text-muted-foreground text-sm py-10 text-center">
          You haven&apos;t registered for any live classes yet. <Link href="/events" className="underline">Browse classes</Link>.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {registrations.map((reg) => {
            const webinar = reg.webinars as unknown as { slug: string; title: string; scheduled_at: string; join_url: string } | null;
            if (!webinar) return null;
            const isPast = new Date(webinar.scheduled_at) < new Date();

            return (
              <div key={reg.id} className="rounded-lg border p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {new Date(webinar.scheduled_at).toLocaleString('en-NG', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: 'Africa/Lagos',
                    })}
                  </p>
                  <Link href={`/events/${webinar.slug}`} className="font-semibold hover:underline">
                    {webinar.title}
                  </Link>
                </div>
                {!isPast && (
                  <a
                    href={webinar.join_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Join →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
