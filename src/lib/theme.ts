export function getNextTheme(resolvedTheme?: string): 'dark' | 'light' {
  return resolvedTheme === 'dark' ? 'light' : 'dark';
}
