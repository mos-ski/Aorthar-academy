'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_ngn: number;
  category: string;
  file_url: string;
  thumbnail_url: string | null;
  is_active: boolean;
  sort_order: number;
}

interface Purchase {
  id: string;
  email: string;
  amount_paid_ngn: number | null;
  paid_at: string | null;
  download_count: number;
}

export default function MarketplaceProductEditor({
  product,
  purchaseCount,
  recentPurchases,
}: {
  product: Product;
  purchaseCount: number;
  recentPurchases: Purchase[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: product.name,
    slug: product.slug,
    description: product.description,
    price_ngn: String(product.price_ngn),
    category: product.category,
    file_url: product.file_url,
    thumbnail_url: product.thumbnail_url ?? '',
    sort_order: String(product.sort_order),
    is_active: product.is_active,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, type, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/marketplace/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          price_ngn: Number(form.price_ngn),
          category: form.category,
          file_url: form.file_url,
          thumbnail_url: form.thumbnail_url || null,
          sort_order: Number(form.sort_order),
          is_active: form.is_active,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? 'Failed to save');
        return;
      }
      toast.success('Saved');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/marketplace/${product.id}`, { method: 'DELETE' });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d.error ?? 'Failed to delete');
        return;
      }
      if (d.soft_deleted) {
        toast.success('Product deactivated (has existing purchases — hard delete blocked)');
        router.refresh();
      } else {
        toast.success('Product deleted');
        router.push('/admin/marketplace');
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Marketplace
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium truncate">{product.name}</span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 rounded-lg border bg-card space-y-5">
          <h2 className="font-semibold text-base">Product Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="border rounded px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Slug (URL) *</label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
                pattern="^[a-z0-9-]+$"
                className="border rounded px-3 py-2 text-sm bg-background font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="border rounded px-3 py-2 text-sm bg-background resize-y"
              placeholder="Describe what's in this product and who it's for…"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Price (₦) *</label>
              <input
                name="price_ngn"
                type="number"
                min="0"
                value={form.price_ngn}
                onChange={handleChange}
                required
                className="border rounded px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="border rounded px-3 py-2 text-sm bg-background"
              >
                <option value="pdf">PDF</option>
                <option value="template">Template</option>
                <option value="guide">Guide</option>
                <option value="toolkit">Toolkit</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Sort Order</label>
              <input
                name="sort_order"
                type="number"
                value={form.sort_order}
                onChange={handleChange}
                className="border rounded px-3 py-2 text-sm bg-background"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">File URL (download link) *</label>
            <input
              name="file_url"
              type="url"
              value={form.file_url}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm bg-background font-mono"
              placeholder="https://..."
            />
            <p className="text-[11px] text-muted-foreground">Supabase Storage, Google Drive, Dropbox, or any direct HTTPS link.</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Thumbnail URL</label>
            <input
              name="thumbnail_url"
              type="url"
              value={form.thumbnail_url}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm bg-background font-mono"
              placeholder="https://... (optional)"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label htmlFor="is_active" className="text-sm font-medium">
              Active — visible on public storefront
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {/* Recent purchases */}
      <div className="mt-10 p-6 rounded-lg border bg-card">
        <h2 className="font-semibold text-base mb-4">
          Purchases <span className="text-muted-foreground font-normal">({purchaseCount} total)</span>
        </h2>
        {recentPurchases.length === 0 ? (
          <p className="text-sm text-muted-foreground">No purchases yet.</p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Email</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Amount</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Date</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Downloads</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-mono text-xs">{p.email}</td>
                    <td className="px-4 py-2.5 text-right">
                      {p.amount_paid_ngn != null ? `₦${p.amount_paid_ngn.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">
                      {p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-NG') : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{p.download_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="mt-6 p-6 rounded-lg border border-destructive/30 bg-card">
        <h2 className="font-semibold text-base text-destructive mb-2">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {purchaseCount > 0
            ? `This product has ${purchaseCount} purchase(s). Deleting will deactivate it instead of removing it permanently.`
            : 'No purchases exist. This product can be permanently deleted.'}
        </p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 text-sm font-semibold rounded-md border border-destructive text-destructive hover:bg-destructive/10 disabled:opacity-50"
        >
          {deleting ? 'Processing…' : purchaseCount > 0 ? 'Deactivate Product' : 'Delete Product'}
        </button>
      </div>
    </div>
  );
}
