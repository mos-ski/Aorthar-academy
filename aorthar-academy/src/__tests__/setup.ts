import { vi } from 'vitest';

// Mock Next.js server modules that aren't available in test environment
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
    getAll: vi.fn(() => []),
  })),
  headers: vi.fn(() => ({
    get: vi.fn(),
    has: vi.fn(),
  })),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn(), refresh: vi.fn() })),
  usePathname: vi.fn(() => '/'),
}));

// Provide a default PAYSTACK_SECRET_KEY for tests that need it
process.env.PAYSTACK_SECRET_KEY = 'test_secret_key_for_vitest';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
