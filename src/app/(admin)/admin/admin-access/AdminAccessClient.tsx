'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/utils/formatters';

type AdminRow = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  admin_level: 'super_admin' | 'content_admin' | 'finance_admin' | null;
};

export default function AdminAccessClient({ admins }: { admins: AdminRow[] }) {
  const [invite, setInvite] = useState({
    full_name: '',
    email: '',
    admin_level: 'content_admin' as 'super_admin' | 'content_admin' | 'finance_admin',
  });
  const [grantEmail, setGrantEmail] = useState('');
  const [grantLevel, setGrantLevel] = useState<'super_admin' | 'content_admin' | 'finance_admin'>('content_admin');
  const [rowLevel, setRowLevel] = useState<Record<string, 'super_admin' | 'content_admin' | 'finance_admin'>>({});
  const [loading, setLoading] = useState<'invite' | 'grant' | null>(null);

  async function inviteAdmin(): Promise<void> {
    setLoading('invite');
    try {
      const res = await fetch('/api/admin/admin-access/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invite),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to invite admin');
        return;
      }
      toast.success('Admin invite sent');
      window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  async function grantAdminAccess(): Promise<void> {
    setLoading('grant');
    try {
      const res = await fetch('/api/admin/admin-access/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: grantEmail, admin_level: grantLevel }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to grant admin access');
        return;
      }
      toast.success('Admin access granted');
      window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  async function updateAdminLevel(userId: string): Promise<void> {
    const level = rowLevel[userId];
    if (!level) return;
    setLoading('grant');
    try {
      const res = await fetch(`/api/admin/admin-access/${userId}/level`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_level: level }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to update admin level');
        return;
      }
      toast.success('Admin level updated');
      window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Admin Access</h2>
        <p className="text-sm text-muted-foreground">Invite new admins or grant admin role to existing users.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invite New Admin</CardTitle>
            <CardDescription>Sends an auth invite email and creates an admin profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Full name"
              value={invite.full_name}
              onChange={(event) => setInvite((prev) => ({ ...prev, full_name: event.target.value }))}
            />
            <Input
              placeholder="Email"
              value={invite.email}
              onChange={(event) => setInvite((prev) => ({ ...prev, email: event.target.value }))}
            />
            <select
              className="h-9 rounded-md border bg-transparent px-3 text-sm"
              value={invite.admin_level}
              onChange={(event) =>
                setInvite((prev) => ({
                  ...prev,
                  admin_level: event.target.value as 'super_admin' | 'content_admin' | 'finance_admin',
                }))}
            >
              <option value="content_admin">content_admin</option>
              <option value="finance_admin">finance_admin</option>
              <option value="super_admin">super_admin</option>
            </select>
            <Button onClick={() => void inviteAdmin()} disabled={loading === 'invite'}>
              {loading === 'invite' ? 'Sending…' : 'Send Invite'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grant Existing User</CardTitle>
            <CardDescription>Promotes an existing account to admin by email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Existing user email"
              value={grantEmail}
              onChange={(event) => setGrantEmail(event.target.value)}
            />
            <select
              className="h-9 rounded-md border bg-transparent px-3 text-sm"
              value={grantLevel}
              onChange={(event) => setGrantLevel(event.target.value as 'super_admin' | 'content_admin' | 'finance_admin')}
            >
              <option value="content_admin">content_admin</option>
              <option value="finance_admin">finance_admin</option>
              <option value="super_admin">super_admin</option>
            </select>
            <Button variant="outline" onClick={() => void grantAdminAccess()} disabled={loading === 'grant'}>
              {loading === 'grant' ? 'Updating…' : 'Grant Admin Access'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Admins</CardTitle>
          <CardDescription>{admins.length} admin accounts</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Save</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.user_id}>
                  <TableCell>{admin.full_name ?? '—'}</TableCell>
                  <TableCell>{admin.email ?? '—'}</TableCell>
                  <TableCell><Badge>admin</Badge></TableCell>
                  <TableCell>
                    <select
                      className="h-9 rounded-md border bg-transparent px-3 text-sm"
                      value={rowLevel[admin.user_id] ?? admin.admin_level ?? 'super_admin'}
                      onChange={(event) =>
                        setRowLevel((prev) => ({
                          ...prev,
                          [admin.user_id]: event.target.value as 'super_admin' | 'content_admin' | 'finance_admin',
                        }))}
                    >
                      <option value="content_admin">content_admin</option>
                      <option value="finance_admin">finance_admin</option>
                      <option value="super_admin">super_admin</option>
                    </select>
                  </TableCell>
                  <TableCell>{formatDateTime(admin.created_at)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void updateAdminLevel(admin.user_id)}
                      disabled={loading !== null}
                    >
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {admins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No admins found.
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
