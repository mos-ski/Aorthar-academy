'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type PublicContract = {
  id: string;
  title: string;
  mode: 'employee' | 'contractor' | 'client';
  recipient_name: string;
  recipient_email: string;
  rendered_html: string;
  payment_status: 'not_required' | 'pending' | 'paid' | 'manual_paid' | 'failed';
  payment_amount_ngn: number | null;
  payment_description: string | null;
  signed_at: string | null;
};

export default function SignContractClient({ token, paymentRef }: { token: string; paymentRef: string | null }) {
  const [contract, setContract] = useState<PublicContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signerName, setSignerName] = useState('');
  const [consent, setConsent] = useState(false);
  const [signed, setSigned] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    async function loadContract(): Promise<void> {
      const res = await fetch(`/api/contracts/sign/${token}`);
      const data = await res.json() as { contract?: PublicContract; error?: string };
      if (!res.ok || !data.contract) {
        setError(data.error ?? 'Signing link could not be loaded');
      } else {
        setContract(data.contract);
        setSigned(Boolean(data.contract.signed_at));
      }
      setLoading(false);
    }
    loadContract();
  }, [token]);

  useEffect(() => {
    if (!paymentRef) return;
    async function verifyPayment(): Promise<void> {
      const res = await fetch(`/api/contracts/paystack/verify?ref=${encodeURIComponent(paymentRef ?? '')}`);
      if (res.ok) {
        setPaymentVerified(true);
        toast.success('Payment confirmed');
      }
    }
    verifyPayment();
  }, [paymentRef]);

  async function signContract(): Promise<void> {
    const res = await fetch(`/api/contracts/sign/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signer_name: signerName, consent_accepted: consent }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) {
      toast.error(data.error ?? 'Could not submit signature');
      return;
    }
    setSigned(true);
    toast.success('Agreement signed');
  }

  async function payNow(): Promise<void> {
    setPaying(true);
    try {
      const res = await fetch('/api/contracts/paystack/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json() as { payment_url?: string; error?: string };
      if (!res.ok || !data.payment_url) {
        toast.error(data.error ?? 'Could not start payment');
        return;
      }
      window.location.href = data.payment_url;
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return <main className="mx-auto max-w-3xl px-6 py-16 text-sm text-muted-foreground">Loading agreement...</main>;
  }

  if (error || !contract) {
    return <main className="mx-auto max-w-3xl px-6 py-16 text-sm text-muted-foreground">{error || 'Agreement not found.'}</main>;
  }

  const paymentRequired = contract.mode === 'client' && contract.payment_status === 'pending' && !paymentVerified;

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{contract.title}</CardTitle>
            <p className="text-sm text-muted-foreground">For {contract.recipient_name || contract.recipient_email}</p>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-white p-6 text-sm leading-7 text-black sm:p-10" dangerouslySetInnerHTML={{ __html: contract.rendered_html }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {signed ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <PenLine className="h-4 w-4" />}
              Electronic Signature
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {signed ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                Agreement signed. Thank you.
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enter your full name to sign</label>
                  <Input value={signerName} onChange={(event) => setSignerName(event.target.value)} placeholder="Your full legal name" />
                </div>
                {signerName.trim() && (
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground">Signature preview</p>
                    <p className="mt-2 text-4xl italic tracking-wide text-foreground" style={{ fontFamily: 'Georgia, serif' }}>{signerName}</p>
                  </div>
                )}
                <label className="flex items-start gap-3 text-sm">
                  <input className="mt-1" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                  <span>I have read this agreement and consent to sign it electronically by typing my full name.</span>
                </label>
                <Button disabled={!signerName.trim() || !consent} onClick={signContract}>Submit Signature</Button>
              </>
            )}

            {signed && paymentRequired && (
              <div className="rounded-lg border p-4">
                <div className="mb-3">
                  <p className="font-medium">Payment</p>
                  <p className="text-sm text-muted-foreground">
                    {contract.payment_description || 'You can pay now with Paystack or pay later manually.'}
                  </p>
                  {contract.payment_amount_ngn ? <p className="mt-1 text-sm font-semibold">₦{contract.payment_amount_ngn.toLocaleString()}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button disabled={paying} onClick={payNow}>
                    <CreditCard className="h-4 w-4" /> Pay Now
                  </Button>
                  <Button variant="outline" onClick={() => toast.success('No problem. Aorthar will follow up for manual payment.')}>Pay Later</Button>
                </div>
              </div>
            )}

            {paymentVerified && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                Payment confirmed.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
