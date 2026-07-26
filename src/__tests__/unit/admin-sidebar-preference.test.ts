import { describe, expect, it } from 'vitest';

import {
  getInitialAdminMenuCollapsed,
  readAdminMenuCollapsedPreference,
} from '@/lib/admin/sidebar-preference';

describe('admin sidebar preference', () => {
  it('uses the expanded state for the hydration-safe first render', () => {
    expect(getInitialAdminMenuCollapsed()).toBe(false);
  });

  it('restores a saved collapsed preference after hydration', () => {
    const storage = {
      getItem: (key: string): string | null => (
        key === 'aorthar:admin-menu-collapsed' ? '1' : null
      ),
    };

    expect(readAdminMenuCollapsedPreference(storage)).toBe(true);
  });
});
