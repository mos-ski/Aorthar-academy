import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/paystack';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import {
  purchaseConfirmationHtml,
  purchaseConfirmationSubject,
} from '@/lib/email/templates/purchase-confirmation';
import {
  marketplaceDownloadHtml,
  marketplaceDownloadSubject,
} from '@/lib/email/templates/marketplace-download';

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

    // Fetch course details for recording + email
    const { data: course } = await adminSupabase
      .from('standalone_courses')
      .select('price_ngn, title')
      .eq('id', course_id)
      .single();

    // Determine the actual paid amount — use discounted price if a coupon was applied
    const discountedPriceNgn = metadata?.discounted_price_ngn
      ? Number(metadata.discounted_price_ngn)
      : (course?.price_ngn ?? 0);

    // Idempotent upsert — if reference already exists, skip
    const { error } = await adminSupabase
      .from('standalone_purchases')
      .upsert(
        {
          user_id,
          course_id,
          paystack_reference: reference,
          amount_paid_ngn: discountedPriceNgn,
        },
        { onConflict: 'paystack_reference' },
      );

    if (error) {
      console.error('[webhook/paystack] standalone_purchases upsert error:', error);
      return NextResponse.json({ error: 'DB insert failed' }, { status: 500 });
    }

    // Increment coupon usage if applicable
    if (metadata?.coupon_id) {
      Promise.resolve(adminSupabase.rpc('increment_coupon_usage', { coupon_id_input: metadata.coupon_id }))
        .catch((err: unknown) => { console.error('[webhook/paystack] coupon usage increment failed:', err); });
    }

    // Send purchase confirmation email (fire-and-forget, don't block response)
    void (async () => {
      try {
        const { data: userRecord } = await adminSupabase.auth.admin.getUserById(user_id);
        const userEmail = userRecord?.user?.email;
        const { data: profileRecord } = await adminSupabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user_id)
          .maybeSingle();
        const firstName = profileRecord?.full_name?.split(' ')[0] ?? 'there';
        const courseName = course?.title ?? 'your course';

        if (userEmail) {
          await sendEmail({
            to: userEmail,
            subject: purchaseConfirmationSubject('course', courseName),
html: purchaseConfirmationHtml({
            firstName,
            purchaseType: 'course',
            itemName: courseName,
            amountNgn: discountedPriceNgn,
            dashboardUrl: 'https://bootcamp.aorthar.com',
          }),
          });
        }
      } catch (emailErr) {
        console.error('[webhook/paystack] purchase confirmation email failed:', emailErr);
      }
    })();

    return NextResponse.json({ ok: true, type: 'standalone_course' });
  }

  // Handle internship application payment
  if (
    event.event === 'charge.success' &&
    event.data.metadata?.type === 'internship_application'
  ) {
    if (event.data.status !== 'success') {
      return NextResponse.json({ ok: true, skipped: 'non-success status' });
    }

    const { reference } = event.data;
    const adminSupabase = createAdminClient();

    const amountNgn = Math.round((event.data as { amount?: number }).amount ?? 0) / 100;

    await adminSupabase
      .from('internship_applications')
      .update({
        payment_status: 'paid',
        amount_paid_ngn: amountNgn,
        paid_at: new Date().toISOString(),
      })
      .eq('paystack_reference', reference)
      .eq('payment_status', 'pending');

    return NextResponse.json({ ok: true, type: 'internship_application' });
  }

  // Handle marketplace product purchase
  if (
    event.event === 'charge.success' &&
    event.data.metadata?.type === 'marketplace_product'
  ) {
    if (event.data.status !== 'success') {
      return NextResponse.json({ ok: true, skipped: 'non-success status' });
    }

    const { reference } = event.data;
    const adminSupabase = createAdminClient();
    const amountNgn = Math.round((event.data as { amount?: number }).amount ?? 0) / 100;

    // Idempotent: only update pending rows — verify-payment may have already done this
    const { data: purchase } = await adminSupabase
      .from('marketplace_purchases')
      .update({
        payment_status: 'paid',
        amount_paid_ngn: amountNgn,
        paid_at: new Date().toISOString(),
      })
      .eq('paystack_reference', reference)
      .eq('payment_status', 'pending')
      .select('id, email, product_id, download_token, token_expires_at')
      .maybeSingle();

    if (purchase) {
      // Fire-and-forget: send download email as safety net (user may have missed success page)
      void (async () => {
        try {
          const { data: product } = await adminSupabase
            .from('marketplace_products')
            .select('name')
            .eq('id', purchase.product_id)
            .single();

          const productName = product?.name ?? 'your purchase';
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
            ?? process.env.NEXT_PUBLIC_INTERNSHIP_URL?.replace('/internship', '')
            ?? 'https://aorthar.com';
          const downloadUrl = `${siteUrl}/api/marketplace/download?token=${purchase.download_token}`;

          await sendEmail({
            to: purchase.email,
            subject: marketplaceDownloadSubject(productName),
            html: marketplaceDownloadHtml({
              productName,
              downloadUrl,
              tokenExpiresAt: purchase.token_expires_at,
              amountNgn,
              email: purchase.email,
            }),
          });
        } catch (emailErr) {
          console.error('[webhook/paystack] marketplace download email failed:', emailErr);
        }
      })();
    }

    return NextResponse.json({ ok: true, type: 'marketplace_product' });
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

  // Send purchase confirmation email for successful subscription charges
  if (
    res.ok &&
    event.event === 'charge.success' &&
    event.data.status === 'success'
  ) {
    const subscriptionEvent = event as typeof event & {
      data: {
        amount: number;
        metadata?: { user_id?: string; plan_type?: string };
        customer?: { email?: string };
      };
    };
    void (async () => {
      try {
        const userId = subscriptionEvent.data.metadata?.user_id;
        const planType = subscriptionEvent.data.metadata?.plan_type ?? 'Premium';
        const amountNgn = Math.round((subscriptionEvent.data.amount ?? 0) / 100);

        let userEmail = subscriptionEvent.data.customer?.email;
        let firstName = 'there';

        if (userId) {
          const adminSupabase = createAdminClient();
          const { data: userRecord } = await adminSupabase.auth.admin.getUserById(userId);
          userEmail ??= userRecord?.user?.email;
          const { data: profileRecord } = await adminSupabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', userId)
            .maybeSingle();
          firstName = profileRecord?.full_name?.split(' ')[0] ?? 'there';
        }

        const planLabel =
          planType === 'yearly' ? 'Aorthar Academy Premium (Yearly)' : 'Aorthar Academy Premium';

        if (userEmail) {
          await sendEmail({
            to: userEmail,
            subject: purchaseConfirmationSubject('subscription', planLabel),
            html: purchaseConfirmationHtml({
              firstName,
              purchaseType: 'subscription',
              itemName: planLabel,
              amountNgn,
              dashboardUrl: 'https://www.aorthar.academy/dashboard',
            }),
          });
        }
      } catch (emailErr) {
        console.error('[webhook/paystack] subscription confirmation email failed:', emailErr);
      }
    })();
  }

  return NextResponse.json(data, { status: res.ok ? 200 : res.status });
}
