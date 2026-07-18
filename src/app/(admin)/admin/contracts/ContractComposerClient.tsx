'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, Copy, Eye, FileSignature, MessageCircle, Send, ShieldCheck, UserRound } from 'lucide-react';
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
import {
  getContractPlaceholderState,
  hasMeaningfulContractValue,
  readableContractValue,
} from '@/lib/contracts/field-state';
import { extractPlaceholderKeys } from '@/lib/contracts/placeholders';
import {
  getContractFieldSuggestions,
  humanizeContractFieldKey,
  shouldUseRichContractInput,
  suggestContractFieldType,
} from '@/lib/contracts/field-suggestions';
import { buildNdaWhatsAppUrl } from '@/lib/contracts/nda';
import type { NdaRecipientRelationship } from '@/lib/contracts/types';
import type { ReactNode } from 'react';

type ContractMode = 'employee' | 'contractor' | 'client' | 'nda';

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
  document_type?: 'agreement' | 'nda';
  name: string;
  description: string | null;
  content_html: string;
  contract_template_fields: TemplateField[];
};

const modes = [
  { key: 'employee', label: 'Employee', icon: UserRound },
  { key: 'contractor', label: 'Contractor', icon: BriefcaseBusiness },
  { key: 'client', label: 'Client', icon: FileSignature },
  { key: 'nda', label: 'NDA', icon: ShieldCheck },
] as const;

type ShareResult = {
  contractId: string;
  signingUrl: string;
  emailSent: boolean;
};

export default function ContractComposerClient({
  templates,
  initialMode,
}: {
  templates: Template[];
  initialMode: ContractMode;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<ContractMode>(initialMode);
  const modeTemplates = useMemo(() => templates.filter((template) => template.mode === mode), [templates, mode]);
  const [templateId, setTemplateId] = useState(modeTemplates[0]?.id ?? '');
  const selectedTemplate = modeTemplates.find((template) => template.id === templateId) ?? modeTemplates[0];
  const [title, setTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientRelationship, setRecipientRelationship] = useState<NdaRecipientRelationship | ''>('');
  const [recipientCompany, setRecipientCompany] = useState('');
  const [projectName, setProjectName] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeField, setActiveField] = useState<TemplateField | null>(null);
  const [fieldDraft, setFieldDraft] = useState('');
  const [saveFieldValue, setSaveFieldValue] = useState(false);
  const [savedFieldValues, setSavedFieldValues] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [shareResult, setShareResult] = useState<ShareResult | null>(null);

  const fields = useMemo(
    () => buildTemplateFields(selectedTemplate),
    [selectedTemplate],
  );
  const missingFields = fields.filter((field) => field.is_required && !hasMeaningfulContractValue(values[field.key]));
  const canSend = Boolean(title.trim() && recipientEmail.trim() && selectedTemplate && missingFields.length === 0);
  const activeSuggestions = activeField ? getContractFieldSuggestions(toSuggestionField(activeField)) : [];
  const activeSavedValues = activeField ? (savedFieldValues[activeField.key] ?? []) : [];
  const activeIsRich = activeField ? shouldUseRichContractInput(toSuggestionField(activeField)) : false;
  const activeQuickValues = uniqueValues([...activeSavedValues, ...activeSuggestions]);

  useEffect(() => {
    if (mode !== 'nda') return;
    setValues((current) => ({
      ...current,
      recipient_name: recipientName,
      recipient_email: recipientEmail,
      recipient_phone: recipientPhone,
      recipient_relationship: recipientRelationship
        ? `${recipientRelationship.charAt(0).toUpperCase()}${recipientRelationship.slice(1)}`
        : '',
      recipient_company: recipientCompany,
      project_name: projectName,
    }));
  }, [mode, projectName, recipientCompany, recipientEmail, recipientName, recipientPhone, recipientRelationship]);

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

  async function createContract(
    sendNow: boolean,
    deliveryMethod: 'email' | 'link' = 'email',
  ): Promise<void> {
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
          document_type: mode === 'nda' ? 'nda' : 'agreement',
          mode,
          title: title.trim() || `${selectedTemplate.name} - ${recipientName || 'Draft'}`,
          recipient_name: recipientName,
          recipient_email: recipientEmail,
          recipient_phone: mode === 'nda' ? recipientPhone : null,
          recipient_relationship: mode === 'nda' ? recipientRelationship : null,
          recipient_company: mode === 'nda' ? recipientCompany : null,
          project_name: mode === 'nda' ? projectName : null,
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
        const sendRes = await fetch(`/api/admin/contracts/${data.contract.id}/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delivery_method: deliveryMethod }),
        });
        const sendData = await sendRes.json() as {
          error?: string;
          missing_fields?: { label: string }[];
          signing_url?: string;
          email_sent?: boolean;
          email_error?: string;
        };
        if (!sendRes.ok) {
          const missingLabels = sendData.missing_fields?.map((field) => field.label).join(', ');
          toast.error(missingLabels ? `Saved draft, but fill these fields before sending: ${missingLabels}` : sendData.error ?? 'Saved draft but could not send');
          router.push(`/admin/contracts/${data.contract.id}`);
          return;
        }
        if (mode === 'nda' && sendData.signing_url) {
          setShareResult({
            contractId: data.contract.id,
            signingUrl: absoluteSigningUrl(sendData.signing_url),
            emailSent: Boolean(sendData.email_sent),
          });
          if (sendData.email_error) {
            toast.warning(`Secure link created, but email failed: ${sendData.email_error}`);
          } else {
            toast.success(deliveryMethod === 'email' ? 'NDA emailed and link created' : 'NDA signing link created');
          }
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

  async function copySigningLink(): Promise<void> {
    if (!shareResult) return;
    await navigator.clipboard.writeText(shareResult.signingUrl);
    toast.success('Signing link copied');
  }

  function shareOnWhatsApp(): void {
    if (!shareResult) return;
    const url = buildNdaWhatsAppUrl({
      phone: recipientPhone,
      recipientName,
      projectName,
      signingUrl: shareResult.signingUrl,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
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

  async function openPreview(): Promise<void> {
    if (!selectedTemplate) {
      toast.error('Choose a template first');
      return;
    }

    const previewWindow = window.open('', '_blank');
    if (!previewWindow) {
      toast.error('Allow popups to open the preview');
      return;
    }

    previewWindow.opener = null;
    previewWindow.document.write('<p style="font-family:Helvetica,Arial,sans-serif;padding:24px;">Preparing PDF preview...</p>');

    const previewTitle = title.trim() || `${selectedTemplate.name} Preview`;
    const res = await fetch('/api/admin/contracts/preview-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: previewTitle,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        contract_html: renderPreviewHtml(selectedTemplate.content_html, fields, values),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string };
      previewWindow.close();
      toast.error(data.error ?? 'Could not open PDF preview');
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    previewWindow.location.href = url;
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{mode === 'nda' ? 'New NDA' : 'New Contract'}</h2>
        <p className="text-sm text-muted-foreground">Choose a document type, fill clickable fields, then save or send.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {modes.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => chooseMode(key)}
            className={`rounded-lg border p-4 text-left transition-colors ${mode === key ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
          >
            <Icon className="mb-3 h-5 w-5 text-primary" />
            <p className="font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{key === 'nda' ? 'Protect a private project' : `Create a ${label.toLowerCase()} agreement`}</p>
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
            {mode === 'nda' && (
              <>
                <Field label="Phone or WhatsApp number">
                  <Input value={recipientPhone} onChange={(event) => setRecipientPhone(event.target.value)} placeholder="0803 123 4567" />
                </Field>
                <Field label="Relationship">
                  <select
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={recipientRelationship}
                    onChange={(event) => setRecipientRelationship(event.target.value as NdaRecipientRelationship | '')}
                  >
                    <option value="">Choose relationship</option>
                    <option value="employee">Employee</option>
                    <option value="contractor">Contractor</option>
                    <option value="client">Client</option>
                    <option value="partner">Partner</option>
                    <option value="vendor">Vendor</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Company (optional)">
                  <Input value={recipientCompany} onChange={(event) => setRecipientCompany(event.target.value)} placeholder="Recipient company" />
                </Field>
                <Field label="Project name">
                  <Input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Private project name" />
                </Field>
              </>
            )}
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
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={saving} onClick={() => createContract(false)}>Save Draft</Button>
              <Button variant="outline" disabled={saving || !selectedTemplate} onClick={openPreview}>
                <Eye className="h-4 w-4" /> Preview
              </Button>
              {mode === 'nda' ? (
                <>
                  <Button variant="outline" disabled={saving || !canSend} onClick={() => createContract(true, 'link')}>
                    <Copy className="h-4 w-4" /> Create Link
                  </Button>
                  <Button disabled={saving || !canSend} onClick={() => createContract(true, 'email')}>
                    <Send className="h-4 w-4" /> Email &amp; Create Link
                  </Button>
                </>
              ) : (
                <Button disabled={saving || !canSend} onClick={() => createContract(true)}>
                  <Send className="h-4 w-4" /> Send
                </Button>
              )}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeField?.label}</DialogTitle>
            <DialogDescription>{activeField?.help_text ?? fieldHelpText(activeField)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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

            {activeQuickValues.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {activeQuickValues.map((value) => (
                  <QuickFillButton key={value} value={value} onClick={setFieldDraft} />
                ))}
              </div>
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

      <Dialog open={Boolean(shareResult)} onOpenChange={(open) => !open && setShareResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>NDA link ready</DialogTitle>
            <DialogDescription>
              {shareResult?.emailSent
                ? 'The recipient has been emailed. You can also send this same secure link manually.'
                : 'Copy the secure link or open a prepared WhatsApp message.'}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/30 p-3 text-sm break-all">
            {shareResult?.signingUrl}
          </div>
          <DialogFooter className="flex-wrap sm:justify-between">
            <Button variant="outline" onClick={copySigningLink}>
              <Copy className="h-4 w-4" /> Copy Link
            </Button>
            <Button variant="outline" onClick={shareOnWhatsApp}>
              <MessageCircle className="h-4 w-4" /> Share on WhatsApp
            </Button>
            <Button onClick={() => shareResult && router.push(`/admin/contracts/${shareResult.contractId}`)}>
              Open NDA Record
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
    const state = getContractPlaceholderState(value);
    const text = state === 'filled' ? readableContractValue(value ?? '') : label;
    const missingClass = state === 'empty' ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800';

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

function QuickFillButton({ value, onClick }: { value: string; onClick: (value: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className="text-left text-xs font-medium text-[#a7d252] underline-offset-2 hover:text-[#c7ef63] hover:underline"
    >
      {value}
    </button>
  );
}

function uniqueValues(values: string[]): string[] {
  const seen = new Set<string>();

  return values.filter((value) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function renderPreviewHtml(html: string, fields: TemplateField[], values: Record<string, string>): string {
  return html.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, rawKey: string) => {
    const key = rawKey.trim();
    const field = fields.find((candidate) => candidate.key === key);
    const value = values[key]?.trim();

    if (!hasMeaningfulContractValue(value)) {
      return `<span style="background:#fef3c7;color:#92400e;border:1px solid #fcd34d;border-radius:4px;padding:1px 5px;">${escapeHtml(field?.label ?? key)}</span>`;
    }

    if (field?.field_type === 'long_text' || (field && shouldUseRichContractInput(toSuggestionField(field)))) {
      return sanitizePreviewRichHtml(value);
    }

    return escapeHtml(value).replace(/\n/g, '<br>');
  });
}

function sanitizePreviewRichHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<\/?(iframe|object|embed|form|input|button|textarea|select|option|link|meta)[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, '')
    .replace(/\n/g, '');
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

function absoluteSigningUrl(signingUrl: string): string {
  if (signingUrl.startsWith('http://') || signingUrl.startsWith('https://')) return signingUrl;
  return `${window.location.origin}${signingUrl.startsWith('/') ? signingUrl : `/${signingUrl}`}`;
}
