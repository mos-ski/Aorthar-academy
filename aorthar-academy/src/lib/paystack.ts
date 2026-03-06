import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

// ─────────────────────────────────────────────
// PAYSTACK INTEGRATION HELPERS
// ─────────────────────────────────────────────

export interface InitiatePaymentParams {
  email: string;
  amount_kobo: number; // Paystack uses smallest currency unit
  reference: string;
  metadata: Record<string, string>;
  callback_url?: string;
}

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

/**
 * Create a Paystack checkout session.
 */
export async function initiatePayment(
  params: InitiatePaymentParams,
): Promise<PaystackInitResponse> {
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amount_kobo,
      reference: params.reference,
      metadata: params.metadata,
      callback_url: params.callback_url,
    }),
  });

  if (!res.ok) {
    throw new Error(`Paystack initiate failed: ${res.status}`);
  }

  return res.json();
}

/**
 * Verify a Paystack transaction by reference.
 */
export async function verifyTransaction(reference: string) {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Paystack verify failed: ${res.status}`);
  }

  return res.json();
}

/**
 * Verify incoming Paystack webhook signature.
 * Paystack signs the raw body with HMAC-SHA512.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
): boolean {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex');
  return hash === signature;
}

/**
 * Generate a unique idempotent payment reference.
 */
export function generateReference(userId: string): string {
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `aa-${userId.slice(0, 8)}-${timestamp}-${rand}`;
}
