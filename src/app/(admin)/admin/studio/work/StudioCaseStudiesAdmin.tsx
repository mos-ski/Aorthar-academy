'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Archive, ExternalLink, Plus, Search, Trash2 } from 'lucide-react';
import type { FormEvent, ReactElement } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { StudioCaseStudyAdminSummary, StudioCaseStudyStatus } from '@/lib/studio/case-study-schema';

type StudioCaseStudiesAdminProps = {
  studies: StudioCaseStudyAdminSummary[];
};

type StatusFilter = 'all' | StudioCaseStudyStatus;

type ApiResponse = {
  archived?: boolean;
  error?: string;
};

const statusVariants: Record<StudioCaseStudyStatus, 'default' | 'secondary' | 'outline'> = {
  draft: 'secondary',
  published: 'default',
  archived: 'outline',
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function StudioCaseStudiesAdmin({ studies }: StudioCaseStudiesAdminProps): ReactElement {
  const router = useRouter();
  const [creating, setCreating] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSlug, setNewSlug] = useState<string>('');
  const [slugEdited, setSlugEdited] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const filteredStudies = useMemo((): StudioCaseStudyAdminSummary[] => {
    const normalizedQuery = query.trim().toLowerCase();

    return studies.filter((study) => {
      const matchesStatus = status === 'all' || study.status === status;
      const matchesQuery = !normalizedQuery || [
        study.title,
        study.slug,
        study.client ?? '',
        ...study.tags,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));

      return matchesStatus && matchesQuery;
    });
  }, [query, status, studies]);

  const counts: Record<StatusFilter, number> = {
    all: studies.length,
    draft: studies.filter((study) => study.status === 'draft').length,
    published: studies.filter((study) => study.status === 'published').length,
    archived: studies.filter((study) => study.status === 'archived').length,
  };

  function openCreate(): void {
    setNewTitle('');
    setNewSlug('');
    setSlugEdited(false);
    setCreating(true);
  }

  function closeCreate(): void {
    setCreating(false);
    setNewTitle('');
    setNewSlug('');
    setSlugEdited(false);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/studio/case-studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, slug: newSlug }),
      });
      const data = await res.json().catch((): ApiResponse | null => null) as ApiResponse | null;

      if (!res.ok) {
        toast.error(data?.error ?? 'Failed to create case study');
        return;
      }

      toast.success('Case study created');
      closeCreate();
      router.refresh();
    } catch {
      toast.error('Failed to create case study');
    } finally {
      setSubmitting(false);
    }
  }

  async function archiveStudy(id: string): Promise<void> {
    try {
      const res = await fetch(`/api/admin/studio/case-studies/${id}`, { method: 'DELETE' });
      const data = await res.json().catch((): ApiResponse | null => null) as ApiResponse | null;
      if (!res.ok) {
        toast.error(data?.error ?? 'Failed to archive case study');
        return;
      }
      toast.success(data?.archived ? 'Case study archived' : 'Case study deleted');
      router.refresh();
    } catch {
      toast.error('Failed to archive case study');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Studio Work</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage case studies for studio.aorthar.com.</p>
        </div>
        <Button type="button" onClick={openCreate} className="w-full sm:w-auto">
          <Plus />
          New case study
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total', value: counts.all },
          { label: 'Draft', value: counts.draft },
          { label: 'Published', value: counts.published },
          { label: 'Archived', value: counts.archived },
        ].map((item) => (
          <Card key={item.label} className="gap-2 py-4">
            <CardHeader className="px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <p className="text-2xl font-semibold tabular-nums">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {creating && (
        <Card>
          <CardHeader>
            <CardTitle>New case study</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
              <label className="grid gap-1.5 text-sm font-medium">
                Title
                <Input
                  value={newTitle}
                  onChange={(event) => {
                    const title = event.target.value;
                    setNewTitle(title);
                    if (!slugEdited) setNewSlug(slugify(title));
                  }}
                  placeholder="Brand identity for Acme"
                  required
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Slug
                <Input
                  value={newSlug}
                  onChange={(event) => {
                    setNewSlug(event.target.value);
                    setSlugEdited(true);
                  }}
                  placeholder="brand-identity-for-acme"
                  required
                />
              </label>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
                <Button type="button" variant="outline" onClick={closeCreate}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title, client, tag, or slug"
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredStudies.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {studies.length === 0 ? 'No case studies yet. Create one to begin.' : 'No case studies match these filters.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case study</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudies.map((study) => (
                  <TableRow key={study.id}>
                    <TableCell>
                      <div className="min-w-44">
                        <p className="font-medium">{study.title}</p>
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">/{study.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{study.client ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{study.year ?? '—'}</TableCell>
                    <TableCell>
                      <div className="flex max-w-52 flex-wrap gap-1">
                        {study.tags.length > 0 ? study.tags.map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        )) : <span className="text-muted-foreground">—</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[study.status]} className="capitalize">{study.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{study.display_order}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/studio/work/${study.id}`}>Edit</Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <a href={`/studio/work/${study.slug}`} target="_blank" rel="noreferrer">
                            Preview
                            <ExternalLink />
                          </a>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => void archiveStudy(study.id)}
                        >
                          {study.status === 'published' ? <Archive /> : <Trash2 />}
                          {study.status === 'published' ? 'Archive' : 'Delete'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
