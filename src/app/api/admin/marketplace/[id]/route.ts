import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminApi, mapAdminApiError } from '@/lib/admin/apiAuth';

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/marketplace/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminApi('content');
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }

  const { id } = await params;
  const admin = createAdminClient();

  const { data: product, error } = await admin
    .from('marketplace_products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const { count } = await admin
    .from('marketplace_purchases')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id)
    .eq('payment_status', 'paid');

  return NextResponse.json({ data: { ...product, purchaseCount: count ?? 0 } });
}

// PUT /api/admin/marketplace/[id]
// Full update of all editable fields
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdminApi('content');
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : undefined;
  const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : undefined;
  const description = typeof body.description === 'string' ? body.description.trim() : undefined;
  const priceNgn = body.price_ngn !== undefined ? Number(body.price_ngn) : undefined;
  const category = typeof body.category === 'string' ? body.category : undefined;
  const fileUrl = typeof body.file_url === 'string' ? body.file_url.trim() : undefined;
  const thumbnailUrl = typeof body.thumbnail_url === 'string' ? body.thumbnail_url.trim() || null : undefined;
  const isActive = typeof body.is_active === 'boolean' ? body.is_active : undefined;
  const sortOrder = body.sort_order !== undefined ? Number(body.sort_order) : undefined;

  if (slug && !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Slug must be lowercase letters, numbers, and hyphens only' }, { status: 400 });
  }
  if (priceNgn !== undefined && (isNaN(priceNgn) || priceNgn < 0)) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (slug !== undefined) updates.slug = slug;
  if (description !== undefined) updates.description = description;
  if (priceNgn !== undefined) updates.price_ngn = priceNgn;
  if (category !== undefined) updates.category = category;
  if (fileUrl !== undefined) updates.file_url = fileUrl;
  if (thumbnailUrl !== undefined) updates.thumbnail_url = thumbnailUrl;
  if (isActive !== undefined) updates.is_active = isActive;
  if (sortOrder !== undefined) updates.sort_order = sortOrder;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from('marketplace_products')
    .update(updates)
    .eq('id', id);

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 409 });
    }
    console.error('[admin/marketplace] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// PATCH /api/admin/marketplace/[id]
// Toggle is_active only
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireAdminApi('content');
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }

  const { id } = await params;

  let body: { is_active?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (typeof body.is_active !== 'boolean') {
    return NextResponse.json({ error: 'is_active (boolean) is required' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from('marketplace_products')
    .update({ is_active: body.is_active })
    .eq('id', id);

  if (error) {
    console.error('[admin/marketplace] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/marketplace/[id]
// Soft-deactivates if purchases exist; hard-deletes if no purchases
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminApi('content');
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }

  const { id } = await params;
  const admin = createAdminClient();

  const { count } = await admin
    .from('marketplace_purchases')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id)
    .eq('payment_status', 'paid');

  if ((count ?? 0) > 0) {
    const { error } = await admin
      .from('marketplace_products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to deactivate product' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, soft_deleted: true });
  }

  const { error } = await admin
    .from('marketplace_products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[admin/marketplace] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, soft_deleted: false });
}
