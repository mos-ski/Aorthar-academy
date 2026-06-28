import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { initiatePayment, generateReference } from '@/lib/paystack';
import { sendEmail } from '@/lib/email';
import { buildWebinarIcs } from '@/lib/calendar/ics';
import {
  webinarRegistrationHtml,
  webinarRegistrationSubject,
} from '@/lib/email/templates/webinar-registration-confirmation';
import { eventPublicUrl } from '@/lib/urls';

type WebinarRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  price_ngn: number;
  join_url: string;
  capacity: number | null;
  whatsapp_community_url: string | null;
};

type RegistrationBody = {
  slug?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  whatsapp_number?: string;
  wants_whatsapp_community?: boolean;
};

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function sendRegistrationEmail(webinar: WebinarRow, firstName: string, email: string, amountNgn: number): Promise<void> {
  const joinUrl = webinar.join_url || eventPublicUrl(webinar.slug);

  const ics = buildWebinarIcs({
    id: webinar.id,
    title: webinar.title,
    description: webinar.description,
    scheduledAt: webinar.scheduled_at,
    durationMinutes: webinar.duration_minutes,
    joinUrl,
  });

  await sendEmail({
    to: email,
    subject: webinarRegistrationSubject(webinar.title),
    html: webinarRegistrationHtml({
      firstName,
      webinarTitle: webinar.title,
      scheduledAt: webinar.scheduled_at,
      joinUrl,
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

// POST /api/events/register — public Zoom-style registration for free or paid webinars.
export async function POST(request: NextRequest) {
  const body = await request.json() as RegistrationBody;
  const slug = cleanText(body.slug);
  const firstName = cleanText(body.first_name);
  const lastName = cleanText(body.last_name);
  const email = cleanText(body.email).toLowerCase();
  const whatsappNumber = cleanText(body.whatsapp_number);
  const wantsWhatsappCommunity = Boolean(body.wants_whatsapp_community);

  if (!slug) {
    return NextResponse.json({ error: 'Webinar slug required' }, { status: 400 });
  }
  if (!firstName || !lastName || !email || !whatsappNumber) {
    return NextResponse.json({ error: 'First name, last name, email, and WhatsApp number are required' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const { data: webinar } = await adminSupabase
    .from('webinars')
    .select('id, slug, title, description, scheduled_at, duration_minutes, price_ngn, join_url, capacity, whatsapp_community_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single<WebinarRow>();

  if (!webinar) {
    return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
  }

  const { data: existing } = await adminSupabase
    .from('webinar_registrations')
    .select('id')
    .eq('webinar_id', webinar.id)
    .ilike('email', email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      ok: true,
      alreadyRegistered: true,
      whatsapp_url: wantsWhatsappCommunity ? webinar.whatsapp_community_url : null,
    });
  }

  if (webinar.capacity !== null) {
    const { count } = await adminSupabase
      .from('webinar_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('webinar_id', webinar.id);

    if ((count ?? 0) >= webinar.capacity) {
      return NextResponse.json({ error: 'This webinar is full' }, { status: 409 });
    }
  }

  if (webinar.price_ngn > 0) {
    const reference = generateReference(email);
    const publicUrl = eventPublicUrl(slug);
    const callbackUrl = publicUrl.startsWith('http') ? publicUrl : `${request.nextUrl.origin}${publicUrl}`;

    try {
      const paystack = await initiatePayment({
        email,
        amount_kobo: webinar.price_ngn * 100,
        reference,
        metadata: {
          type: 'webinar',
          webinar_id: webinar.id,
          webinar_slug: slug,
          first_name: firstName,
          last_name: lastName,
          email,
          whatsapp_number: whatsappNumber,
          wants_whatsapp_community: wantsWhatsappCommunity ? 'true' : 'false',
        },
        callback_url: callbackUrl,
      });

      return NextResponse.json({ payment_url: paystack.data.authorization_url });
    } catch (err) {
      console.error('[events/register] Paystack error:', err);
      return NextResponse.json({ error: 'Payment initiation failed. Please try again.' }, { status: 500 });
    }
  }

  const { error: insertError } = await adminSupabase
    .from('webinar_registrations')
    .insert({
      webinar_id: webinar.id,
      first_name: firstName,
      last_name: lastName,
      email,
      whatsapp_number: whatsappNumber,
      wants_whatsapp_community: wantsWhatsappCommunity,
      amount_paid_ngn: 0,
    });

  if (insertError) {
    console.error('[events/register] insert error:', insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  void sendRegistrationEmail(webinar, firstName, email, 0)
    .catch((err) => console.error('[events/register] email failed:', err));

  return NextResponse.json({
    ok: true,
    registered: true,
    whatsapp_url: wantsWhatsappCommunity ? webinar.whatsapp_community_url : null,
  });
}
