'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  scope: 'all' | 'specific';
  course_id: string | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  standalone_courses: { title: string; slug: string } | null;
}

interface Course {
  id: string;
  title: string;
  slug: string;
}

export default function CouponAdmin({ coupons: initialCoupons, courses }: { coupons: Coupon[]; courses: Course[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    scope: 'all' as 'all' | 'specific',
    course_id: '',
    max_uses: '',
    expires_at: '',
  });

  function generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code || !form.discount_value) {
      toast.error('Code and discount value are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.toUpperCase().trim(),
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
          scope: form.scope,
          course_id: form.scope === 'specific' ? form.course_id : null,
          max_uses: form.max_uses ? Number(form.max_uses) : null,
          expires_at: form.expires_at || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to create coupon');
        return;
      }
      setCoupons([data, ...coupons]);
      setCreating(false);
      setForm({ code: '', discount_type: 'percentage', discount_value: '', scope: 'all', course_id: '', max_uses: '', expires_at: '' });
      toast.success('Coupon created');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(coupon: Coupon) {
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !coupon.is_active }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? 'Failed to update coupon');
      return;
    }
    setCoupons(coupons.map((c) => (c.id === coupon.id ? { ...c, is_active: !c.is_active } : c)));
    toast.success(coupon.is_active ? 'Coupon deactivated' : 'Coupon activated');
  }

  async function deleteCoupon(coupon: Coupon) {
    if (!confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? 'Failed to delete coupon');
      return;
    }
    setCoupons(coupons.filter((c) => c.id !== coupon.id));
    toast.success('Coupon deleted');
  }

  function formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage discount codes for bootcamp purchases</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto"
        >
          + New Coupon
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="mb-8 p-5 rounded-lg border bg-card flex flex-col gap-4">
          <h2 className="font-semibold">New Coupon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Code</label>
              <div className="flex gap-2">
                <input
                  className="border rounded px-3 py-2 text-sm bg-background font-mono uppercase flex-1"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  required
                  placeholder="SUMMER50"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, code: generateCode() }))}
                  className="px-3 py-2 text-xs rounded border hover:bg-muted shrink-0"
                >
                  Generate
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Discount Type</label>
              <select
                className="border rounded px-3 py-2 text-sm bg-background"
                value={form.discount_type}
                onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as 'percentage' | 'fixed' }))}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₦)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Discount Value {form.discount_type === 'percentage' ? '(%)' : '(₦)'}</label>
              <input
                className="border rounded px-3 py-2 text-sm bg-background"
                type="number"
                min="1"
                max={form.discount_type === 'percentage' ? '100' : undefined}
                value={form.discount_value}
                onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
                required
                placeholder={form.discount_type === 'percentage' ? '25' : '5000'}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Applies To</label>
              <select
                className="border rounded px-3 py-2 text-sm bg-background"
                value={form.scope}
                onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value as 'all' | 'specific', course_id: '' }))}
              >
                <option value="all">All Bootcamps</option>
                <option value="specific">Specific Bootcamp</option>
              </select>
            </div>
            {form.scope === 'specific' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Bootcamp</label>
                <select
                  className="border rounded px-3 py-2 text-sm bg-background"
                  value={form.course_id}
                  onChange={(e) => setForm((f) => ({ ...f, course_id: e.target.value }))}
                  required
                >
                  <option value="">Select a bootcamp</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Max Uses (optional, leave empty for unlimited)</label>
              <input
                className="border rounded px-3 py-2 text-sm bg-background"
                type="number"
                min="1"
                value={form.max_uses}
                onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                placeholder="Unlimited"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Expires At (optional)</label>
              <input
                className="border rounded px-3 py-2 text-sm bg-background"
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create Coupon'}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {coupons.length === 0 ? (
        <p className="text-muted-foreground text-sm py-10 text-center">No coupons yet. Create one above.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Code</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Discount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Applies To</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Usage</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Expires</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold">{coupon.code}</td>
                    <td className="px-4 py-3">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}%`
                        : `₦${coupon.discount_value.toLocaleString()}`}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {coupon.scope === 'all'
                        ? 'All Bootcamps'
                        : coupon.standalone_courses?.title ?? 'Specific Bootcamp'}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {coupon.used_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatDate(coupon.expires_at)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(coupon)}
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          coupon.is_active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteCoupon(coupon)}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}