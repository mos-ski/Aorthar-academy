'use client';

import { useEffect, useMemo, useState } from 'react';
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
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Textarea } from '@/components/ui/textarea';
import { extractPlaceholderKeys } from '@/lib/contracts/placeholders';
import {
  getContractFieldSuggestions,
  humanizeContractFieldKey,
  shouldUseRichContractInput,
  suggestContractFieldType,
} from '@/lib/contracts/field-suggestions';
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
  const [saveFieldValue, setSaveFieldValue] = useState(false);
  const [savedFieldValues, setSavedFieldValues] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  const fields = useMemo(
    () => buildTemplateFields(selectedTemplate),
    [selectedTemplate],
  );
  const missingFields = fields.filter((field) => field.is_required && !hasMeaningfulContractValue(values[field.key]));
  const canSend = Boolean(title.trim() && recipientEmail.trim() && selectedTemplate && missingFields.length === 0);
  const activeSuggestions = activeField ? getContractFieldSuggestions(toSuggestionField(activeField)) : [];
  const activeSavedValues = activeField ? (savedFieldValues[activeField.key] ?? []) : [];
  const activeIsRich = activeField ? shouldUseRichContractInput(toSuggestionField(activeField)) : false;
  const activeHasChoices = Boolean(activeField && activeSuggestions.length > 0 && !activeIsRich);

  useEffect(() => {
    if (!activeField || savedFieldValues[activeField.key]) return;

    const fieldKey = activeField.key;
    let cancelled = false;
    async function loadSavedValues(): Promise<void> {
      const res = await fetch(`/api/admin/contracts/field-values?field_key=${encodeURIComponent(fieldKey)}`);
      const data = await res.json() as { values?: string[] };
      if (!cancelled && res.ok) {
        setSavedFieldValues((current) => ({ ...current, [fieldKey]: data.values ?? [] }));
      }
    }

    loadSavedValues();
    return () => {
      cancelled = true;
    };
  }, [activeField, savedFieldValues]);

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
    setSaveFieldValue(false);
  }

  async function createContract(sendNow: boolean): Promise<void> {
    if (!selectedTemplate) {
      toast.error('Create an active template first');
      return;
    }
    if (sendNow && !canSend) {
      toast.error(`Complete required fields before sending: ${missingFields.map((field) => field.label).join(', ')}`);
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
        const sendData = await sendRes.json() as { error?: string; missing_fields?: { label: string }[] };
        if (!sendRes.ok) {
          const missingLabels = sendData.missing_fields?.map((field) => field.label).join(', ');
          toast.error(missingLabels ? `Saved draft, but fill these fields before sending: ${missingLabels}` : sendData.error ?? 'Saved draft but could not send');
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

  async function saveActiveField(): Promise<void> {
    if (!activeField) return;
    const value = hasMeaningfulContractValue(fieldDraft) ? fieldDraft.trim() : '';

    setValues((current) => ({ ...current, [activeField.key]: value }));

    if (saveFieldValue && value) {
      const res = await fetch('/api/admin/contracts/field-values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field_key: activeField.key, value }),
      });
      const data = await res.json() as { values?: string[]; error?: string };
      if (res.ok) {
        setSavedFieldValues((current) => ({ ...current, [activeField.key]: data.values ?? [value] }));
        toast.success('Saved for next time');
      } else {
        toast.error(data.error ?? 'Field saved, but reusable value was not stored');
      }
    }

    setActiveField(null);
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
                style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
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
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{activeField?.label}</DialogTitle>
            <DialogDescription>{activeField?.help_text ?? fieldHelpText(activeField)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {(activeSavedValues.length > 0 || activeSuggestions.length > 0) && (
              <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                {activeSavedValues.length > 0 && (
                  <QuickFillGroup label="Saved">
                    {activeSavedValues.map((value) => (
                      <QuickFillButton key={value} value={value} onClick={setFieldDraft} />
                    ))}
                  </QuickFillGroup>
                )}
                {activeSuggestions.length > 0 && (
                  <QuickFillGroup label="Suggestions">
                    {activeSuggestions.map((value) => (
                      <QuickFillButton key={value} value={value} onClick={setFieldDraft} />
                    ))}
                  </QuickFillGroup>
                )}
              </div>
            )}

            {activeHasChoices && (
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={activeSuggestions.includes(fieldDraft) ? fieldDraft : ''}
                onChange={(event) => setFieldDraft(event.target.value)}
              >
                <option value="">Choose a suggested value...</option>
                {activeSuggestions.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            )}

            {activeIsRich ? (
              <RichTextEditor
                key={activeField?.key}
                content={fieldDraft || '<p></p>'}
                onChange={setFieldDraft}
                placeholder="Write the responsibilities, deliverables, or scope..."
                minHeight="220px"
              />
            ) : activeField?.field_type === 'address' ? (
              <Textarea value={fieldDraft} onChange={(event) => setFieldDraft(event.target.value)} className="min-h-28" />
            ) : (
              <Input
                type={activeField?.field_type === 'date' ? 'date' : activeField?.field_type === 'money' ? 'number' : activeField?.field_type === 'email' ? 'email' : activeField?.field_type === 'url' ? 'url' : 'text'}
                value={fieldDraft}
                onChange={(event) => setFieldDraft(event.target.value)}
              />
            )}

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={saveFieldValue}
                onChange={(event) => setSaveFieldValue(event.target.checked)}
              />
              <span>Save this value for next time</span>
            </label>
          </div>
          <DialogFooter>
            <Button onClick={saveActiveField}>Save Field</Button>
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
    const hasValue = hasMeaningfulContractValue(value);
    const text = hasValue ? readablePreviewValue(value) : label;
    const missingClass = field?.is_required && !hasValue ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800';

    return `<button type="button" data-field-key="${escapeAttr(key)}" class="mx-1 inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${missingClass}">${escapeHtml(text)}</button>`;
  });
}

function buildTemplateFields(template: Template | undefined): TemplateField[] {
  if (!template) return [];

  const templateFields = [...template.contract_template_fields].sort((a, b) => a.sort_order - b.sort_order);
  const fieldsByKey = new Map(templateFields.map((field) => [field.key, field]));
  const unknownFields = extractPlaceholderKeys(template.content_html)
    .filter((key) => !fieldsByKey.has(key))
    .map((key, index) => {
      const label = humanizeContractFieldKey(key);

      return {
        id: `placeholder:${key}`,
        key,
        label,
        field_type: suggestContractFieldType(key, label),
        is_required: true,
        help_text: 'This placeholder is in the template and must be filled before sending.',
        sort_order: templateFields.length + index + 1,
      } satisfies TemplateField;
    });

  return [...templateFields, ...unknownFields];
}

function toSuggestionField(field: TemplateField) {
  return {
    key: field.key,
    label: field.label,
    fieldType: field.field_type,
  };
}

function fieldHelpText(field: TemplateField | null): string {
  if (!field) return 'Enter the value that should appear in the agreement.';
  if (field.field_type === 'date') return 'Choose the exact date so the agreement formats consistently.';
  if (field.field_type === 'address') return 'Enter the full address. Saved addresses will appear here next time.';
  if (shouldUseRichContractInput(toSuggestionField(field))) return 'Use bullets or paragraphs. This section will render as rich contract text.';
  return 'Enter the value that should appear in the agreement.';
}

function QuickFillGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function QuickFillButton({ value, onClick }: { value: string; onClick: (value: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className="rounded-md border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
    >
      {value}
    </button>
  );
}

function hasMeaningfulContractValue(value: string | undefined): boolean {
  if (!value) return false;

  return readablePreviewValue(value).length > 0;
}

function readablePreviewValue(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
