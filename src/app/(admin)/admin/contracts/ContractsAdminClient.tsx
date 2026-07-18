'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FileSignature, Plus, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type ContractRow = {
  id: string;
  title: string;
  document_type: 'agreement' | 'nda';
  mode: 'employee' | 'contractor' | 'client' | 'nda';
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string | null;
  recipient_relationship: string | null;
  project_name: string | null;
  status: 'draft' | 'sent' | 'viewed' | 'expired' | 'signed' | 'cancelled';
  payment_status: 'not_required' | 'pending' | 'paid' | 'manual_paid' | 'failed';
  payment_amount_ngn: number | null;
  sent_at: string | null;
  signed_at: string | null;
  created_at: string;
};

const statusVariant = {
  draft: 'outline',
  sent: 'secondary',
  viewed: 'secondary',
  expired: 'destructive',
  signed: 'default',
  cancelled: 'outline',
} as const;

export default function ContractsAdminClient({ contracts }: { contracts: ContractRow[] }) {
  const [mode, setMode] = useState('all');
  const [status, setStatus] = useState('all');
  const [documentType, setDocumentType] = useState<'all' | 'agreement' | 'nda'>('all');

  const rows = useMemo(() => contracts.filter((contract) => (
    (documentType === 'all' || contract.document_type === documentType)
    && (mode === 'all' || contract.mode === mode)
    && (status === 'all' || contract.status === status)
  )), [contracts, documentType, mode, status]);

  const visibleDocuments = documentType === 'all'
    ? contracts
    : contracts.filter((contract) => contract.document_type === documentType);
  const signedCount = visibleDocuments.filter((contract) => contract.status === 'signed').length;
  const awaitingCount = visibleDocuments.filter((contract) => ['sent', 'viewed'].includes(contract.status)).length;
  const pendingPaymentCount = visibleDocuments.filter((contract) => contract.payment_status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Contracts</h2>
          <p className="text-sm text-muted-foreground">Agreements and one-way NDAs in one signed-document register.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/contracts/new">
              <Plus className="h-4 w-4" /> New Agreement
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/contracts/new?type=nda">
              <ShieldCheck className="h-4 w-4" /> New NDA
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric title="Total" value={visibleDocuments.length} />
        <Metric title="Signed" value={signedCount} />
        <Metric title={documentType === 'agreement' ? 'Pending Payment' : 'Awaiting Signature'} value={documentType === 'agreement' ? pendingPaymentCount : awaitingCount} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 border-b sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSignature className="h-4 w-4" /> Contract Register
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-md border bg-background p-1">
              {(['all', 'agreement', 'nda'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`rounded px-3 py-1 text-xs font-medium capitalize ${documentType === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => {
                    setDocumentType(value);
                    if (value === 'nda') setMode('all');
                  }}
                >
                  {value === 'all' ? 'All' : value === 'nda' ? 'NDAs' : 'Agreements'}
                </button>
              ))}
            </div>
            <select className="h-9 rounded-md border bg-background px-3 text-sm" value={mode} onChange={(event) => setMode(event.target.value)}>
              <option value="all">All modes</option>
              <option value="employee">Employee</option>
              <option value="contractor">Contractor</option>
              <option value="client">Client</option>
              {documentType === 'nda' ? <option value="nda">NDA</option> : null}
            </select>
            <select className="h-9 rounded-md border bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="signed">Signed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">No contracts match this view.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <Link href={`/admin/contracts/${contract.id}`} className="font-medium hover:underline">
                        {contract.title}
                      </Link>
                      {contract.document_type === 'nda' && contract.project_name ? (
                        <div className="text-xs text-muted-foreground">{contract.project_name}</div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{contract.recipient_name || '-'}</div>
                      <div className="text-xs text-muted-foreground">{contract.recipient_email || '-'}</div>
                      {contract.document_type === 'nda' && contract.recipient_phone ? (
                        <div className="text-xs text-muted-foreground">{contract.recipient_phone}</div>
                      ) : null}
                    </TableCell>
                    <TableCell className="capitalize">
                      {contract.document_type === 'nda' ? contract.recipient_relationship ?? 'NDA' : contract.mode}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[contract.status]}>{contract.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">{contract.document_type === 'nda' ? 'Not applicable' : contract.payment_status.replace('_', ' ')}</span>
                      {contract.document_type !== 'nda' && contract.payment_amount_ngn ? (
                        <span className="ml-2 text-xs text-muted-foreground">₦{contract.payment_amount_ngn.toLocaleString()}</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(contract.signed_at ?? contract.sent_at ?? contract.created_at)}
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

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
