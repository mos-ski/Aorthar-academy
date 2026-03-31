import { describe, it, expect } from 'vitest';
import { verifyWebhookSignature, generateReference } from '@/lib/paystack';
import crypto from 'crypto';

// process.env.PAYSTACK_SECRET_KEY is set to 'test_secret_key_for_vitest' in setup.ts

describe('verifyWebhookSignature', () => {
  const SECRET = 'test_secret_key_for_vitest';

  function makeSignature(body: string) {
    return crypto.createHmac('sha512', SECRET).update(body).digest('hex');
  }

  it('returns true for a valid signature', () => {
    const body = JSON.stringify({ event: 'charge.success', data: { reference: 'abc123' } });
    const sig = makeSignature(body);
    expect(verifyWebhookSignature(body, sig)).toBe(true);
  });

  it('returns false for a tampered body', () => {
    const body = JSON.stringify({ event: 'charge.success' });
    const sig = makeSignature(body);
    const tamperedBody = JSON.stringify({ event: 'charge.success', extra: 'injected' });
    expect(verifyWebhookSignature(tamperedBody, sig)).toBe(false);
  });

  it('returns false for a wrong signature', () => {
    const body = JSON.stringify({ event: 'charge.success' });
    expect(verifyWebhookSignature(body, 'totally-wrong-signature')).toBe(false);
  });

  it('returns false for an empty signature', () => {
    const body = '{"event":"test"}';
    expect(verifyWebhookSignature(body, '')).toBe(false);
  });

  it('is case-sensitive for the signature', () => {
    const body = 'test-body';
    const sig = makeSignature(body);
    expect(verifyWebhookSignature(body, sig.toUpperCase())).toBe(false);
  });
});

describe('generateReference', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440000';

  it('returns a string', () => {
    expect(typeof generateReference(userId)).toBe('string');
  });

  it('starts with "aa-"', () => {
    expect(generateReference(userId).startsWith('aa-')).toBe(true);
  });

  it('contains the first 8 characters of the userId', () => {
    const ref = generateReference(userId);
    expect(ref).toContain('550e8400');
  });

  it('generates unique references on each call', () => {
    const refs = new Set(Array.from({ length: 100 }, () => generateReference(userId)));
    // All 100 should be unique (timestamp + random component)
    expect(refs.size).toBe(100);
  });

  it('handles a short userId without throwing', () => {
    expect(() => generateReference('abc')).not.toThrow();
  });
});
