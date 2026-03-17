'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { profileSchema, type ProfileInput } from '@/utils/validators';
import { AORTHAR_DEPARTMENTS } from '@/lib/academics/departments';
import type { Profile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/utils/formatters';

interface Subscription {
  start_date: string;
  end_date: string | null;
  plans: { name: string; billing_type: string } | null;
}

interface SettingsClientProps {
  profile: Profile | null;
  subscription: Subscription | null;
  email: string;
  userId: string;
}

export default function SettingsClient({ profile, subscription, email, userId }: SettingsClientProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [newDept, setNewDept] = useState('');
  const [deptLoading, setDeptLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      bio: profile?.bio ?? '',
    },
  });

  async function onProfileSave(values: ProfileInput) {
    setProfileLoading(true);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      toast.success('Profile updated.');
      router.refresh();
    } else {
      const data = await res.json().catch(() => null) as { error?: string } | null;
      toast.error(data?.error ?? 'Failed to update profile.');
    }
    setProfileLoading(false);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Avatar must be under 2 MB.');
      return;
    }
    setAvatarLoading(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });
    if (uploadError) {
      toast.error('Upload failed: ' + uploadError.message);
      setAvatarLoading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', userId);
    if (updateError) {
      toast.error('Failed to save avatar.');
    } else {
      setAvatarUrl(publicUrl);
      toast.success('Avatar updated.');
      router.refresh();
    }
    setAvatarLoading(false);
  }

  async function handleChangeDepartment() {
    if (!newDept) return;
    setDeptLoading(true);
    const res = await fetch('/api/onboarding/change-department', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department: newDept }),
    });
    if (res.ok) {
      setDeptModalOpen(false);
      toast.success('Department updated. Your progress has been reset.');
      router.push('/dashboard');
      router.refresh();
    } else {
      const data = await res.json().catch(() => null) as { error?: string } | null;
      toast.error(data?.error ?? 'Failed to change department.');
    }
    setDeptLoading(false);
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') return;
    setDeleteLoading(true);
    const res = await fetch('/api/account', { method: 'DELETE' });
    if (res.ok) {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
    } else {
      const data = await res.json().catch(() => null) as { error?: string } | null;
      toast.error(data?.error ?? 'Failed to delete account.');
      setDeleteLoading(false);
    }
  }

  const initials = (profile?.full_name ?? email)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl} alt={profile?.full_name ?? 'Avatar'} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <Button
                variant="outline"
                size="sm"
                disabled={avatarLoading}
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarLoading ? 'Uploading...' : 'Change avatar'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP · max 2 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <Separator />

          {/* Editable fields */}
          <form onSubmit={handleSubmit(onProfileSave)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" {...register('full_name')} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                {...register('bio')}
                rows={3}
                placeholder="Tell other students about yourself..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>
            <Button type="submit" disabled={profileLoading} size="sm">
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>

          <Separator />

          {/* Read-only fields */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{email}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Role</span>
              <Badge variant="secondary" className="capitalize">{profile?.role ?? 'student'}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Joined</span>
              <span>{formatDate(profile?.created_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Choose how Aorthar looks to you</p>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Academic Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <div>
              <p className="font-medium">Department</p>
              <p className="text-muted-foreground">{profile?.department ?? 'Not set'}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setNewDept(''); setDeptModalOpen(true); }}
            >
              Change Department
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {subscription ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{subscription.plans?.name ?? 'Premium'}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="default">Active</Badge>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Started</span>
                <span>{formatDate(subscription.start_date)}</span>
              </div>
              {subscription.end_date && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expires</span>
                    <span>{formatDate(subscription.end_date)}</span>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">You are on the free plan (Year 100–300).</p>
              <Button asChild size="sm">
                <a href="/pricing">Upgrade to Premium</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all academic data.</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => { setDeleteConfirm(''); setDeleteModalOpen(true); }}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Department Modal */}
      <Dialog open={deptModalOpen} onOpenChange={setDeptModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              <p className="font-semibold">Warning: This cannot be undone.</p>
              <p className="mt-1">Changing your department will reset all your course progress, grades, and GPA.</p>
            </div>
            <div className="space-y-1.5">
              <Label>New Department</Label>
              <Select value={newDept} onValueChange={setNewDept}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {AORTHAR_DEPARTMENTS.filter((d) => d !== profile?.department).map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeptModalOpen(false)} disabled={deptLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleChangeDepartment} disabled={!newDept || deptLoading}>
              {deptLoading ? 'Resetting...' : 'Yes, Reset & Change Department'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              This will permanently delete your account, all progress, grades, and GPA data. This action cannot be undone.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="delete-confirm">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== 'DELETE' || deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete My Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
