'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price_ngn: number;
  is_active: boolean;
  purchaseCount: number;
}

export default function MarketplaceAdmin({ products }: { products: Product[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('other');
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function slugify(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, slug: newSlug, price_ngn: Number(newPrice), category: newCategory }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? 'Failed to create product');
        return;
      }
      const { id } = await res.json();
      toast.success('Product created');
      router.push(`/admin/marketplace/${id}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(product: Product) {
    setTogglingId(product.id);
    try {
      const res = await fetch(`/api/admin/marketplace/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !product.is_active }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? 'Failed to update product');
        return;
      }
      toast.success(product.is_active ? 'Product deactivated' : 'Product activated');
      router.refresh();
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">Sell PDFs, templates, guides, and toolkits</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          + New Product
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="mb-8 p-5 rounded-lg border bg-card flex flex-col gap-4">
          <h2 className="font-semibold">New Product</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-1 flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Name</label>
              <input
                className="border rounded px-3 py-2 text-sm bg-background"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setNewSlug(slugify(e.target.value)); }}
                required
                placeholder="UX Research Toolkit"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Slug (URL)</label>
              <input
                className="border rounded px-3 py-2 text-sm bg-background font-mono"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                required
                placeholder="ux-research-toolkit"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Price (₦)</label>
              <input
                className="border rounded px-3 py-2 text-sm bg-background"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                required
                placeholder="5000"
                min="0"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Category</label>
              <select
                className="border rounded px-3 py-2 text-sm bg-background"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="pdf">PDF</option>
                <option value="template">Template</option>
                <option value="guide">Guide</option>
                <option value="toolkit">Toolkit</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="px-4 py-2 text-sm rounded-md border hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <p className="text-muted-foreground text-sm py-10 text-center">No products yet. Create one above.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Price</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Sales</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{product.category}</td>
                    <td className="px-4 py-3 text-right">₦{product.price_ngn.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleActive(product)}
                        disabled={togglingId === product.id}
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                          product.is_active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200'
                        } disabled:opacity-50`}
                      >
                        {product.is_active ? 'Active' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{product.purchaseCount}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/marketplace/${product.id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Edit →
                      </Link>
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
