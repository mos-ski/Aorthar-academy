'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import AdminUserActions from '@/components/admin/AdminUserActions';
import { formatDate } from '@/utils/formatters';
import { Search } from 'lucide-react';

type User = {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  department: string | null;
  created_at: string;
  subscriptions: { status: string }[];
};

const ROLE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  admin: 'destructive',
  contributor: 'default',
  student: 'secondary',
};

interface Props {
  users: User[];
}

export default function UsersTable({ users }: Props) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="contributor">Contributor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} of {users.length} users</p>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => {
                const isPremium =
                  Array.isArray(user.subscriptions) &&
                  user.subscriptions.some((s) => s.status === 'active');
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{user.full_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{user.email ?? '—'}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ROLE_VARIANT[user.role] ?? 'secondary'}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{user.department ?? '—'}</TableCell>
                    <TableCell>
                      {isPremium
                        ? <Badge variant="default">Premium</Badge>
                        : <span className="text-xs text-muted-foreground">Free</span>}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <AdminUserActions userId={user.user_id} currentRole={user.role} isPremium={isPremium} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No users match your filters.
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
