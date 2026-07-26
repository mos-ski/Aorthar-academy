import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/admin/apiAuth', () => ({
  requireAdminApi: vi.fn(),
  mapAdminApiError: vi.fn(() => ({ status: 500, message: 'Internal server error' })),
}));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }));

import { requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { PATCH } from '@/app/api/admin/studio/case-studies/[id]/route';
import { POST as reorderBlocks } from '@/app/api/admin/studio/case-studies/[id]/blocks/reorder/route';

const CASE_STUDY_ID = 'case-study-001';

function makeRequest(url: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeParams(): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id: CASE_STUDY_ID }) };
}

describe('admin studio case study API safeguards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (requireAdminApi as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'admin-001', adminLevel: 'content_admin' });
  });

  it('rejects publishing when an explicit null removes the existing cover URL', async () => {
    const current = {
      id: CASE_STUDY_ID,
      title: 'Case Study',
      slug: 'case-study',
      subtitle: 'A complete study',
      cover_url: 'https://example.com/cover.jpg',
      year: '2026',
      release_date: null,
      published_at: null,
    };
    const studyBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: current, error: null }),
      update: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: current, error: null }),
    };
    const blocksBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 1, error: null }),
    };
    (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn((table: string) => table === 'studio_case_studies' ? studyBuilder : blocksBuilder),
    });

    const response = await PATCH(
      makeRequest(`http://localhost/api/admin/studio/case-studies/${CASE_STUDY_ID}`, { status: 'published', cover_url: null }),
      makeParams(),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'Cover URL is required before publishing.' });
  });

  it('rejects duplicate block IDs before reorder writes', async () => {
    const admin = {
      rpc: vi.fn(),
    };
    (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(admin);

    const response = await reorderBlocks(
      makeRequest(`http://localhost/api/admin/studio/case-studies/${CASE_STUDY_ID}/blocks/reorder`, { orderedIds: ['block-1', 'block-1'] }),
      makeParams(),
    );

    expect(response.status).toBe(400);
    expect(admin.rpc).not.toHaveBeenCalled();
  });

  it('delegates a complete reorder to the atomic database RPC', async () => {
    const admin = {
      rpc: vi.fn().mockResolvedValue({ error: null }),
    };
    (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(admin);

    const response = await reorderBlocks(
      makeRequest(`http://localhost/api/admin/studio/case-studies/${CASE_STUDY_ID}/blocks/reorder`, { orderedIds: ['block-2', 'block-1'] }),
      makeParams(),
    );

    expect(response.status).toBe(200);
    expect(admin.rpc).toHaveBeenCalledWith('reorder_studio_case_study_blocks', {
      p_case_study_id: CASE_STUDY_ID,
      p_ordered_ids: ['block-2', 'block-1'],
    });
  });
});
