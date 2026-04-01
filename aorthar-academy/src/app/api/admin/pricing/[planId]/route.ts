import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { writeAuditLog } from '@/lib/admin/audit';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> },
) {
  try {
    const { userId: performedBy } = await requireAdminApi();
    const { planId } = await params;
    const body = await req.json();

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : null;
    const price = Number(body.price);
    const currency = typeof body.currency === 'string' ? body.currency.trim().toUpperCase() : '';
    const isActive = Boolean(body.is_active);
    const accessScope = Array.isArray(body.access_scope)
      ? body.access_scope.filter((value: unknown): value is string => typeof value === 'string')
      : [];

    if (!name) {
      return NextResponse.json({ error: 'Plan name is required' }, { status: 400 });
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: 'Price must be a non-negative number' }, { status: 400 });
    }

    if (currency.length !== 3) {
      return NextResponse.json({ error: 'Currency must be a 3-letter code' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: before } = await supabase
      .from('plans')
      .select('name, description, price, currency, is_active, access_scope')
      .eq('id', planId)
      .maybeSingle();

    const { data, error } = await supabase
      .from('plans')
      .update({
        name,
        description,
        price,
        currency,
        is_active: isActive,
        access_scope: accessScope,
      })
      .eq('id', planId)
      .select('id, name, description, price, currency, billing_type, plan_type, is_active, access_scope')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await writeAuditLog({
      action: 'plan_updated',
      performedBy,
      entityType: 'plan',
      entityId: planId,
      oldValue: before,
      newValue: {
        name,
        description,
        price,
        currency,
        is_active: isActive,
        access_scope: accessScope,
      },
      req,
    }, supabase);

    return NextResponse.json({ data });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
