'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

type SuggestionType = 'course' | 'lesson' | 'resource';

export default function SuggestionForm() {
  const [type, setType] = useState<SuggestionType>('course');
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...form }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(typeof data.error === 'string' ? data.error : 'Submission failed');
      return;
    }

    toast.success('Suggestion submitted! Our team will review it.');
    setForm({});
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label>Suggestion Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as SuggestionType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="course">New Course</SelectItem>
            <SelectItem value="lesson">New Lesson</SelectItem>
            <SelectItem value="resource">New Resource</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === 'course' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Course Code</Label>
              <Input placeholder="DES101" value={form.course_code ?? ''} onChange={(e) => update('course_code', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Credits</Label>
              <Input type="number" min={1} max={6} placeholder="3" value={form.credit_units ?? ''} onChange={(e) => update('credit_units', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Course Name</Label>
            <Input placeholder="Introduction to UX Design" value={form.course_name ?? ''} onChange={(e) => update('course_name', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Year Level</Label>
              <Select onValueChange={(v) => update('year_level', v)}>
                <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">Year 100</SelectItem>
                  <SelectItem value="200">Year 200</SelectItem>
                  <SelectItem value="300">Year 300</SelectItem>
                  <SelectItem value="400">Year 400</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select onValueChange={(v) => update('semester', v)}>
                <SelectTrigger><SelectValue placeholder="Semester" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input placeholder="What will students learn?" value={form.description ?? ''} onChange={(e) => update('description', e.target.value)} />
          </div>
        </>
      )}

      {type === 'lesson' && (
        <>
          <div className="space-y-2">
            <Label>Lesson Title</Label>
            <Input placeholder="Lesson title" value={form.lesson_title ?? ''} onChange={(e) => update('lesson_title', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Course ID</Label>
            <Input placeholder="Course UUID" value={form.course_id ?? ''} onChange={(e) => update('course_id', e.target.value)} />
          </div>
        </>
      )}

      {type === 'resource' && (
        <>
          <div className="space-y-2">
            <Label>Resource Title</Label>
            <Input placeholder="Resource title" value={form.resource_title ?? ''} onChange={(e) => update('resource_title', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Resource Type</Label>
            <Select onValueChange={(v) => update('resource_type', v)}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="link">Link</SelectItem>
                <SelectItem value="document">Document</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input placeholder="https://..." value={form.resource_url ?? ''} onChange={(e) => update('resource_url', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Lesson ID</Label>
            <Input placeholder="Lesson UUID" value={form.lesson_id ?? ''} onChange={(e) => update('lesson_id', e.target.value)} />
          </div>
        </>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Submitting...' : 'Submit Suggestion'}
      </Button>
    </form>
  );
}
