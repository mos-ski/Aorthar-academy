import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import PricingButton from '@/components/PricingButton';

const FEATURE_LABELS: Record<string, string> = {
  '400_level': 'Year 400 access',
  gpa_export: 'GPA transcript export',
  capstone: 'Capstone submission',
  mentorship: 'Mentorship eligibility',
  unlimited_attempts: 'Unlimited quiz attempts',
};

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: plans } = await supabase.from('plans').select('*').order('price');

  return (
    <div className="min-h-screen bg-background py-16 px-[15%]">
      <div className="space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="outline">Pricing</Badge>
          <h1 className="text-4xl font-bold">Unlock your full potential</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Free for 100–300 level. Premium unlocks Year 400, capstone, and certification.
          </p>
        </div>

        {/* Free tier card */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Everything you need to start learning</CardDescription>
              <p className="text-3xl font-bold">$0</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {['Year 100–300 access', '3 quiz attempts per course', 'Community forum'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <PricingButton planType="free" label="Get Started Free" />
            </CardFooter>
          </Card>

          {/* Premium plans */}
          {(plans ?? []).map((plan) => (
            <Card key={plan.id} className="border-primary shadow-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{plan.name}</CardTitle>
                  <Badge>Popular</Badge>
                </div>
                <CardDescription>{plan.billing_type === 'one_time' ? 'One-time payment' : `Billed ${plan.plan_type}`}</CardDescription>
                <p className="text-3xl font-bold">{formatCurrency(plan.price, plan.currency)}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(plan.access_scope ?? []).map((scope: string) => (
                    <li key={scope} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      {FEATURE_LABELS[scope] ?? scope}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <PricingButton planId={plan.id} planType={plan.plan_type} label={`Get ${plan.name}`} />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
