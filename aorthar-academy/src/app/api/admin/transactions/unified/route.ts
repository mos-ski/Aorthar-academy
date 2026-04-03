import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapAdminApiError, requireAdminApi } from '@/lib/admin/apiAuth';

type UnifiedTransaction = {
  id: string;
  kind: 'subscription' | 'standalone';
  reference: string;
  amount_ngn: number;
  status: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  plan_type: string | null;
  course_title: string | null;
  course_slug: string | null;
  occurred_at: string;
};

export async function GET(req: NextRequest) {
  try {
    await requireAdminApi();
    const admin = createAdminClient();
    const searchParams = req.nextUrl.searchParams;

    const revenueType = searchParams.get('revenue_type'); // subscription | standalone | null
    const status = searchParams.get('status');
    const search = (searchParams.get('search') ?? '').trim().toLowerCase();
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const [subscriptionsResp, standaloneResp, profilesResp] = await Promise.all([
      admin
        .from('transactions')
        .select('id, paystack_reference, amount, status, user_id, plan_type, created_at, paid_at')
        .order('created_at', { ascending: false })
        .limit(500),
      admin
        .from('standalone_purchases')
        .select('id, paystack_reference, amount_paid_ngn, user_id, course_id, purchased_at, standalone_courses(title, slug)')
        .order('purchased_at', { ascending: false })
        .limit(500),
      admin
        .from('profiles')
        .select('user_id, full_name, email'),
    ]);

    if (subscriptionsResp.error) {
      return NextResponse.json({ error: subscriptionsResp.error.message }, { status: 500 });
    }
    if (standaloneResp.error) {
      return NextResponse.json({ error: standaloneResp.error.message }, { status: 500 });
    }
    if (profilesResp.error) {
      return NextResponse.json({ error: profilesResp.error.message }, { status: 500 });
    }

    const profiles = profilesResp.data ?? [];
    const profileMap = new Map(
      profiles.map((profile) => [
        profile.user_id,
        {
          name: profile.full_name as string | null,
          email: (profile as { email?: string | null }).email ?? null,
        },
      ]),
    );

    // Collect user_ids that don't have a profile row (offline buyers who haven't signed up yet)
    const allUserIds = new Set([
      ...(subscriptionsResp.data ?? []).map((t) => t.user_id),
      ...(standaloneResp.data ?? []).map((p) => p.user_id),
    ]);
    const missingUserIds = [...allUserIds].filter((uid) => uid && !profileMap.has(uid));
    if (missingUserIds.length > 0) {
      await Promise.all(
        missingUserIds.map(async (uid) => {
          const { data } = await admin.auth.admin.getUserById(uid);
          if (data?.user) {
            profileMap.set(uid, {
              name: (data.user.user_metadata?.full_name as string | null) ?? null,
              email: data.user.email ?? null,
            });
          }
        }),
      );
    }

    const subscriptionTxns: UnifiedTransaction[] = (subscriptionsResp.data ?? []).map((transaction) => {
      const user = profileMap.get(transaction.user_id);
      return {
        id: transaction.id,
        kind: 'subscription',
        reference: transaction.paystack_reference,
        amount_ngn: Number(transaction.amount ?? 0),
        status: transaction.status,
        user_id: transaction.user_id,
        user_name: user?.name ?? null,
        user_email: user?.email ?? null,
        plan_type: transaction.plan_type,
        course_title: null,
        course_slug: null,
        occurred_at: transaction.paid_at ?? transaction.created_at,
      };
    });

    const standaloneTxns: UnifiedTransaction[] = (standaloneResp.data ?? []).map((purchase) => {
      const user = profileMap.get(purchase.user_id);
      const course = purchase.standalone_courses as { title?: string; slug?: string } | null;
      return {
        id: purchase.id,
        kind: 'standalone',
        reference: purchase.paystack_reference,
        amount_ngn: Number(purchase.amount_paid_ngn ?? 0),
        status: 'success',
        user_id: purchase.user_id,
        user_name: user?.name ?? null,
        user_email: user?.email ?? null,
        plan_type: null,
        course_title: course?.title ?? null,
        course_slug: course?.slug ?? null,
        occurred_at: purchase.purchased_at,
      };
    });

    let merged = [...subscriptionTxns, ...standaloneTxns];

    if (revenueType === 'subscription' || revenueType === 'standalone') {
      merged = merged.filter((row) => row.kind === revenueType);
    }

    if (status) {
      merged = merged.filter((row) => row.status === status);
    }

    if (startDate) {
      const start = new Date(startDate).getTime();
      merged = merged.filter((row) => new Date(row.occurred_at).getTime() >= start);
    }

    if (endDate) {
      const end = new Date(endDate).getTime();
      merged = merged.filter((row) => new Date(row.occurred_at).getTime() <= end);
    }

    if (search) {
      merged = merged.filter((row) => {
        const haystack = [
          row.user_name ?? '',
          row.user_email ?? '',
          row.reference ?? '',
          row.plan_type ?? '',
          row.course_title ?? '',
          row.course_slug ?? '',
        ].join(' ').toLowerCase();
        return haystack.includes(search);
      });
    }

    merged.sort((a, b) => +new Date(b.occurred_at) - +new Date(a.occurred_at));

    const successful = merged.filter((row) => row.status === 'success');
    const failed = merged.filter((row) => row.status === 'failed');
    const subscriptionRevenue = successful
      .filter((row) => row.kind === 'subscription')
      .reduce((sum, row) => sum + row.amount_ngn, 0);
    const standaloneRevenue = successful
      .filter((row) => row.kind === 'standalone')
      .reduce((sum, row) => sum + row.amount_ngn, 0);

    return NextResponse.json({
      data: merged,
      kpi: {
        total_revenue_ngn: subscriptionRevenue + standaloneRevenue,
        successful_count: successful.length,
        subscription_revenue_ngn: subscriptionRevenue,
        standalone_revenue_ngn: standaloneRevenue,
        failure_count: failed.length,
      },
    });
  } catch (error) {
    const mapped = mapAdminApiError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
