import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminApi, mapAdminApiError } from '@/lib/admin/apiAuth';

// GET /api/admin/marketplace
// Returns all products (active + inactive) with purchase counts
export async function GET() {
  try {
    await requireAdminApi('content');
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }

  const admin = createAdminClient();

  const { data: products, error } = await admin
    .from('marketplace_products')
    .select('id, slug, name, description, price_ngn, category, file_url, thumbnail_url, is_active, sort_order, created_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[admin/marketplace] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }

  const { data: counts } = await admin
    .from('marketplace_purchases')
    .select('product_id')
    .eq('payment_status', 'paid');

  const countMap = new Map<string, number>();
  for (const row of counts ?? []) {
    countMap.set(row.product_id, (countMap.get(row.product_id) ?? 0) + 1);
  }

  const data = (products ?? []).map((p) => ({
    ...p,
    purchaseCount: countMap.get(p.id) ?? 0,
  }));

  return NextResponse.json({ data });
}

// POST /api/admin/marketplace
// Body: { name, slug, price_ngn, category }
export async function POST(request: NextRequest) {
  try {
    await requireAdminApi('content');
  } catch (err) {
    const { status, message } = mapAdminApiError(err);
    return NextResponse.json({ error: message }, { status });
  }

  let body: { name?: string; slug?: string; price_ngn?: number; category?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const name = (body.name ?? '').trim();
  const slug = (body.slug ?? '').trim().toLowerCase();
  const priceNgn = Number(body.price_ngn ?? 0);
  const category = body.category ?? 'other';

  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
  }
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Slug must be lowercase letters, numbers, and hyphens only' }, { status: 400 });
  }
  if (isNaN(priceNgn) || priceNgn < 0) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from('marketplace_products')
    .insert({ name, slug, price_ngn: priceNgn, category, is_active: false })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 409 });
    }
    console.error('[admin/marketplace] POST insert error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
