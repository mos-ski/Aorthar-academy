import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/paystack';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/webhooks/paystack
// Handles both university subscription payments (via Edge Function) and
// standalone course one-time purchases (handled inline).
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature') ?? '';

  // Verify signature
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: { event: string; data: { reference: string; status: string; metadata?: Record<string, string> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Handle standalone course purchase
  if (
    event.event === 'charge.success' &&
    event.data.metadata?.type === 'standalone_course'
  ) {
    const { reference, status, metadata } = event.data;

    if (status !== 'success') {
      return NextResponse.json({ ok: true, skipped: 'non-success status' });
    }

    const { course_id, user_id } = metadata ?? {};
    if (!course_id || !user_id) {
      return NextResponse.json({ error: 'Missing metadata fields' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Fetch course price for recording
    const { data: course } = await adminSupabase
      .from('standalone_courses')
      .select('price_ngn')
      .eq('id', course_id)
      .single();

    // Idempotent upsert — if reference already exists, skip
    const { error } = await adminSupabase
      .from('standalone_purchases')
      .upsert(
        {
          user_id,
          course_id,
          paystack_reference: reference,
          amount_paid_ngn: course?.price_ngn ?? 0,
        },
        { onConflict: 'paystack_reference' },
      );

    if (error) {
      console.error('[webhook/paystack] standalone_purchases upsert error:', error);
      return NextResponse.json({ error: 'DB insert failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, type: 'standalone_course' });
  }

  // All other events → forward to Supabase Edge Function (university subscriptions)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-payment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-paystack-signature': signature,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: rawBody,
    },
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.ok ? 200 : res.status });
}
