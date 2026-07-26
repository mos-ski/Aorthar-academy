type StorageReader = {
  getItem: (key: string) => string | null;
};

export const ADMIN_MENU_COLLAPSED_STORAGE_KEY = 'aorthar:admin-menu-collapsed';
export const ADMIN_MENU_COLLAPSED_EVENT = 'aorthar:admin-menu-collapsed-change';

export function getInitialAdminMenuCollapsed(): boolean {
  return false;
}

export function readAdminMenuCollapsedPreference(storage: StorageReader): boolean {
  return storage.getItem(ADMIN_MENU_COLLAPSED_STORAGE_KEY) === '1';
}
