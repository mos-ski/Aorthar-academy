'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, FileSignature, Send, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ReactNode } from 'react';

type ContractMode = 'employee' | 'contractor' | 'client';

type TemplateField = {
  id: string;
  key: string;
  label: string;
  field_type: 'text' | 'long_text' | 'money' | 'date' | 'email' | 'phone' | 'address' | 'url' | 'checkbox';
  is_required: boolean;
  help_text: string | null;
  sort_order: number;
};

type Template = {
  id: string;
  mode: ContractMode;
  name: string;
  description: string | null;
  content_html: string;
  contract_template_fields: TemplateField[];
};

const modes = [
  { key: 'employee', label: 'Employee', icon: UserRound },
  { key: 'contractor', label: 'Contractor', icon: BriefcaseBusiness },
  { key: 'client', label: 'Client', icon: FileSignature },
] as const;

export default function ContractComposerClient({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<ContractMode>('employee');
  const modeTemplates = useMemo(() => templates.filter((template) => template.mode === mode), [templates, mode]);
  const [templateId, setTemplateId] = useState(modeTemplates[0]?.id ?? '');
  const selectedTemplate = modeTemplates.find((template) => template.id === templateId) ?? modeTemplates[0];
  const [title, setTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeField, setActiveField] = useState<TemplateField | null>(null);
  const [fieldDraft, setFieldDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const fields = useMemo(
    () => [...(selectedTemplate?.contract_template_fields ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    [selectedTemplate],
  );
  const missingFields = fields.filter((field) => field.is_required && !values[field.key]?.trim());
  const canSend = Boolean(title.trim() && recipientEmail.trim() && selectedTemplate && missingFields.length === 0);

  function chooseMode(nextMode: ContractMode): void {
    setMode(nextMode);
    const nextTemplate = templates.find((template) => template.mode === nextMode);
    setTemplateId(nextTemplate?.id ?? '');
    setValues({});
  }

  function openField(key: string): void {
    const field = fields.find((candidate) => candidate.key === key);
    if (!field) return;
    setActiveField(field);
    setFieldDraft(values[field.key] ?? '');
  }

  async function createContract(sendNow: boolean): Promise<void> {
    if (!selectedTemplate) {
      toast.error('Create an active template first');
      return;
    }
    if (sendNow && !canSend) {
      toast.error('Complete all required fields before sending');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: selectedTemplate.id,
          mode,
          title: title.trim() || `${selectedTemplate.name} - ${recipientName || 'Draft'}`,
          recipient_name: recipientName,
          recipient_email: recipientEmail,
          payment_amount_ngn: mode === 'client' ? Number(paymentAmount || 0) : null,
          payment_description: paymentDescription,
          values,
        }),
      });
      const data = await res.json() as { contract?: { id: string }; error?: string };
      if (!res.ok || !data.contract) {
        toast.error(data.error ?? 'Failed to create contract');
        return;
      }

      if (sendNow) {
        const sendRes = await fetch(`/api/admin/contracts/${data.contract.id}/send`, { method: 'POST' });
        const sendData = await sendRes.json() as { error?: string };
        if (!sendRes.ok) {
          toast.error(sendData.error ?? 'Saved draft but could not send');
          router.push(`/admin/contracts/${data.contract.id}`);
          return;
        }
        toast.success('Contract sent');
      } else {
        toast.success('Draft saved');
      }
      router.push(`/admin/contracts/${data.contract.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">New Contract</h2>
        <p className="text-sm text-muted-foreground">Choose a mode, fill clickable fields, then save or send.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {modes.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => chooseMode(key)}
            className={`rounded-lg border p-4 text-left transition-colors ${mode === key ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
          >
            <Icon className="mb-3 h-5 w-5 text-primary" />
            <p className="font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">Create a {label.toLowerCase()} agreement</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contract Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Template">
              <select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={selectedTemplate?.id ?? ''} onChange={(event) => setTemplateId(event.target.value)}>
                {modeTemplates.map((template) => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Title">
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Product design retainer agreement" />
            </Field>
            <Field label="Recipient name">
              <Input value={recipientName} onChange={(event) => setRecipientName(event.target.value)} placeholder="Full name or company" />
            </Field>
            <Field label="Recipient email">
              <Input type="email" value={recipientEmail} onChange={(event) => setRecipientEmail(event.target.value)} placeholder="person@example.com" />
            </Field>
            {mode === 'client' && (
              <>
                <Field label="Payment amount (NGN)">
                  <Input type="number" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} placeholder="250000" />
                </Field>
                <Field label="Payment description">
                  <Textarea value={paymentDescription} onChange={(event) => setPaymentDescription(event.target.value)} placeholder="Project deposit, balance, or retainer note" />
                </Field>
              </>
            )}
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-xs font-medium">Required fields left</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {missingFields.length === 0 ? 'All required fields complete.' : missingFields.map((field) => field.label).join(', ')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={saving} onClick={() => createContract(false)}>Save Draft</Button>
              <Button disabled={saving || !canSend} onClick={() => createContract(true)}>
                <Send className="h-4 w-4" /> Send
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Clickable Agreement Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTemplate ? (
              <div
                className="contract-preview min-h-[520px] rounded-lg border bg-white p-8 text-sm leading-7 text-black shadow-sm"
                onClick={(event) => {
                  const target = event.target as HTMLElement;
                  const key = target.dataset.fieldKey;
                  if (key) openField(key);
                }}
                dangerouslySetInnerHTML={{ __html: interactiveHtml(selectedTemplate.content_html, fields, values) }}
              />
            ) : (
              <div className="rounded-lg border py-16 text-center text-sm text-muted-foreground">No active template for this mode.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={Boolean(activeField)} onOpenChange={(open) => !open && setActiveField(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeField?.label}</DialogTitle>
            <DialogDescription>{activeField?.help_text ?? 'Enter the value that should appear in the agreement.'}</DialogDescription>
          </DialogHeader>
          {activeField?.field_type === 'long_text' || activeField?.field_type === 'address' ? (
            <Textarea value={fieldDraft} onChange={(event) => setFieldDraft(event.target.value)} className="min-h-32" />
          ) : (
            <Input
              type={activeField?.field_type === 'date' ? 'date' : activeField?.field_type === 'money' ? 'number' : activeField?.field_type === 'email' ? 'email' : 'text'}
              value={fieldDraft}
              onChange={(event) => setFieldDraft(event.target.value)}
            />
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                if (!activeField) return;
                setValues((current) => ({ ...current, [activeField.key]: fieldDraft }));
                setActiveField(null);
              }}
            >
              Save Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

function interactiveHtml(html: string, fields: TemplateField[], values: Record<string, string>): string {
  return html.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, rawKey: string) => {
    const key = rawKey.trim();
    const field = fields.find((candidate) => candidate.key === key);
    const label = field?.label ?? key;
    const value = values[key]?.trim();
    const text = value || label;
    const missingClass = field?.is_required && !value ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800';

    return `<button type="button" data-field-key="${escapeAttr(key)}" class="mx-1 inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${missingClass}">${escapeHtml(text)}</button>`;
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/`/g, '&#96;');
}
