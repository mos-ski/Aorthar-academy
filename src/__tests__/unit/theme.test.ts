import { getNextTheme } from '@/lib/theme';

describe('getNextTheme', () => {
  test('switches dark mode to light mode', () => {
    expect(getNextTheme('dark')).toBe('light');
  });

  test('switches light, system, and unresolved themes to dark mode', () => {
    expect(getNextTheme('light')).toBe('dark');
    expect(getNextTheme('system')).toBe('dark');
    expect(getNextTheme(undefined)).toBe('dark');
  });
});
