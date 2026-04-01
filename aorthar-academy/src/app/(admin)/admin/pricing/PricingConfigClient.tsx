'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

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
  const [plans, setPlans] = useState<AdminPlanRow[]>(initialPlans);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function savePlan(plan: AdminPlanRow): Promise<void> {
    setSavingId(plan.id);
    try {
      const res = await fetch(`/api/admin/pricing/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: plan.name,
          description: plan.description,
          price: plan.price,
          currency: plan.currency,
          is_active: plan.is_active,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to update pricing plan');
        return;
      }
      toast.success('Pricing updated');
    } finally {
      setSavingId(null);
    }
  }

  function updatePlan(planId: string, patch: Partial<AdminPlanRow>): void {
    setPlans((prev) => prev.map((plan) => (plan.id === planId ? { ...plan, ...patch } : plan)));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Pricing Configuration</h2>
        <p className="text-sm text-muted-foreground">Manage pricing plans shown on the public pricing page.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plans</CardTitle>
          <CardDescription>Update name, amount, currency and active status.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">Plan</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[110px]">Type</TableHead>
                <TableHead className="w-[110px]">Billing</TableHead>
                <TableHead className="w-[120px]">Price</TableHead>
                <TableHead className="w-[120px]">Currency</TableHead>
                <TableHead className="w-[140px]">Active</TableHead>
                <TableHead className="w-24">Save</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="align-top whitespace-normal">
                    <Input
                      value={plan.name}
                      onChange={(event) => updatePlan(plan.id, { name: event.target.value })}
                    />
                  </TableCell>
                  <TableCell className="align-top whitespace-normal">
                    <Textarea
                      className="min-h-20"
                      value={plan.description ?? ''}
                      placeholder="Description"
                      onChange={(event) => updatePlan(plan.id, { description: event.target.value })}
                    />
                  </TableCell>
                  <TableCell className="text-sm">{plan.plan_type}</TableCell>
                  <TableCell className="text-sm">{plan.billing_type}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={plan.price}
                      onChange={(event) => updatePlan(plan.id, { price: Number(event.target.value) })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={plan.currency}
                      maxLength={3}
                      onChange={(event) => updatePlan(plan.id, { currency: event.target.value.toUpperCase() })}
                    />
                  </TableCell>
                  <TableCell>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={plan.is_active}
                        onChange={(event) => updatePlan(plan.id, { is_active: event.target.checked })}
                      />
                      Enabled
                    </label>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => void savePlan(plan)}
                      disabled={savingId === plan.id}
                    >
                      {savingId === plan.id ? 'Saving...' : 'Save'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {plans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    No plans found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
