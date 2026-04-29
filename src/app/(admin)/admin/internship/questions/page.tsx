'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type Question = {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

const emptyForm = {
  question_text: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_option: 'a',
  sort_order: 0,
  is_active: true,
};

export default function InternshipQuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/internship/questions');
      const data = await res.json();
      setQuestions(data.data ?? []);
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  function openAdd() {
    setEditing(null);
    setForm({ ...emptyForm, sort_order: questions.length });
    setDialogOpen(true);
  }

  function openEdit(q: Question) {
    setEditing(q);
    setForm({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      sort_order: q.sort_order,
      is_active: q.is_active,
    });
    setDialogOpen(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.question_text.trim() || !form.option_a.trim() || !form.option_b.trim() || !form.option_c.trim() || !form.option_d.trim()) {
      toast.error('All fields are required');
      return;
    }

    setSaving(true);
    try {
      const url = editing
        ? `/api/admin/internship/questions/${editing.id}`
        : '/api/admin/internship/questions';
      const method = editing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(editing ? 'Question updated' : 'Question created');
        setDialogOpen(false);
        await fetchQuestions();
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error ?? 'Failed to save question');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this question? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/internship/questions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Question deleted');
        await fetchQuestions();
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error ?? 'Failed to delete');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeleting(null);
    }
  }

  const activeCount = questions.filter((q) => q.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/internship" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Applicants
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Exam Questions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activeCount} active question{activeCount !== 1 ? 's' : ''} · {questions.length} total
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-500" />
              Total Questions
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{questions.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{activeCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Inactive</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-muted-foreground">{questions.length - activeCount}</p></CardContent>
        </Card>
      </div>

      {/* Questions Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-16 text-muted-foreground text-sm">Loading questions…</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ClipboardList className="h-10 w-10 mx-auto opacity-30" />
              <p className="text-sm text-muted-foreground">No questions yet. Add your first question.</p>
              <Button onClick={openAdd} variant="outline" size="sm">Add Question</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead>Correct</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((q, i) => (
                    <TableRow key={q.id}>
                      <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                      <TableCell className="max-w-[280px]">
                        <p className="text-sm leading-5 line-clamp-2">{q.question_text}</p>
                      </TableCell>
                      <TableCell className="max-w-[220px]">
                        <div className="space-y-0.5 text-xs text-muted-foreground">
                          <p><span className="font-medium text-foreground">A.</span> {q.option_a.slice(0, 40)}{q.option_a.length > 40 ? '…' : ''}</p>
                          <p><span className="font-medium text-foreground">B.</span> {q.option_b.slice(0, 40)}{q.option_b.length > 40 ? '…' : ''}</p>
                          <p><span className="font-medium text-foreground">C.</span> {q.option_c.slice(0, 40)}{q.option_c.length > 40 ? '…' : ''}</p>
                          <p><span className="font-medium text-foreground">D.</span> {q.option_d.slice(0, 40)}{q.option_d.length > 40 ? '…' : ''}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="w-7 h-7 rounded-full bg-green-500/15 text-green-600 font-bold text-sm flex items-center justify-center border border-green-500/20">
                          {q.correct_option.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {q.is_active
                          ? <Badge className="bg-green-500/15 text-green-600 border-green-500/20 hover:bg-green-500/15">Active</Badge>
                          : <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(q)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(q.id)}
                            disabled={deleting === q.id}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Question' : 'Add Question'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="question_text">Question *</Label>
              <Textarea
                id="question_text"
                name="question_text"
                value={form.question_text}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Enter the question…"
              />
            </div>

            {(['a', 'b', 'c', 'd'] as const).map((opt) => (
              <div key={opt} className="space-y-1.5">
                <Label htmlFor={`option_${opt}`}>Option {opt.toUpperCase()} *</Label>
                <Input
                  id={`option_${opt}`}
                  name={`option_${opt}`}
                  value={form[`option_${opt}`]}
                  onChange={handleChange}
                  required
                  placeholder={`Option ${opt.toUpperCase()}…`}
                />
              </div>
            ))}

            <div className="space-y-2">
              <Label>Correct Answer *</Label>
              <div className="flex gap-3">
                {(['a', 'b', 'c', 'd'] as const).map((opt) => (
                  <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="correct_option"
                      value={opt}
                      checked={form.correct_option === opt}
                      onChange={handleChange}
                      className="accent-green-600"
                    />
                    <span className="text-sm font-medium">{opt.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  name="sort_order"
                  type="number"
                  value={form.sort_order}
                  onChange={handleChange}
                  min={0}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="accent-green-600 h-4 w-4"
                  />
                  <span className="text-sm">Active (shown in exams)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update Question' : 'Add Question'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
