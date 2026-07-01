'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileSpreadsheet, Search, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ContactFilters, ContactRow } from '@/lib/admin/contacts';
import type { FormEvent } from 'react';

type SourceCount = {
  source: string;
  count: number;
};

type ContactsClientProps = {
  contacts: ContactRow[];
  totalCount: number;
  sourceCounts: SourceCount[];
  sourceOptions: string[];
  initialFilters: ContactFilters;
};

function formatDate(value: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function updateSearchParams(filters: ContactFilters): string {
  const params = new URLSearchParams();
  const q = filters.q?.trim();
  const source = filters.source?.trim();

  if (q) params.set('q', q);
  if (source && source !== 'all') params.set('source', source);

  const query = params.toString();
  return query ? `/admin/contacts?${query}` : '/admin/contacts';
}

function exportHref(format: 'csv' | 'xls', filters: ContactFilters): string {
  const params = new URLSearchParams({ format });
  const q = filters.q?.trim();
  const source = filters.source?.trim();

  if (q) params.set('q', q);
  if (source && source !== 'all') params.set('source', source);

  return `/api/admin/contacts/export?${params.toString()}`;
}

export default function ContactsClient({
  contacts,
  totalCount,
  sourceCounts,
  sourceOptions,
  initialFilters,
}: ContactsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(initialFilters.q ?? '');
  const [source, setSource] = useState(initialFilters.source ?? 'all');

  const activeFilters = useMemo<ContactFilters>(() => ({ q, source }), [q, source]);
  const visibleSourceCounts = sourceCounts.slice(0, 6);

  function applyFilters(nextFilters: ContactFilters): void {
    startTransition(() => {
      router.push(updateSearchParams(nextFilters));
    });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    applyFilters({ q, source });
  }

  function handleSourceChange(nextSource: string): void {
    setSource(nextSource);
    applyFilters({ q, source: nextSource });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Unified read-only audience directory across Aorthar products.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href={exportHref('csv', activeFilters)}>
              <Download className="h-4 w-4" />
              CSV
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href={exportHref('xls', activeFilters)}>
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">All Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalCount.toLocaleString('en-NG')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current View</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{contacts.length.toLocaleString('en-NG')}</p>
          </CardContent>
        </Card>
        {visibleSourceCounts.slice(0, 2).map((item) => (
          <Card key={item.source}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.source}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{item.count.toLocaleString('en-NG')}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {visibleSourceCounts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {visibleSourceCounts.map((item) => (
            <Badge key={item.source} variant="secondary" className="rounded-md">
              {item.source}: {item.count.toLocaleString('en-NG')}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search name, email, phone, tag..."
            className="pl-9"
          />
        </form>
        <Select value={source} onValueChange={handleSourceChange}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {sourceOptions.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" onClick={() => applyFilters({ q, source })} disabled={isPending}>
          {isPending ? 'Filtering...' : 'Apply'}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Sources</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.contact_key}>
                  <TableCell className="min-w-[220px]">
                    <p className="text-sm font-medium">{contact.full_name ?? contact.email ?? 'Unnamed contact'}</p>
                    <p className="text-xs text-muted-foreground">{contact.email ?? '-'}</p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {contact.phone ?? '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-[260px] flex-wrap gap-1">
                      {contact.sources.map((item) => (
                        <Badge key={item} variant="outline" className="rounded-md">{item}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-[320px] flex-wrap gap-1">
                      {contact.tags.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="secondary" className="max-w-[180px] truncate rounded-md">{tag}</Badge>
                      ))}
                      {contact.tags.length > 4 && (
                        <Badge variant="secondary" className="rounded-md">+{contact.tags.length - 4}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(contact.last_seen_at)}
                  </TableCell>
                </TableRow>
              ))}
              {contacts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    No contacts match the current filters.
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
