export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Inbox, Mail, Archive } from 'lucide-react';

type Contact = {
  id: string;
  name: string;
  email: string;
  services: string | null;
  message: string;
  status: 'new' | 'replied' | 'archived';
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const statusConfig = {
  new: { label: 'New', variant: 'default' as const },
  replied: { label: 'Replied', variant: 'secondary' as const },
  archived: { label: 'Archived', variant: 'outline' as const },
};

export default async function BusinessContactsPage() {
  const supabase = await createClient();

  const { data: contacts } = await supabase
    .from('business_contacts')
    .select('*')
    .order('created_at', { ascending: false });

  const rows = (contacts ?? []) as Contact[];
  const newCount = rows.filter((r) => r.status === 'new').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Business Inquiries</h2>
        <p className="text-sm text-muted-foreground">
          {newCount > 0 ? `${newCount} new` : 'No new inquiries'} · {rows.length} total
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'New', count: rows.filter((r) => r.status === 'new').length, icon: Inbox },
          { label: 'Replied', count: rows.filter((r) => r.status === 'replied').length, icon: Mail },
          { label: 'Archived', count: rows.filter((r) => r.status === 'archived').length, icon: Archive },
        ].map(({ label, count, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No inquiries yet. They&apos;ll appear here once someone submits the contact form on business.aorthar.com.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium whitespace-nowrap">{contact.name}</TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {contact.email}
                      </a>
                    </TableCell>
                    <TableCell className="max-w-[180px]">
                      <span className="text-sm text-muted-foreground line-clamp-2">
                        {contact.services || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[260px]">
                      <p className="text-sm text-muted-foreground line-clamp-2">{contact.message}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(contact.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[contact.status].variant}>
                        {statusConfig[contact.status].label}
                      </Badge>
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
