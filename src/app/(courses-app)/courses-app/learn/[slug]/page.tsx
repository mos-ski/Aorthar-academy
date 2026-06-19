export const dynamic = 'force-dynamic';

import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyTransaction } from '@/lib/paystack';
import { sendEmail } from '@/lib/email';
import { purchaseConfirmationHtml, purchaseConfirmationSubject } from '@/lib/email/templates/purchase-confirmation';
import { paymentPlanStartedHtml, paymentPlanStartedSubject } from '@/lib/email/templates/payment-plan-started';
import { paymentPlanCompletedHtml, paymentPlanCompletedSubject } from '@/lib/email/templates/payment-plan-completed';
import { calculateDeadline } from '@/lib/paymentPlans';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ reference?: string; trxref?: string }>;
};

// Called after Paystack redirects back to /courses-app/learn/[slug]?reference=xxx
// → verifies payment if reference present, then forwards to first lesson
export default async function LearnCoursePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { reference } = await searchParams;

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/courses-app/learn/${slug}`);

  const { data: course } = await supabase
    .from('standalone_courses')
    .select('id, title, price_ngn')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!course) notFound();

  // If returning from Paystack with a reference, verify and record the purchase
  if (reference) {
    try {
      const paystack = await verifyTransaction(reference);
      const tx = paystack?.data;

      if (tx?.status === 'success' && tx?.metadata?.type === 'payment_plan_first' && tx?.metadata?.user_id === user.id) {
        const adminSupabase = createAdminClient();
        const meta = tx.metadata;
        const totalPriceNgn = Number(meta.total_price_ngn);
        const firstPaymentNgn = Number(meta.first_payment_ngn);
        const deadlineAt = calculateDeadline(new Date(), Number(meta.deadline_days)).toISOString();

        await adminSupabase
          .from('course_payment_plans')
          .upsert(
            {
              user_id: user.id,
              course_id: course.id,
              total_price_ngn: totalPriceNgn,
              first_payment_percent: Number(meta.percent ?? 0),
              first_payment_ngn: firstPaymentNgn,
              balance_ngn: totalPriceNgn - firstPaymentNgn,
              first_paystack_reference: reference,
              status: 'awaiting_balance',
              deadline_at: deadlineAt,
              terms_accepted_at: meta.terms_accepted_at ?? new Date().toISOString(),
            },
            { onConflict: 'first_paystack_reference' },
          );

        await adminSupabase
          .from('standalone_purchases')
          .upsert(
            { user_id: user.id, course_id: course.id, paystack_reference: reference, amount_paid_ngn: firstPaymentNgn },
            { onConflict: 'paystack_reference' },
          );

        void (async () => {
          try {
            const { data: profile } = await adminSupabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', user.id)
              .maybeSingle();
            const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
            if (user.email) {
              await sendEmail({
                to: user.email,
                subject: paymentPlanStartedSubject(course.title),
                html: paymentPlanStartedHtml({
                  firstName,
                  courseName: course.title,
                  firstPaymentNgn,
                  balanceNgn: totalPriceNgn - firstPaymentNgn,
                  deadline: deadlineAt,
                  dashboardUrl: 'https://bootcamp.aorthar.com',
                }),
              });
            }
          } catch { /* non-critical */ }
        })();
      } else if (tx?.status === 'success' && tx?.metadata?.type === 'payment_plan_balance' && tx?.metadata?.user_id === user.id) {
        const adminSupabase = createAdminClient();
        const planId = tx.metadata.plan_id;

        const { data: plan } = await adminSupabase
          .from('course_payment_plans')
          .select('id, user_id, course_id, total_price_ngn, balance_ngn, status')
          .eq('id', planId)
          .single();

        if (plan && plan.status === 'awaiting_balance') {
          await adminSupabase
            .from('course_payment_plans')
            .update({ status: 'completed', balance_paystack_reference: reference, balance_paid_at: new Date().toISOString() })
            .eq('id', planId);

          await adminSupabase
            .from('standalone_purchases')
            .update({ amount_paid_ngn: plan.total_price_ngn })
            .eq('user_id', plan.user_id)
            .eq('course_id', plan.course_id);

          void (async () => {
            try {
              const { data: profile } = await adminSupabase
                .from('profiles')
                .select('full_name')
                .eq('user_id', user.id)
                .maybeSingle();
              const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
              if (user.email) {
                await sendEmail({
                  to: user.email,
                  subject: paymentPlanCompletedSubject(course.title),
                  html: paymentPlanCompletedHtml({
                    firstName,
                    courseName: course.title,
                    balanceNgn: plan.balance_ngn,
                    dashboardUrl: 'https://bootcamp.aorthar.com',
                  }),
                });
              }
            } catch { /* non-critical */ }
          })();
        }
      } else if (tx?.status === 'success' && tx?.metadata?.type === 'standalone_course' && tx?.metadata?.user_id === user.id) {
        const adminSupabase = createAdminClient();

        await adminSupabase
          .from('standalone_purchases')
          .upsert(
            {
              user_id: user.id,
              course_id: course.id,
              paystack_reference: reference,
              amount_paid_ngn: course.price_ngn,
            },
            { onConflict: 'paystack_reference' },
          );

        // Send purchase confirmation email (fire-and-forget)
        void (async () => {
          try {
            const { data: profile } = await adminSupabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', user.id)
              .maybeSingle();
            const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
            if (user.email) {
              await sendEmail({
                to: user.email,
                subject: purchaseConfirmationSubject('course', course.title),
                html: purchaseConfirmationHtml({
                  firstName,
                  purchaseType: 'course',
                  itemName: course.title,
                  amountNgn: course.price_ngn,
                  dashboardUrl: 'https://bootcamp.aorthar.com',
                }),
              });
            }
          } catch { /* non-critical */ }
        })();
      }
    } catch {
      // Verification failed — fall through to purchase check below
    }
  }

  // Check purchase access
  const { data: purchase } = await supabase
    .from('standalone_purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle();

  if (!purchase) redirect(`/courses-app/${slug}`);

  // Get first lesson
  const { data: first } = await supabase
    .from('standalone_lessons')
    .select('id')
    .eq('course_id', course.id)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .limit(1)
    .single();

  if (!first) redirect(`/courses-app/${slug}`);

  redirect(`/courses-app/learn/${slug}/${first.id}`);
}
