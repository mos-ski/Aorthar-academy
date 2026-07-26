'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

import { getNextTheme } from '@/lib/theme';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(getNextTheme(resolvedTheme))}
      className="relative inline-flex h-8 w-[62px] items-center justify-between rounded-full border border-border bg-muted px-2 text-muted-foreground transition-colors hover:text-foreground"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-checked={isDark}
      role="switch"
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <Sun className="h-3.5 w-3.5" />
      <Moon className="h-3.5 w-3.5" />
      <span
        className={`absolute left-1 top-1 grid size-6 place-items-center rounded-full bg-background text-foreground shadow-sm transition-transform duration-200 ${
          isDark ? 'translate-x-[30px]' : 'translate-x-0'
        }`}
      >
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}
