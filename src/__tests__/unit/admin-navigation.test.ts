import { selectActiveNavHref } from '@/lib/admin/navigation';

describe('selectActiveNavHref', () => {
  const contractsNav = [
    { href: '/admin/contracts' },
    { href: '/admin/contracts/new' },
    { href: '/admin/contracts/templates' },
  ];

  test('selects the most specific matching child route', () => {
    expect(selectActiveNavHref(contractsNav, '/admin/contracts/new')).toBe('/admin/contracts/new');
    expect(selectActiveNavHref(contractsNav, '/admin/contracts/templates')).toBe('/admin/contracts/templates');
  });

  test('falls back to the module root for detail routes', () => {
    expect(selectActiveNavHref(contractsNav, '/admin/contracts/contract-123')).toBe('/admin/contracts');
  });

  test('respects explicit route match results', () => {
    const queryDrivenNav = [
      { href: '/admin/users?module=university', matches: true },
      { href: '/admin/users?module=courses', matches: false },
    ];

    expect(selectActiveNavHref(queryDrivenNav, '/admin/users')).toBe('/admin/users?module=university');
  });
});
