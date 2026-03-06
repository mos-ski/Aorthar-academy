// Supabase Edge Function: verify-payment
// Handles Paystack webhook events with idempotency
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifySignature(payload: string, signature: string): Promise<boolean> {
  const secret = Deno.env.get('PAYSTACK_WEBHOOK_SECRET')!;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const hex = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hex === signature;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature') ?? '';

    const isValid = await verifySignature(rawBody, signature);
    if (!isValid) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    if (event.event === 'charge.success') {
      const { reference, amount, currency, customer, metadata, paid_at } = event.data;
      const { user_id, plan_type } = metadata ?? {};

      if (!user_id || !plan_type) {
        console.warn('Missing metadata in webhook:', event.data);
        return Response.json({ received: true });
      }

      // Idempotency check
      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('paystack_reference', reference)
        .maybeSingle();

      if (existing) {
        return Response.json({ received: true, duplicate: true });
      }

      // Resolve plan
      const { data: plan } = await supabase
        .from('plans')
        .select('id, billing_type')
        .eq('plan_type', plan_type)
        .single();

      // Record transaction — amount is in kobo (Paystack smallest unit)
      await supabase.from('transactions').insert({
        user_id,
        paystack_reference: reference,
        amount: amount / 100,       // converted to base currency unit
        amount_paid_kobo: amount,   // raw kobo for audit reconciliation
        currency,
        plan_type,
        status: 'success',
        raw_payload: event.data,
      });

      // Create / update subscription
      if (plan) {
        const endDate = plan.billing_type === 'one_time'
          ? null
          : plan_type === 'monthly'
            ? new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
            : new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();

        await supabase.from('subscriptions').insert({
          user_id,
          plan_id: plan.id,
          status: 'active',
          start_date: paid_at ?? new Date().toISOString(),
          end_date: endDate,
          auto_renew: plan.billing_type === 'subscription',
        });
      }
    }

    if (event.event === 'subscription.disable') {
      const { customer } = event.data;
      // Resolve auth user by email, then cancel their active subscription
      const { data: authUser } = await supabase.auth.admin.getUserByEmail(customer.email);
      if (authUser.user) {
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('user_id', authUser.user.id)
          .eq('status', 'active');
      }
    }

    return Response.json({ received: true }, { headers: corsHeaders });

  } catch (err) {
    console.error('verify-payment error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});
