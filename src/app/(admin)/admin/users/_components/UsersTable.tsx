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

type StandalonePurchase = {
  course_id: string;
  purchased_at: string;
  course_title: string;
  progress_pct: number;
};

type User = {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  department: string | null;
  created_at: string;
  subscriptions: { status: string }[];
  standalone_purchases: StandalonePurchase[];
};

const ROLE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  admin: 'destructive',
  contributor: 'default',
  student: 'secondary',
};

interface Props {
  users: User[];
  module?: string;
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function UsersTable({ users, module = 'all' }: Props) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const isBootcamp = module === 'courses';

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Convert purchases to legacy format for AdminUserActions
  const toLegacyPurchases = (purchases: StandalonePurchase[]) =>
    purchases.map((p) => ({
      course_id: p.course_id,
      standalone_courses: { title: p.course_title },
    }));

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
        {!isBootcamp && (
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
        )}
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} of {users.length} {isBootcamp ? 'students' : 'users'}</p>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {!isBootcamp && <TableHead>Role</TableHead>}
                {!isBootcamp && <TableHead>Department</TableHead>}
                {!isBootcamp && <TableHead>Premium</TableHead>}
                {isBootcamp && <TableHead>Bootcamps</TableHead>}
                {isBootcamp && <TableHead>Progress</TableHead>}
                {!isBootcamp && <TableHead>Purchases</TableHead>}
                <TableHead>Joined</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => {
                const isPremium =
                  Array.isArray(user.subscriptions) &&
                  user.subscriptions.some((s) => s.status === 'active');

                const purchases = user.standalone_purchases;
                const visibleBootcamps = purchases.slice(0, 2);
                const extraCount = purchases.length - 2;

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{user.full_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{user.email ?? '—'}</p>
                    </TableCell>

                    {!isBootcamp && (
                      <TableCell>
                        <Badge variant={ROLE_VARIANT[user.role] ?? 'secondary'}>{user.role}</Badge>
                      </TableCell>
                    )}
                    {!isBootcamp && (
                      <TableCell className="text-sm">{user.department ?? '—'}</TableCell>
                    )}
                    {!isBootcamp && (
                      <TableCell>
                        {isPremium
                          ? <Badge variant="default">Premium</Badge>
                          : <span className="text-xs text-muted-foreground">Free</span>}
                      </TableCell>
                    )}

                    {isBootcamp && (
                      <TableCell>
                        {purchases.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {visibleBootcamps.map((p) => (
                              <Badge key={p.course_id} variant="outline" className="text-xs max-w-[120px] truncate">
                                {p.course_title}
                              </Badge>
                            ))}
                            {extraCount > 0 && (
                              <Badge variant="secondary" className="text-xs">+{extraCount}</Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    )}

                    {isBootcamp && (
                      <TableCell>
                        {purchases.length > 0 ? (
                          <div className="space-y-1.5">
                            {purchases.map((p) => (
                              <div key={p.course_id} className="space-y-0.5">
                                <p className="text-xs text-muted-foreground truncate max-w-[100px]">{p.course_title}</p>
                                <ProgressBar pct={p.progress_pct} />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    )}

                    {!isBootcamp && (
                      <TableCell>
                        {purchases.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {purchases.slice(0, 2).map((p) => (
                              <Badge key={p.course_id} variant="outline" className="text-xs max-w-[100px] truncate">
                                {p.course_title}
                              </Badge>
                            ))}
                            {purchases.length > 2 && (
                              <Badge variant="secondary" className="text-xs">+{purchases.length - 2}</Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    )}

                    <TableCell className="text-sm">{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <AdminUserActions
                        userId={user.user_id}
                        currentRole={user.role}
                        isPremium={isPremium}
                        purchases={toLegacyPurchases(purchases)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isBootcamp ? 5 : 7} className="text-center text-muted-foreground py-8">
                    No {isBootcamp ? 'bootcamp students' : 'users'} match your filters.
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
