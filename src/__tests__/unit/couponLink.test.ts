import { describe, it, expect } from 'vitest';
import { getCouponCodeFromSearch, buildCouponShareLink } from '@/utils/couponLink';

describe('getCouponCodeFromSearch', () => {
  it('extracts and uppercases the coupon code', () => {
    expect(getCouponCodeFromSearch('?coupon=summer50')).toBe('SUMMER50');
  });

  it('trims surrounding whitespace from the code', () => {
    expect(getCouponCodeFromSearch('?coupon=%20SUMMER50%20')).toBe('SUMMER50');
  });

  it('returns null when the coupon param is missing', () => {
    expect(getCouponCodeFromSearch('?foo=bar')).toBeNull();
  });

  it('returns null when the coupon param is empty', () => {
    expect(getCouponCodeFromSearch('?coupon=')).toBeNull();
  });

  it('returns null for an empty search string', () => {
    expect(getCouponCodeFromSearch('')).toBeNull();
  });
});

describe('buildCouponShareLink', () => {
  it('builds a URL with the coupon code attached', () => {
    expect(buildCouponShareLink('https://aorthar.academy', 'ai-with-moskie', 'SUMMER50'))
      .toBe('https://aorthar.academy/courses-app/ai-with-moskie?coupon=SUMMER50');
  });

  it('URL-encodes special characters in the code', () => {
    expect(buildCouponShareLink('https://aorthar.academy', 'ai-with-moskie', 'SAVE 50%'))
      .toBe('https://aorthar.academy/courses-app/ai-with-moskie?coupon=SAVE%2050%25');
  });

  it('strips a trailing slash from the origin', () => {
    expect(buildCouponShareLink('https://aorthar.academy/', 'ai-with-moskie', 'SUMMER50'))
      .toBe('https://aorthar.academy/courses-app/ai-with-moskie?coupon=SUMMER50');
  });
});
