import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyTransaction } from '@/lib/paystack';
import { sendEmail } from '@/lib/email';
import { buildWebinarIcs } from '@/lib/calendar/ics';
import {
  webinarRegistrationHtml,
  webinarRegistrationSubject,
} from '@/lib/email/templates/webinar-registration-confirmation';

type WebinarRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  join_url: string;
  price_ngn: number;
  whatsapp_community_url: string | null;
};

type WebinarPaymentMetadata = {
  type?: string;
  webinar_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  whatsapp_number?: string;
  wants_whatsapp_community?: string;
};

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

async function sendRegistrationEmail(webinar: WebinarRow, firstName: string, email: string, amountNgn: number): Promise<void> {
  if (!webinar.join_url) return;

  const ics = buildWebinarIcs({
    id: webinar.id,
    title: webinar.title,
    description: webinar.description,
    scheduledAt: webinar.scheduled_at,
    durationMinutes: webinar.duration_minutes,
    joinUrl: webinar.join_url,
  });

  await sendEmail({
    to: email,
    subject: webinarRegistrationSubject(webinar.title),
    html: webinarRegistrationHtml({
      firstName,
      webinarTitle: webinar.title,
      scheduledAt: webinar.scheduled_at,
      joinUrl: webinar.join_url,
      amountNgn,
      calendarAttached: true,
    }),
    attachments: [
      {
        filename: `${webinar.slug}.ics`,
        content: ics,
      },
    ],
  });
}

// GET /api/events/verify-payment?reference=xxx
// Called after Paystack redirects back — verifies the transaction and records the public registration.
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference');
  if (!reference) {
    return NextResponse.json({ error: 'reference required' }, { status: 400 });
  }

  let paystack: Awaited<ReturnType<typeof verifyTransaction>>;
  try {
    paystack = await verifyTransaction(reference);
  } catch (err) {
    console.error('[events/verify-payment] Paystack verify error:', err);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 502 });
  }

  const tx = paystack?.data;
  if (!tx || tx.status !== 'success') {
    return NextResponse.json({ error: 'Payment not successful' }, { status: 402 });
  }

  const meta = (tx.metadata ?? {}) as WebinarPaymentMetadata;
  if (meta.type !== 'webinar' || !meta.webinar_id) {
    return NextResponse.json({ error: 'Not a webinar payment' }, { status: 400 });
  }

  const firstName = cleanText(meta.first_name);
  const lastName = cleanText(meta.last_name);
  const email = cleanText(meta.email).toLowerCase();
  const whatsappNumber = cleanText(meta.whatsapp_number);
  const wantsWhatsappCommunity = meta.wants_whatsapp_community === 'true';

  if (!firstName || !lastName || !email || !whatsappNumber) {
    return NextResponse.json({ error: 'Missing attendee metadata' }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  const { data: webinar } = await adminSupabase
    .from('webinars')
    .select('id, title, slug, description, scheduled_at, duration_minutes, join_url, price_ngn, whatsapp_community_url')
    .eq('id', meta.webinar_id)
    .single<WebinarRow>();

  if (!webinar) {
    return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
  }

  const amountPaidNgn = Math.round(tx.amount / 100);

  const { error: dbError } = await adminSupabase
    .from('webinar_registrations')
    .upsert(
      {
        webinar_id: webinar.id,
        first_name: firstName,
        last_name: lastName,
        email,
        whatsapp_number: whatsappNumber,
        wants_whatsapp_community: wantsWhatsappCommunity,
        paystack_reference: reference,
        amount_paid_ngn: amountPaidNgn,
      },
      { onConflict: 'paystack_reference' },
    );

  if (dbError) {
    console.error('[events/verify-payment] upsert error:', dbError);
    return NextResponse.json({ error: 'Failed to record registration' }, { status: 500 });
  }

  void sendRegistrationEmail(webinar, firstName, email, amountPaidNgn)
    .catch((emailErr) => console.error('[events/verify-payment] email failed:', emailErr));

  return NextResponse.json({
    ok: true,
    slug: webinar.slug,
    whatsapp_url: wantsWhatsappCommunity ? webinar.whatsapp_community_url : null,
  });
}
