'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Copy, Download, Eye, RefreshCcw, Trash2, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ReactNode } from 'react';

type Contract = {
  id: string;
  title: string;
  mode: string;
  recipient_name: string;
  recipient_email: string;
  status: string;
  payment_status: string;
  payment_amount_ngn: number | null;
  payment_description: string | null;
  rendered_html: string | null;
  signed_snapshot_html: string | null;
  sent_at: string | null;
  signed_at: string | null;
  contract_signing_tokens: Array<{ id: string; status: string; expires_at: string; sent_at: string; viewed_at: string | null; used_at: string | null }>;
  contract_signatures: Array<{ signer_name: string; signer_email: string; signed_at: string; ip_address: string | null; user_agent: string | null; consent_text: string }>;
  contract_payments: Array<{ status: string; amount_ngn: number; method: string; paystack_reference: string | null; manual_reference: string | null; note: string | null; paid_at: string | null }>;
};

export default function ContractDetailClient({ contract }: { contract: Contract }) {
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualAmount, setManualAmount] = useState(String(contract.payment_amount_ngn ?? ''));
  const [manualReference, setManualReference] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [duplicating, setDuplicating] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function resend(): Promise<void> {
    setResending(true);
    try {
      const res = await fetch(`/api/admin/contracts/${contract.id}/resend`, { method: 'POST' });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to resend contract');
        return;
      }
      toast.success('Contract link resent');
      router.refresh();
    } finally {
      setResending(false);
    }
  }

  async function markManualPaid(): Promise<void> {
    const res = await fetch(`/api/admin/contracts/${contract.id}/manual-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount_ngn: Number(manualAmount),
        method: 'bank_transfer',
        manual_reference: manualReference,
        note: manualNote,
      }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) {
      toast.error(data.error ?? 'Failed to mark paid');
      return;
    }
    toast.success('Payment marked as done');
    setManualOpen(false);
    router.refresh();
  }

  async function duplicateContract(): Promise<void> {
    setDuplicating(true);
    try {
      const res = await fetch(`/api/admin/contracts/${contract.id}/duplicate`, { method: 'POST' });
      const data = await res.json() as { contract?: { id: string }; error?: string };
      if (!res.ok || !data.contract) {
        toast.error(data.error ?? 'Failed to duplicate contract');
        return;
      }

      toast.success('Draft copy created');
      router.push(`/admin/contracts/${data.contract.id}`);
    } finally {
      setDuplicating(false);
    }
  }

  async function deleteContract(): Promise<void> {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/contracts/${contract.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to delete contract');
        return;
      }

      toast.success('Contract deleted');
      router.push('/admin/contracts');
    } finally {
      setDeleting(false);
    }
  }

  const latestToken = [...(contract.contract_signing_tokens ?? [])].sort((a, b) => Date.parse(b.sent_at) - Date.parse(a.sent_at))[0];
  const signature = contract.contract_signatures?.[0];
  const html = contract.signed_snapshot_html ?? contract.rendered_html;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin/contracts" className="text-sm text-muted-foreground hover:text-foreground">Contracts</Link>
          <h2 className="text-xl font-semibold">{contract.title}</h2>
          <p className="text-sm text-muted-foreground">{contract.recipient_name} · {contract.recipient_email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href={`/api/admin/contracts/${contract.id}/pdf`} target="_blank" rel="noreferrer">
              <Eye className="h-4 w-4" /> Preview
            </a>
          </Button>
          <Button variant="outline" disabled={duplicating} onClick={duplicateContract}>
            <Copy className="h-4 w-4" /> Duplicate
          </Button>
          <Button variant="outline" disabled={resending || contract.status === 'signed'} onClick={resend}>
            <RefreshCcw className="h-4 w-4" /> Resend Link
          </Button>
          {contract.payment_status === 'pending' && (
            <Button variant="outline" onClick={() => setManualOpen(true)}>
              <WalletCards className="h-4 w-4" /> Mark Paid
            </Button>
          )}
          <Button asChild>
            <a href={`/api/admin/contracts/${contract.id}/pdf`} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4" /> PDF
            </a>
          </Button>
          <Button variant="destructive" disabled={deleting} onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatusCard label="Mode" value={contract.mode} />
        <StatusCard label="Status" value={contract.status} />
        <StatusCard label="Payment" value={contract.payment_status.replace('_', ' ')} />
        <StatusCard label="Amount" value={contract.payment_amount_ngn ? `₦${contract.payment_amount_ngn.toLocaleString()}` : 'Not required'} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stored Contract Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            {html ? (
              <div className="rounded-lg border bg-white p-8 text-sm leading-7 text-black" dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <div className="rounded-lg border py-16 text-center text-sm text-muted-foreground">No rendered snapshot yet. Send the contract to create one.</div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Signing Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {latestToken ? (
                <>
                  <Row label="Status" value={latestToken.status} />
                  <Row label="Expires" value={formatDateTime(latestToken.expires_at)} />
                  <Row label="Viewed" value={latestToken.viewed_at ? formatDateTime(latestToken.viewed_at) : '-'} />
                </>
              ) : (
                <p className="text-muted-foreground">No link has been sent yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Signature Proof</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {signature ? (
                <>
                  <Row label="Signer" value={signature.signer_name} />
                  <Row label="Email" value={signature.signer_email} />
                  <Row label="Signed" value={formatDateTime(signature.signed_at)} />
                  <Row label="IP" value={signature.ip_address ?? '-'} />
                </>
              ) : (
                <p className="text-muted-foreground">Not signed yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Manual Payment Done</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Amount paid (NGN)">
              <Input type="number" value={manualAmount} onChange={(event) => setManualAmount(event.target.value)} />
            </Field>
            <Field label="Bank/reference">
              <Input value={manualReference} onChange={(event) => setManualReference(event.target.value)} />
            </Field>
            <Field label="Receipt note">
              <Textarea value={manualNote} onChange={(event) => setManualNote(event.target.value)} />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={markManualPaid}>Save Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contract</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete this contract, its signing links, field values, payments, and signature proof.
          </p>
          <DialogFooter>
            <Button variant="outline" disabled={deleting} onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={deleting} onClick={deleteContract}>Delete Contract</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant="secondary" className="capitalize">{value}</Badge>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
