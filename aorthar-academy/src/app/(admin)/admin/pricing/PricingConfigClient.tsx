'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export type AdminPlanRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billing_type: string;
  plan_type: string;
  is_active: boolean;
};

export default function PricingConfigClient({ initialPlans }: { initialPlans: AdminPlanRow[] }) {
  const plans = initialPlans;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Pricing Configuration</h2>
        <p className="text-sm text-muted-foreground">Manage pricing plans shown on the public pricing page. Open each plan to edit.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {plan.description && plan.description.length > 0 ? plan.description : 'No description'}
                  </CardDescription>
                </div>
                <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                  {plan.is_active ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-semibold">{plan.currency} {plan.price.toLocaleString()}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Billing</p>
                  <p className="font-semibold">{plan.billing_type}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-semibold">{plan.plan_type}</p>
                </div>
              </div>
              <Button asChild>
                <Link href={`/admin/pricing/${plan.id}`}>Edit Plan</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No pricing plans found.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
