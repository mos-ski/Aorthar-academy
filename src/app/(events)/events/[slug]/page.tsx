export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import RegisterButton from '@/components/events/RegisterButton';
import VerifyPaymentOnReturn from '@/components/events/VerifyPaymentOnReturn';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

type Params = { params: Promise<{ slug: string }> };

export default async function EventDetailPage({ params }: Params) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: webinar } = await supabase
    .from('webinars')
    .select('id, slug, title, description, scheduled_at, duration_minutes, price_ngn, join_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!webinar) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  let alreadyRegistered = false;

  if (user) {
    const { data: registration } = await supabase
      .from('webinar_registrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('webinar_id', webinar.id)
      .maybeSingle();
    alreadyRegistered = Boolean(registration);
  }

  const when = new Date(webinar.scheduled_at).toLocaleString('en-NG', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  });

  return (
    <div className="max-w-2xl">
      <Suspense fallback={null}>
        <VerifyPaymentOnReturn />
      </Suspense>

      <p className="text-sm text-muted-foreground mb-2">{when} (WAT) · {webinar.duration_minutes} min</p>
      <h1 className="text-3xl font-bold mb-4">{webinar.title}</h1>
      <p className="text-base text-muted-foreground whitespace-pre-line mb-8">{webinar.description}</p>

      <div className="rounded-lg border p-5 max-w-sm">
        <p className="text-2xl font-bold mb-4">
          {webinar.price_ngn > 0 ? naira(webinar.price_ngn) : 'Free'}
        </p>
        <RegisterButton
          slug={webinar.slug}
          priceNgn={webinar.price_ngn}
          isLoggedIn={Boolean(user)}
          alreadyRegistered={alreadyRegistered}
          joinUrl={webinar.join_url}
        />
      </div>
    </div>
  );
}
