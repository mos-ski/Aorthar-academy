import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    expect(cn('foo', true && 'bar')).toBe('foo bar');
  });

  it('deduplicates conflicting Tailwind classes (last wins)', () => {
    // tailwind-merge resolves conflicts: p-4 wins over p-2
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles undefined and null gracefully', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });

  it('handles array input', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('handles object input (clsx object syntax)', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });
});
