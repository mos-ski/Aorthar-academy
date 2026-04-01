'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AORTHAR_DEPARTMENTS } from '@/lib/academics/departments';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export type StudentRow = {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  role: string;
  department: string | null;
  created_at: string;
  is_suspended: boolean;
  suspended_at: string | null;
  is_premium: boolean;
  standalone_course_ids: string[];
};

export type UniversityCourseRow = {
  id: string;
  code: string;
  name: string;
  status: string;
  is_premium: boolean;
  pass_mark: number;
  sort_order: number;
  year_level: number;
  semester_number: number;
  semester_id: string;
};

export type ExternalCourseRow = {
  id: string;
  slug: string;
  title: string;
  price_ngn: number;
  status: string;
  created_at: string;
};

type UnifiedTransaction = {
  id: string;
  kind: 'subscription' | 'standalone';
  reference: string;
  amount_ngn: number;
  status: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  plan_type: string | null;
  course_title: string | null;
  course_slug: string | null;
  occurred_at: string;
};

type UnifiedKpi = {
  total_revenue_ngn: number;
  successful_count: number;
  subscription_revenue_ngn: number;
  standalone_revenue_ngn: number;
  failure_count: number;
};

type ImportApiResponse = {
  summary: {
    total: number;
    invited: number;
    skipped_existing: number;
    invalid: number;
    failed: number;
  };
  results: Array<{
    index: number;
    email: string;
    status: 'invited' | 'skipped_existing' | 'invalid' | 'failed';
    reason?: string;
  }>;
};

export default function OpsHubClient({
  initialStudents,
  universityCourses,
  externalCourses,
  initialTab,
  initialCourseTab,
}: {
  initialStudents: StudentRow[];
  universityCourses: UniversityCourseRow[];
  externalCourses: ExternalCourseRow[];
  initialTab: string;
  initialCourseTab: string;
}) {
  const [students, setStudents] = useState<StudentRow[]>(initialStudents);
  const [studentSearch, setStudentSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [premiumFilter, setPremiumFilter] = useState('all');
  const [suspendedFilter, setSuspendedFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [selectedStandaloneByUser, setSelectedStandaloneByUser] = useState<Record<string, string>>({});

  const [inviteForm, setInviteForm] = useState({
    full_name: '',
    email: '',
    department: '',
    role: 'student',
    grant_premium: false,
    standalone_course_slugs: '',
  });
  const [inviting, setInviting] = useState(false);

  const [bulkRows, setBulkRows] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportApiResponse | null>(null);

  const [courseSearch, setCourseSearch] = useState('');
  const [newExternal, setNewExternal] = useState({
    title: '',
    slug: '',
    price_ngn: '',
  });
  const [creatingExternal, setCreatingExternal] = useState(false);

  const [txns, setTxns] = useState<UnifiedTransaction[]>([]);
  const [kpi, setKpi] = useState<UnifiedKpi | null>(null);
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnFilters, setTxnFilters] = useState({
    revenue_type: 'all',
    status: 'all',
    search: '',
    start_date: '',
    end_date: '',
  });

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const haystack = `${student.full_name} ${student.email ?? ''}`.toLowerCase();
      if (studentSearch && !haystack.includes(studentSearch.toLowerCase())) return false;
      if (roleFilter !== 'all' && student.role !== roleFilter) return false;
      if (premiumFilter === 'premium' && !student.is_premium) return false;
      if (premiumFilter === 'free' && student.is_premium) return false;
      if (suspendedFilter === 'suspended' && !student.is_suspended) return false;
      if (suspendedFilter === 'active' && student.is_suspended) return false;
      if (departmentFilter !== 'all' && student.department !== departmentFilter) return false;
      return true;
    });
  }, [students, studentSearch, roleFilter, premiumFilter, suspendedFilter, departmentFilter]);

  const filteredUniversityCourses = useMemo(() => {
    return universityCourses.filter((course) => {
      const haystack = `${course.code} ${course.name}`.toLowerCase();
      return !courseSearch || haystack.includes(courseSearch.toLowerCase());
    });
  }, [universityCourses, courseSearch]);

  const filteredExternalCourses = useMemo(() => {
    return externalCourses.filter((course) => {
      const haystack = `${course.slug} ${course.title}`.toLowerCase();
      return !courseSearch || haystack.includes(courseSearch.toLowerCase());
    });
  }, [externalCourses, courseSearch]);

  async function updateUser(userId: string, body: Record<string, unknown>, onDone?: () => void): Promise<void> {
    setUpdatingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to update user');
        return;
      }
      setStudents((prev) => prev.map((student) => (
        student.user_id === userId
          ? {
              ...student,
              full_name: (body.full_name as string | undefined) ?? student.full_name,
              role: (body.role as string | undefined) ?? student.role,
              department: (body.department as string | undefined) ?? student.department,
            }
          : student
      )));
      onDone?.();
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function togglePremium(user: StudentRow): Promise<void> {
    setUpdatingUserId(user.user_id);
    try {
      const res = await fetch(`/api/admin/users/${user.user_id}/premium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: user.is_premium ? 'revoke' : 'grant' }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to update premium');
        return;
      }
      setStudents((prev) => prev.map((student) => (
        student.user_id === user.user_id
          ? { ...student, is_premium: !user.is_premium }
          : student
      )));
      toast.success(user.is_premium ? 'Premium revoked' : 'Premium granted');
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function toggleSuspension(user: StudentRow): Promise<void> {
    setUpdatingUserId(user.user_id);
    try {
      const action = user.is_suspended ? 'unsuspend' : 'suspend';
      const res = await fetch(`/api/admin/students/${user.user_id}/suspension`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to update suspension');
        return;
      }
      setStudents((prev) => prev.map((student) => (
        student.user_id === user.user_id
          ? {
              ...student,
              is_suspended: !user.is_suspended,
              suspended_at: user.is_suspended ? null : new Date().toISOString(),
            }
          : student
      )));
      toast.success(user.is_suspended ? 'Student unsuspended' : 'Student suspended');
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function mutateStandaloneAccess(user: StudentRow, action: 'grant' | 'revoke'): Promise<void> {
    const courseId = selectedStandaloneByUser[user.user_id];
    if (!courseId) {
      toast.error('Choose a standalone course first');
      return;
    }

    setUpdatingUserId(user.user_id);
    try {
      const res = await fetch(`/api/admin/students/${user.user_id}/standalone-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, courseId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to update standalone access');
        return;
      }
      setStudents((prev) => prev.map((student) => {
        if (student.user_id !== user.user_id) return student;
        const next = new Set(student.standalone_course_ids);
        if (action === 'grant') next.add(courseId);
        if (action === 'revoke') next.delete(courseId);
        return { ...student, standalone_course_ids: Array.from(next) };
      }));
      toast.success(action === 'grant' ? 'Standalone access granted' : 'Standalone access revoked');
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function submitInvite(): Promise<void> {
    setInviting(true);
    try {
      const res = await fetch('/api/admin/students/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...inviteForm,
          standalone_course_slugs: inviteForm.standalone_course_slugs
            .split('|')
            .map((slug) => slug.trim())
            .filter(Boolean),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to invite student');
        return;
      }
      toast.success(
        json.status === 'skipped_existing'
          ? `Skipped existing user (${json.reason ?? 'already exists'})`
          : 'Invite sent successfully',
      );
      setInviteForm({
        full_name: '',
        email: '',
        department: '',
        role: 'student',
        grant_premium: false,
        standalone_course_slugs: '',
      });
    } finally {
      setInviting(false);
    }
  }

  async function submitImport(): Promise<void> {
    if (!bulkRows.trim()) {
      toast.error('Paste CSV rows first');
      return;
    }

    setImporting(true);
    try {
      const res = await fetch('/api/admin/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: bulkRows }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Import failed');
        return;
      }
      setImportResult(json as ImportApiResponse);
      toast.success('Import completed');
    } finally {
      setImporting(false);
    }
  }

  async function handleCsvFile(file: File): Promise<void> {
    const text = await file.text();
    setBulkRows(text);
  }

  async function createExternalCourse(): Promise<void> {
    setCreatingExternal(true);
    try {
      const res = await fetch('/api/admin/standalone-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newExternal.title,
          slug: newExternal.slug,
          price_ngn: Number(newExternal.price_ngn),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to create external course');
        return;
      }
      toast.success('External course created');
      window.location.href = `/admin/standalone-courses/${json.id}`;
    } finally {
      setCreatingExternal(false);
    }
  }

  async function loadTransactions(): Promise<void> {
    setTxnLoading(true);
    try {
      const params = new URLSearchParams();
      if (txnFilters.revenue_type !== 'all') params.set('revenue_type', txnFilters.revenue_type);
      if (txnFilters.status !== 'all') params.set('status', txnFilters.status);
      if (txnFilters.search) params.set('search', txnFilters.search);
      if (txnFilters.start_date) params.set('start_date', txnFilters.start_date);
      if (txnFilters.end_date) params.set('end_date', txnFilters.end_date);

      const res = await fetch(`/api/admin/transactions/unified?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to load transactions');
        return;
      }
      setTxns(json.data as UnifiedTransaction[]);
      setKpi(json.kpi as UnifiedKpi);
    } finally {
      setTxnLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Ops Hub</h2>
        <p className="text-sm text-muted-foreground">
          Unified operations for students, courses, and revenue.
        </p>
      </div>

      <Tabs defaultValue={['students', 'courses', 'transactions'].includes(initialTab) ? initialTab : 'students'} className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="transactions" onClick={() => { if (!kpi) void loadTransactions(); }}>
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Single Invite</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Full name"
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, full_name: e.target.value }))}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                />
                <Select
                  value={inviteForm.department || 'none'}
                  onValueChange={(value) => setInviteForm((prev) => ({ ...prev, department: value === 'none' ? '' : value }))}
                >
                  <SelectTrigger><SelectValue placeholder="Department (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No department</SelectItem>
                    {AORTHAR_DEPARTMENTS.map((department) => (
                      <SelectItem key={department} value={department}>{department}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={inviteForm.role}
                  onValueChange={(value) => setInviteForm((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="contributor">Contributor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Standalone slugs (optional, separated by |)"
                  value={inviteForm.standalone_course_slugs}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, standalone_course_slugs: e.target.value }))}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={inviteForm.grant_premium}
                    onChange={(e) => setInviteForm((prev) => ({ ...prev, grant_premium: e.target.checked }))}
                  />
                  Grant premium on invite
                </label>
                <Button onClick={() => void submitInvite()} disabled={inviting}>
                  {inviting ? 'Inviting…' : 'Send Invite'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bulk Import (CSV upload or paste)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  Required header: `email,full_name,department,role,grant_premium,standalone_course_slugs`
                </div>
                <Input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleCsvFile(file);
                  }}
                />
                <Textarea
                  rows={8}
                  placeholder="Paste CSV rows here"
                  value={bulkRows}
                  onChange={(e) => setBulkRows(e.target.value)}
                />
                <Button onClick={() => void submitImport()} disabled={importing}>
                  {importing ? 'Importing…' : 'Run Import'}
                </Button>

                {importResult && (
                  <div className="rounded-md border p-3 text-xs space-y-2">
                    <p>
                      Total: {importResult.summary.total} · Invited: {importResult.summary.invited} · Skipped:{' '}
                      {importResult.summary.skipped_existing} · Invalid: {importResult.summary.invalid} · Failed:{' '}
                      {importResult.summary.failed}
                    </p>
                    <div className="max-h-40 overflow-auto">
                      {importResult.results.map((result) => (
                        <p key={`${result.index}-${result.email}`}>
                          Row {result.index}: {result.email || 'N/A'} → {result.status}
                          {result.reason ? ` (${result.reason})` : ''}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Student Manager</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 md:grid-cols-5">
                <Input
                  placeholder="Search name/email"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="contributor">Contributor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={premiumFilter} onValueChange={setPremiumFilter}>
                  <SelectTrigger><SelectValue placeholder="Premium" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All plans</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={suspendedFilter} onValueChange={setSuspendedFilter}>
                  <SelectTrigger><SelectValue placeholder="Suspension" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All departments</SelectItem>
                    {AORTHAR_DEPARTMENTS.map((department) => (
                      <SelectItem key={department} value={department}>{department}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>Standalone</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.user_id}>
                      <TableCell>
                        <p className="font-medium text-sm">{student.full_name}</p>
                        <p className="text-xs text-muted-foreground">{student.email ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">Joined {formatDate(student.created_at)}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            defaultValue={student.role}
                            onValueChange={(value) => {
                              if (value !== student.role) {
                                void updateUser(student.user_id, { role: value }, () => toast.success('Role updated'));
                              }
                            }}
                          >
                            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="contributor">Contributor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={student.department ?? 'none'}
                          onValueChange={(value) => {
                            const department = value === 'none' ? null : value;
                            void updateUser(
                              student.user_id,
                              { department },
                              () => toast.success('Department updated'),
                            );
                          }}
                        >
                          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No department</SelectItem>
                            {AORTHAR_DEPARTMENTS.map((department) => (
                              <SelectItem key={department} value={department}>{department}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={student.is_premium ? 'default' : 'secondary'}>
                            {student.is_premium ? 'Premium' : 'Free'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updatingUserId === student.user_id}
                            onClick={() => void togglePremium(student)}
                          >
                            {student.is_premium ? 'Revoke' : 'Grant'}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={student.is_suspended ? 'destructive' : 'secondary'}>
                            {student.is_suspended ? 'Suspended' : 'Active'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updatingUserId === student.user_id}
                            onClick={() => void toggleSuspension(student)}
                          >
                            {student.is_suspended ? 'Unsuspend' : 'Suspend'}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="space-y-2">
                        <Select
                          value={selectedStandaloneByUser[student.user_id] ?? ''}
                          onValueChange={(value) => {
                            setSelectedStandaloneByUser((prev) => ({ ...prev, [student.user_id]: value }));
                          }}
                        >
                          <SelectTrigger className="w-56">
                            <SelectValue placeholder="Select external course" />
                          </SelectTrigger>
                          <SelectContent>
                            {externalCourses.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updatingUserId === student.user_id}
                            onClick={() => void mutateStandaloneAccess(student, 'grant')}
                          >
                            Grant
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updatingUserId === student.user_id}
                            onClick={() => void mutateStandaloneAccess(student, 'revoke')}
                          >
                            Revoke
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {student.standalone_course_ids.length} external course access
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Course Manager</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search course code/title/slug"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
              />

              <Tabs defaultValue={initialCourseTab === 'external' ? 'external' : 'university'}>
                <TabsList>
                  <TabsTrigger value="university">University</TabsTrigger>
                  <TabsTrigger value="external">External</TabsTrigger>
                </TabsList>

                <TabsContent value="university" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Year/Sem</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Manage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUniversityCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-mono">{course.code}</TableCell>
                          <TableCell>{course.name}</TableCell>
                          <TableCell>Y{course.year_level} / S{course.semester_number}</TableCell>
                          <TableCell>
                            <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                              {course.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{course.is_premium ? 'Premium' : 'Free'}</TableCell>
                          <TableCell>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/admin/courses/${course.id}`}>Edit</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="external" className="mt-4 space-y-4">
                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="md:col-span-2">
                      <Label>Title</Label>
                      <Input
                        value={newExternal.title}
                        onChange={(e) => setNewExternal((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Product Design Bootcamp"
                      />
                    </div>
                    <div>
                      <Label>Slug</Label>
                      <Input
                        value={newExternal.slug}
                        onChange={(e) => setNewExternal((prev) => ({ ...prev, slug: e.target.value }))}
                        placeholder="product-design-bootcamp"
                      />
                    </div>
                    <div>
                      <Label>Price (NGN)</Label>
                      <Input
                        type="number"
                        value={newExternal.price_ngn}
                        onChange={(e) => setNewExternal((prev) => ({ ...prev, price_ngn: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button onClick={() => void createExternalCourse()} disabled={creatingExternal}>
                    {creatingExternal ? 'Creating…' : 'Create External Course'}
                  </Button>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Manage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExternalCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>{course.title}</TableCell>
                          <TableCell className="font-mono text-xs">{course.slug}</TableCell>
                          <TableCell>{formatCurrency(course.price_ngn)}</TableCell>
                          <TableCell>
                            <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                              {course.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/admin/standalone-courses/${course.id}`}>Edit</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Unified Revenue Center</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 md:grid-cols-5">
                <Input
                  placeholder="Search name/email/reference"
                  value={txnFilters.search}
                  onChange={(e) => setTxnFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
                <Select
                  value={txnFilters.revenue_type}
                  onValueChange={(value) => setTxnFilters((prev) => ({ ...prev, revenue_type: value }))}
                >
                  <SelectTrigger><SelectValue placeholder="Revenue type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All streams</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="standalone">Standalone</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={txnFilters.status}
                  onValueChange={(value) => setTxnFilters((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={txnFilters.start_date}
                  onChange={(e) => setTxnFilters((prev) => ({ ...prev, start_date: e.target.value }))}
                />
                <Input
                  type="date"
                  value={txnFilters.end_date}
                  onChange={(e) => setTxnFilters((prev) => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
              <Button onClick={() => void loadTransactions()} disabled={txnLoading}>
                {txnLoading ? 'Loading…' : 'Apply Filters'}
              </Button>
            </CardContent>
          </Card>

          {kpi && (
            <div className="grid gap-4 md:grid-cols-5">
              <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Total Revenue</p><p className="text-xl font-semibold">{formatCurrency(kpi.total_revenue_ngn)}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Successful Purchases</p><p className="text-xl font-semibold">{kpi.successful_count}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Subscription Revenue</p><p className="text-xl font-semibold">{formatCurrency(kpi.subscription_revenue_ngn)}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Standalone Revenue</p><p className="text-xl font-semibold">{formatCurrency(kpi.standalone_revenue_ngn)}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Failures</p><p className="text-xl font-semibold">{kpi.failure_count}</p></CardContent></Card>
            </div>
          )}

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference / Details</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txns.map((row) => (
                    <TableRow key={`${row.kind}-${row.id}`}>
                      <TableCell className="capitalize">{row.kind}</TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{row.user_name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{row.user_email ?? '—'}</p>
                      </TableCell>
                      <TableCell>{formatCurrency(row.amount_ngn)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.status === 'success'
                              ? 'default'
                              : row.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-mono text-xs">{row.reference}</p>
                        {row.kind === 'subscription' ? (
                          <p className="text-xs text-muted-foreground">Plan: {row.plan_type ?? '—'}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Course: {row.course_title ?? '—'} ({row.course_slug ?? '—'})
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDateTime(row.occurred_at)}</TableCell>
                    </TableRow>
                  ))}
                  {!txnLoading && txns.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                        No transactions found for current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
