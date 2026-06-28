import { NextRequest, NextResponse } from 'next/server';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';
import { upsertContractFieldValues } from '@/lib/contracts/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ContractMode } from '@/lib/contracts/types';

export async function GET(request: NextRequest) {
  try {
    await requireAdminApi('finance');
    const mode = request.nextUrl.searchParams.get('mode');
    const status = request.nextUrl.searchParams.get('status');
    const admin = createAdminClient();

    let query = admin
      .from('contracts')
      .select('*, contract_payments(*)')
      .order('created_at', { ascending: false });

    if (mode) query = query.eq('mode', mode);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ contracts: data ?? [] });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAdminApi('finance');
    const body = await request.json() as {
      template_id?: string;
      mode?: ContractMode;
      title?: string;
      recipient_name?: string;
      recipient_email?: string;
      payment_amount_ngn?: number | null;
      payment_description?: string | null;
      values?: Record<string, string>;
    };

    if (!body.template_id) return NextResponse.json({ error: 'Template is required' }, { status: 400 });
    if (!body.mode || !['employee', 'contractor', 'client'].includes(body.mode)) {
      return NextResponse.json({ error: 'Valid contract mode is required' }, { status: 400 });
    }
    if (!body.title?.trim()) return NextResponse.json({ error: 'Contract title is required' }, { status: 400 });

    const admin = createAdminClient();
    const paymentAmount = Number(body.payment_amount_ngn ?? 0);
    const paymentStatus = body.mode === 'client' && paymentAmount > 0 ? 'pending' : 'not_required';

    const { data: contract, error } = await admin
      .from('contracts')
      .insert({
        template_id: body.template_id,
        mode: body.mode,
        title: body.title.trim(),
        recipient_name: body.recipient_name?.trim() ?? '',
        recipient_email: body.recipient_email?.trim().toLowerCase() ?? '',
        payment_amount_ngn: paymentAmount > 0 ? paymentAmount : null,
        payment_description: body.payment_description?.trim() || null,
        payment_status: paymentStatus,
        created_by: userId,
      })
      .select()
      .single();

    if (error || !contract) {
      return NextResponse.json({ error: error?.message ?? 'Failed to create contract' }, { status: 500 });
    }

    await upsertContractFieldValues(admin, contract.id, body.values ?? {});

    if (paymentStatus === 'pending' && paymentAmount > 0) {
      await admin.from('contract_payments').insert({
        contract_id: contract.id,
        status: 'pending',
        amount_ngn: paymentAmount,
        method: 'paystack',
        created_by: userId,
      });
    }

    return NextResponse.json({ contract });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
