'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const FEATURE_OPTIONS = [
  { key: '200_level', label: 'Year 200 Access' },
  { key: '300_level', label: 'Year 300 Access' },
  { key: '400_level', label: 'Year 400 Access' },
  { key: 'gpa_export', label: 'GPA Export' },
  { key: 'capstone', label: 'Capstone Access' },
  { key: 'mentorship', label: 'Mentorship' },
  { key: 'priority_support', label: 'Priority Support' },
  { key: 'unlimited_attempts', label: 'Unlimited Attempts' },
] as const;

const UNIVERSITY_SCOPE_PREFIX = 'course:university:';
const EXTERNAL_SCOPE_PREFIX = 'course:external:';

type AdminPlanRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billing_type: string;
  plan_type: string;
  is_active: boolean;
  access_scope: string[];
};

type UniversityCourseOption = {
  id: string;
  code: string;
  name: string;
  status: string;
  is_premium: boolean;
};

type ExternalCourseOption = {
  id: string;
  slug: string;
  title: string;
  status: string;
};

export default function PlanEditorClient({
  plan,
  universityCourses,
  externalCourses,
}: {
  plan: AdminPlanRow;
  universityCourses: UniversityCourseOption[];
  externalCourses: ExternalCourseOption[];
}) {
  const router = useRouter();
  const knownFeatureKeys = FEATURE_OPTIONS.map((feature) => feature.key);
  const initialScope = Array.isArray(plan.access_scope) ? plan.access_scope : [];
  const initialFeatures = initialScope.filter((key) =>
    knownFeatureKeys.includes(key as (typeof FEATURE_OPTIONS)[number]['key']),
  );
  const initialUniversityCourseIds = initialScope
    .filter((key) => key.startsWith(UNIVERSITY_SCOPE_PREFIX))
    .map((key) => key.slice(UNIVERSITY_SCOPE_PREFIX.length));
  const initialExternalCourseIds = initialScope
    .filter((key) => key.startsWith(EXTERNAL_SCOPE_PREFIX))
    .map((key) => key.slice(EXTERNAL_SCOPE_PREFIX.length));
  const preservedScopeKeys = initialScope.filter((key) =>
    !knownFeatureKeys.includes(key as (typeof FEATURE_OPTIONS)[number]['key'])
    && !key.startsWith(UNIVERSITY_SCOPE_PREFIX)
    && !key.startsWith(EXTERNAL_SCOPE_PREFIX),
  );

  const [form, setForm] = useState({
    name: plan.name,
    description: plan.description ?? '',
    price: String(plan.price),
    currency: plan.currency,
    is_active: plan.is_active,
    featureKeys: initialFeatures,
    universityCourseIds: initialUniversityCourseIds,
    externalCourseIds: initialExternalCourseIds,
  });
  const [saving, setSaving] = useState(false);

  async function onSave(): Promise<void> {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pricing/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          currency: form.currency,
          is_active: form.is_active,
          access_scope: [
            ...form.featureKeys,
            ...form.universityCourseIds.map((id) => `${UNIVERSITY_SCOPE_PREFIX}${id}`),
            ...form.externalCourseIds.map((id) => `${EXTERNAL_SCOPE_PREFIX}${id}`),
            ...preservedScopeKeys,
          ],
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to update plan');
        return;
      }
      toast.success('Plan updated');
      router.push('/admin/pricing');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function toggleFeature(featureKey: string): void {
    setForm((prev) => ({
      ...prev,
      featureKeys: prev.featureKeys.includes(featureKey)
        ? prev.featureKeys.filter((key) => key !== featureKey)
        : [...prev.featureKeys, featureKey],
    }));
  }

  function toggleUniversityCourse(courseId: string): void {
    setForm((prev) => ({
      ...prev,
      universityCourseIds: prev.universityCourseIds.includes(courseId)
        ? prev.universityCourseIds.filter((id) => id !== courseId)
        : [...prev.universityCourseIds, courseId],
    }));
  }

  function toggleExternalCourse(courseId: string): void {
    setForm((prev) => ({
      ...prev,
      externalCourseIds: prev.externalCourseIds.includes(courseId)
        ? prev.externalCourseIds.filter((id) => id !== courseId)
        : [...prev.externalCourseIds, courseId],
    }));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold">Edit Plan</h2>
        <p className="text-sm text-muted-foreground">{plan.plan_type} · {plan.billing_type}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{plan.name}</CardTitle>
          <CardDescription>Update this pricing plan settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                maxLength={3}
                value={form.currency}
                onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))}
            />
            Enabled
          </label>

          <div className="space-y-2">
            <Label>Accessible Features</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {FEATURE_OPTIONS.map((feature) => (
                <label key={feature.key} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featureKeys.includes(feature.key)}
                    onChange={() => toggleFeature(feature.key)}
                  />
                  {feature.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Accessible University Courses</Label>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3">
              {universityCourses.map((course) => (
                <label key={course.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.universityCourseIds.includes(course.id)}
                    onChange={() => toggleUniversityCourse(course.id)}
                  />
                  <span className="font-mono text-xs text-muted-foreground">{course.code}</span>
                  <span>{course.name}</span>
                </label>
              ))}
              {universityCourses.length === 0 && (
                <p className="text-sm text-muted-foreground">No university courses found.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Accessible External Courses</Label>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3">
              {externalCourses.map((course) => (
                <label key={course.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.externalCourseIds.includes(course.id)}
                    onChange={() => toggleExternalCourse(course.id)}
                  />
                  <span>{course.title}</span>
                  <span className="text-xs text-muted-foreground">({course.slug})</span>
                </label>
              ))}
              {externalCourses.length === 0 && (
                <p className="text-sm text-muted-foreground">No external courses found.</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => void onSave()} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/pricing">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
