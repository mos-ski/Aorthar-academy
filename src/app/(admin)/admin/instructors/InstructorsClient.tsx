'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Instructor = {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
};

function isInstructor(value: Instructor | { error?: string }): value is Instructor {
  return 'id' in value;
}

export default function InstructorsClient({ instructors: initialInstructors }: { instructors: Instructor[] }) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [instructors, setInstructors] = useState(initialInstructors);
  const [form, setForm] = useState({ full_name: '', email: '', avatar_url: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch('/api/admin/instructors/avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json() as { avatar_url?: string; error?: string };
      if (!res.ok || !data.avatar_url) {
        toast.error(data.error ?? 'Avatar upload failed');
        return;
      }
      setForm((prev) => ({ ...prev, avatar_url: data.avatar_url ?? '' }));
      toast.success('Avatar uploaded');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function createInstructor(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/instructors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json() as Instructor | { error?: string };
      if (!res.ok || !isInstructor(data)) {
        toast.error(('error' in data && data.error) ? data.error : 'Failed to create instructor');
        return;
      }
      setInstructors((prev) => [data, ...prev]);
      setForm({ full_name: '', email: '', avatar_url: '' });
      toast.success('Instructor added');
    } finally {
      setSaving(false);
    }
  }

  async function toggleInstructor(instructor: Instructor): Promise<void> {
    const res = await fetch(`/api/admin/instructors/${instructor.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !instructor.is_active }),
    });
    const data = await res.json() as Instructor | { error?: string };
    if (!res.ok || !isInstructor(data)) {
      toast.error(('error' in data && data.error) ? data.error : 'Failed to update instructor');
      return;
    }
    setInstructors((prev) => prev.map((row) => (row.id === data.id ? data : row)));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Instructors</h2>
        <p className="text-sm text-muted-foreground">Register bootcamp instructors for course dropdowns.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Instructor</CardTitle>
          <CardDescription>These profiles are available in the bootcamp editor.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createInstructor} className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <Input
              placeholder="Full name"
              value={form.full_name}
              onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
            <div className="flex gap-2">
              <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={uploadAvatar} />
              <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()} disabled={uploading}>
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading' : 'Avatar'}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving' : 'Add'}
              </Button>
            </div>
          </form>
          {form.avatar_url && (
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              <AvatarImage name={form.full_name || 'Instructor'} url={form.avatar_url} />
              <span>Avatar ready</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructor Directory</CardTitle>
          <CardDescription>{instructors.length} instructor profiles</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructors.map((instructor) => (
                <TableRow key={instructor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <AvatarImage name={instructor.full_name} url={instructor.avatar_url} />
                      <span className="font-medium">{instructor.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{instructor.email ?? '—'}</TableCell>
                  <TableCell>{instructor.is_active ? 'Active' : 'Hidden'}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => void toggleInstructor(instructor)}>
                      {instructor.is_active ? 'Hide' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {instructors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No instructors registered yet.
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

function AvatarImage({ name, url }: { name: string; url: string | null }): React.ReactElement {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'IN';

  return (
    <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-bold text-primary-foreground">
      {url ? <Image src={url} alt={name} fill className="object-cover" unoptimized /> : initials}
    </span>
  );
}
