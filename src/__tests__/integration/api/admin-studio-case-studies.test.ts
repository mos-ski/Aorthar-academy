import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/admin/apiAuth', () => ({
  requireAdminApi: vi.fn(),
  mapAdminApiError: vi.fn(() => ({ status: 500, message: 'Internal server error' })),
}));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }));

import { requireAdminApi } from '@/lib/admin/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  DELETE as deleteCaseStudy,
  PATCH,
} from '@/app/api/admin/studio/case-studies/[id]/route';
import {
  DELETE as deleteBlock,
  PATCH as patchBlock,
} from '@/app/api/admin/studio/case-studies/[id]/blocks/[blockId]/route';
import { POST as createBlock } from '@/app/api/admin/studio/case-studies/[id]/blocks/route';
import { POST as reorderBlocks } from '@/app/api/admin/studio/case-studies/[id]/blocks/reorder/route';

const CASE_STUDY_ID = '11111111-1111-4111-8111-111111111111';
const BLOCK_ID = '22222222-2222-4222-8222-222222222222';
const SECOND_BLOCK_ID = '33333333-3333-4333-8333-333333333333';

const publishedStudy = {
  id: CASE_STUDY_ID,
  title: 'Case Study',
  slug: 'case-study',
  subtitle: 'A complete study',
  cover_url: 'https://example.com/cover.jpg',
  cover_media_type: 'image',
  preview_video_url: null,
  og_image_url: null,
  year: '2026',
  release_date: null,
  status: 'published',
  published_at: '2026-07-01T00:00:00.000Z',
};

const validTextBlock = {
  id: BLOCK_ID,
  case_study_id: CASE_STUDY_ID,
  type: 'text',
  sort_order: 0,
  content: { body: 'A complete story.' },
};

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

function makeBlockParams(): { params: Promise<{ id: string; blockId: string }> } {
  return { params: Promise.resolve({ id: CASE_STUDY_ID, blockId: BLOCK_ID }) };
}

function readOneBuilder(data: unknown): Record<string, ReturnType<typeof vi.fn>> {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
  };
}

function readManyBuilder(data: unknown[]): Record<string, ReturnType<typeof vi.fn>> {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data, error: null }),
  };
}

describe('admin studio case study API safeguards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (requireAdminApi as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'admin-001', adminLevel: 'content_admin' });
  });

  it('rejects publishing when an explicit null removes the existing cover URL', async () => {
    const studyBuilder = readOneBuilder({ ...publishedStudy, status: 'draft', published_at: null });
    const blocksBuilder = readManyBuilder([validTextBlock]);
    (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn()
        .mockReturnValueOnce(studyBuilder)
        .mockReturnValueOnce(blocksBuilder),
    });

    const response = await PATCH(
      makeRequest(`http://localhost/api/admin/studio/case-studies/${CASE_STUDY_ID}`, { status: 'published', cover_url: null }),
      makeParams(),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'Cover URL is required before publishing.' });
  });

  it('revalidates the complete record when a partial edit leaves it published', async () => {
    const studyBuilder = readOneBuilder(publishedStudy);
    const blocksBuilder = readManyBuilder([validTextBlock]);
    (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn()
        .mockReturnValueOnce(studyBuilder)
        .mockReturnValueOnce(blocksBuilder),
    });

    const response = await PATCH(
      makeRequest(`http://localhost/api/admin/studio/case-studies/${CASE_STUDY_ID}`, { subtitle: null }),
      makeParams(),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'Subtitle is required before publishing.' });
  });

  it('rejects a block edit that would make a published study unrenderable', async () => {
    const studyBuilder = readOneBuilder(publishedStudy);
    const blocksBuilder = readManyBuilder([validTextBlock]);
    (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn()
        .mockReturnValueOnce(studyBuilder)
        .mockReturnValueOnce(blocksBuilder),
    });

    const response = await patchBlock(
      makeRequest(`http://localhost/api/admin/studio/case-studies/${CASE_STUDY_ID}/blocks/${BLOCK_ID}`, {
        type: 'text',
        content: { body: '' },
      }),
      makeBlockParams(),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Block 1 (Text) must include body text before publishing.',
    });
  });

  it('rejects deleting the last renderable block from a published study', async () => {
    const studyBuilder = readOneBuilder(publishedStudy);
    const blocksBuilder = readManyBuilder([validTextBlock]);
    (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn()
        .mockReturnValueOnce(studyBuilder)
        .mockReturnValueOnce(blocksBuilder),
    });

    const response = await deleteBlock(
      new NextRequest(`http://localhost/api/admin/studio/case-studies/${CASE_STUDY_ID}/blocks/${BLOCK_ID}`, {
        method: 'DELETE',
      }),
      makeBlockParams(),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'At least one content block is required before publishing.',
    });
  });

  it('allows blank draft block shapes but rejects unknown fields', async () => {
    const admin = {
      from: vi.fn(),
    };
    (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(admin);

    const response = await createBlock(
      makeRequest(`http://localhost/api/admin/studio/case-studies/${CASE_STUDY_ID}/blocks`, {
        type: 'video',
        content: { url: '', coverUrl: null, caption: null, autoplay: true },
      }),
      makeParams(),
    );

    expect(response.status).toBe(400);
    expect(admin.from).not.toHaveBeenCalled();
  });

  it('allows a structurally valid blank block on a draft study', async () => {
    const studyBuilder = readOneBuilder({ ...publishedStudy, status: 'draft', published_at: null });
    const blocksBuilder = readManyBuilder([]);
    const insertBuilder = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: BLOCK_ID,
          case_study_id: CASE_STUDY_ID,
          type: 'video',
          sort_order: 0,
          content: { url: '', coverUrl: null, caption: null },
        },
        error: null,
      }),
    };
    (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn()
        .mockReturnValueOnce(studyBuilder)
        .mockReturnValueOnce(blocksBuilder)
        .mockReturnValueOnce(insertBuilder),
    });

    const response = await createBlock(
      makeRequest(`http://localhost/api/admin/studio/case-studies/${CASE_STUDY_ID}/blocks`, {
        type: 'video',
        content: { url: '', coverUrl: null, caption: null },
      }),
      makeParams(),
    );

    expect(response.status).toBe(201);
  });

  it('archives an archived record that has previously been published', async () => {
    const currentBuilder = readOneBuilder({ status: 'archived', published_at: publishedStudy.published_at });
    const updateBuilder = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn(),
    };
    const admin = {
      from: vi.fn()
        .mockReturnValueOnce(currentBuilder)
        .mockReturnValueOnce(updateBuilder),
    };
    (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(admin);

    const response = await deleteCaseStudy(
      new NextRequest(`http://localhost/api/admin/studio/case-studies/${CASE_STUDY_ID}`, { method: 'DELETE' }),
      makeParams(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ archived: true });
    expect(updateBuilder.delete).not.toHaveBeenCalled();
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

  it('rejects malformed route and block UUIDs before reorder writes', async () => {
    const admin = {
      rpc: vi.fn(),
    };
    (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(admin);

    const response = await reorderBlocks(
      makeRequest('http://localhost/api/admin/studio/case-studies/not-a-uuid/blocks/reorder', { orderedIds: ['also-not-a-uuid'] }),
      { params: Promise.resolve({ id: 'not-a-uuid' }) },
    );

    expect(response.status).toBe(400);
    expect(admin.rpc).not.toHaveBeenCalled();
  });

  it('delegates a complete reorder to the atomic database RPC', async () => {
    const studyBuilder = readOneBuilder({ ...publishedStudy, status: 'draft' });
    const blocksBuilder = readManyBuilder([
      validTextBlock,
      { ...validTextBlock, id: SECOND_BLOCK_ID, sort_order: 1 },
    ]);
    const admin = {
      from: vi.fn()
        .mockReturnValueOnce(studyBuilder)
        .mockReturnValueOnce(blocksBuilder),
      rpc: vi.fn().mockResolvedValue({ error: null }),
    };
    (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(admin);

    const response = await reorderBlocks(
      makeRequest(`http://localhost/api/admin/studio/case-studies/${CASE_STUDY_ID}/blocks/reorder`, { orderedIds: [SECOND_BLOCK_ID, BLOCK_ID] }),
      makeParams(),
    );

    expect(response.status).toBe(200);
    expect(admin.rpc).toHaveBeenCalledWith('reorder_studio_case_study_blocks', {
      p_case_study_id: CASE_STUDY_ID,
      p_ordered_ids: [SECOND_BLOCK_ID, BLOCK_ID],
    });
  });
});
