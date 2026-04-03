'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  semesterId: string;
  nextSortOrder: number;
}

export default function NewCourseDialog({ semesterId, nextSortOrder }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    credit_units: 3,
    pass_mark: 60,
    sort_order: nextSortOrder,
    is_premium: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) return toast.error('Code and name are required');
    setSaving(true);
    const res = await fetch('/api/admin/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, semester_id: semesterId }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success('Course created');
      setOpen(false);
      setForm({ code: '', name: '', description: '', credit_units: 3, pass_mark: 60, sort_order: nextSortOrder, is_premium: false });
      router.refresh();
    } else {
      const json = await res.json();
      toast.error(json.error ?? 'Failed to create course');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
          <Plus className="h-3.5 w-3.5" />New Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Course Code *</Label>
              <Input
                placeholder="e.g. UI-101"
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sort Order</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((p) => ({ ...p, sort_order: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Course Name *</Label>
            <Input
              placeholder="Introduction to UI/UX Design"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea
              rows={2}
              placeholder="Brief course description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Credit Units</Label>
              <Input
                type="number"
                min={1}
                value={form.credit_units}
                onChange={(e) => setForm((p) => ({ ...p, credit_units: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Pass Mark (%)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={form.pass_mark}
                onChange={(e) => setForm((p) => ({ ...p, pass_mark: Number(e.target.value) }))}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_premium}
              onChange={(e) => setForm((p) => ({ ...p, is_premium: e.target.checked }))}
              className="h-4 w-4"
            />
            Premium course
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Course'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
