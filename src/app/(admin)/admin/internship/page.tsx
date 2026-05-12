'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, CheckCircle, XCircle, ClipboardList, Settings, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Cohort = {
  id: string;
  name: string;
  status: string;
  price_ngn: number;
  created_at: string;
};

type Attempt = {
  score_percent: number | null;
  passed: boolean | null;
  correct_count: number | null;
  total_questions: number | null;
  completed_at: string | null;
};

type Application = {
  id: string;
  full_name: string | null;
  email: string | null;
  track: string | null;
  payment_status: string;
  app_status: string;
  amount_paid_ngn: number | null;
  paid_at: string | null;
  form_submitted_at: string | null;
  created_at: string;
  internship_exam_attempts: Attempt[];
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatNgn(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export default function AdminInternshipPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingCohorts, setLoadingCohorts] = useState(true);

  // Cohort edit state
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [editForm, setEditForm] = useState({ name: '', price_ngn: '', status: '' });
  const [savingCohort, setSavingCohort] = useState(false);

  // New cohort dialog
  const [newCohortOpen, setNewCohortOpen] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', price_ngn: '10000', status: 'open' });
  const [creatingCohort, setCreatingCohort] = useState(false);

  const fetchCohorts = useCallback(async () => {
    setLoadingCohorts(true);
    try {
      const res = await fetch('/api/admin/internship/cohort');
      const data = await res.json();
      setCohorts(data.data ?? []);
    } catch {
      toast.error('Failed to load cohorts');
    } finally {
      setLoadingCohorts(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const res = await fetch('/api/admin/internship/applicants');
      const data = await res.json();
      setApplications(data.data ?? []);
    } catch {
      toast.error('Failed to load applicants');
    } finally {
      setLoadingApps(false);
    }
  }, []);

  useEffect(() => {
    fetchCohorts();
    fetchApplications();
  }, [fetchCohorts, fetchApplications]);

  function openEditCohort(cohort: Cohort) {
    setEditingCohort(cohort);
    setEditForm({ name: cohort.name, price_ngn: String(cohort.price_ngn), status: cohort.status });
  }

  async function saveCohort() {
    if (!editingCohort) return;
    const price = parseInt(editForm.price_ngn);
    if (!editForm.name.trim() || isNaN(price) || price < 1) {
      toast.error('Enter a valid name and price');
      return;
    }
    setSavingCohort(true);
    try {
      const res = await fetch('/api/admin/internship/cohort', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingCohort.id, name: editForm.name, price_ngn: price, status: editForm.status }),
      });
      if (res.ok) {
        toast.success('Cohort updated');
        setEditingCohort(null);
        await fetchCohorts();
      } else {
        const d = await res.json();
        toast.error(d.error ?? 'Failed to update');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSavingCohort(false);
    }
  }

  async function createCohort() {
    const price = parseInt(newForm.price_ngn);
    if (!newForm.name.trim() || isNaN(price) || price < 1) {
      toast.error('Enter a valid name and price');
      return;
    }
    setCreatingCohort(true);
    try {
      const res = await fetch('/api/admin/internship/cohort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newForm.name, price_ngn: price, status: newForm.status }),
      });
      if (res.ok) {
        toast.success('Cohort created');
        setNewCohortOpen(false);
        setNewForm({ name: '', price_ngn: '10000', status: 'open' });
        await fetchCohorts();
      } else {
        const d = await res.json();
        toast.error(d.error ?? 'Failed to create');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setCreatingCohort(false);
    }
  }

  const totalSubmitted = applications.filter((a) => a.form_submitted_at).length;
  const totalExamDone = applications.filter((a) => a.internship_exam_attempts?.[0]?.completed_at).length;
  const totalPassed = applications.filter((a) => a.internship_exam_attempts?.[0]?.passed === true).length;
  const totalFailed = applications.filter((a) => a.internship_exam_attempts?.[0]?.passed === false).length;

  const activeCohort = cohorts.find((c) => c.status === 'open');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Internship</h1>
          <p className="text-muted-foreground text-sm mt-1">Applicants, exam results, and cohort settings</p>
        </div>
        <Link
          href="/admin/internship/questions"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-muted"
        >
          <ClipboardList className="h-4 w-4" />
          Exam Questions
        </Link>
      </div>

      {/* Cohort Settings */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              Cohort Settings
            </CardTitle>
            <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => setNewCohortOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              New Cohort
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingCohorts ? (
            <p className="text-sm text-muted-foreground">Loading cohorts…</p>
          ) : cohorts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cohorts yet.</p>
          ) : (
            <div className="space-y-2">
              {cohorts.map((cohort) => (
                <div
                  key={cohort.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">{cohort.name}</p>
                      <p className="text-xs text-muted-foreground">Application fee: <span className="font-semibold text-foreground">{formatNgn(cohort.price_ngn)}</span></p>
                    </div>
                    <Badge
                      className={
                        cohort.status === 'open'
                          ? 'bg-green-500/15 text-green-600 border-green-500/20 hover:bg-green-500/15'
                          : cohort.status === 'closed'
                          ? 'bg-yellow-500/15 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/15'
                          : 'bg-muted text-muted-foreground hover:bg-muted'
                      }
                    >
                      {cohort.status}
                    </Badge>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => openEditCohort(cohort)}>
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          )}
          {activeCohort && (
            <p className="text-xs text-muted-foreground mt-3">
              Applicants paying now will be charged <strong className="text-foreground">{formatNgn(activeCohort.price_ngn)}</strong> (active cohort: {activeCohort.name}).
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Form Submitted', value: totalSubmitted, Icon: Users, color: 'text-blue-500' },
          { label: 'Exam Completed', value: totalExamDone, Icon: ClipboardList, color: 'text-yellow-500' },
          { label: 'Passed (≥70%)', value: totalPassed, Icon: CheckCircle, color: 'text-green-500' },
          { label: 'Failed (<70%)', value: totalFailed, Icon: XCircle, color: 'text-red-500' },
        ].map(({ label, value, Icon, color }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applicants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applicants</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingApps ? (
            <div className="text-center py-16 text-muted-foreground text-sm">Loading applicants…</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No paid applications yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Track</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Applied</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => {
                    const attempt = app.internship_exam_attempts?.[0];
                    const score = attempt?.score_percent;
                    const passed = attempt?.passed;
                    const examDone = Boolean(attempt?.completed_at);

                    return (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium max-w-[140px] truncate">
                          {app.full_name ?? '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[170px] truncate">
                          {app.email ?? '—'}
                        </TableCell>
                        <TableCell>
                          {app.track ? (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(167,210,82,0.1)', color: '#5a7a1a', border: '1px solid rgba(167,210,82,0.25)' }}>
                              {app.track}
                            </span>
                          ) : '—'}
                        </TableCell>
                        <TableCell>
                          {app.form_submitted_at ? (
                            <Badge variant="secondary">Submitted</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {examDone && score !== null && score !== undefined
                            ? <span className="font-semibold">{Math.round(score)}%</span>
                            : <span className="text-muted-foreground text-sm">{app.form_submitted_at ? 'Not taken' : '—'}</span>
                          }
                        </TableCell>
                        <TableCell>
                          {examDone ? (
                            passed
                              ? <Badge className="bg-green-500/15 text-green-600 border-green-500/20 hover:bg-green-500/15">Passed</Badge>
                              : <Badge className="bg-red-500/15 text-red-600 border-red-500/20 hover:bg-red-500/15">Failed</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(app.created_at)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Cohort Dialog */}
      <Dialog open={!!editingCohort} onOpenChange={(open) => !open && setEditingCohort(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Cohort</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Cohort Name</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Q2 2026" />
            </div>
            <div className="space-y-1.5">
              <Label>Application Fee (₦)</Label>
              <Input
                type="number"
                value={editForm.price_ngn}
                onChange={(e) => setEditForm((f) => ({ ...f, price_ngn: e.target.value }))}
                placeholder="10000"
                min={1}
              />
              <p className="text-xs text-muted-foreground">This is what applicants pay to unlock the application form.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm"
              >
                <option value="open">Open — accepting applications</option>
                <option value="closed">Closed — no new applications</option>
                <option value="completed">Completed — cohort finished</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditingCohort(null)}>Cancel</Button>
              <Button onClick={saveCohort} disabled={savingCohort}>
                {savingCohort ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Cohort Dialog */}
      <Dialog open={newCohortOpen} onOpenChange={setNewCohortOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Cohort</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Cohort Name</Label>
              <Input value={newForm.name} onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Q3 2026" />
            </div>
            <div className="space-y-1.5">
              <Label>Application Fee (₦)</Label>
              <Input
                type="number"
                value={newForm.price_ngn}
                onChange={(e) => setNewForm((f) => ({ ...f, price_ngn: e.target.value }))}
                min={1}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <select
                value={newForm.status}
                onChange={(e) => setNewForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setNewCohortOpen(false)}>Cancel</Button>
              <Button onClick={createCohort} disabled={creatingCohort}>
                {creatingCohort ? 'Creating…' : 'Create Cohort'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
