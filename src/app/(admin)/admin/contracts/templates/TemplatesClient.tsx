'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ReactNode } from 'react';

type ContractMode = 'employee' | 'contractor' | 'client';
type FieldType = 'text' | 'long_text' | 'money' | 'date' | 'email' | 'phone' | 'address' | 'url' | 'checkbox';

type TemplateField = {
  id?: string;
  key: string;
  label: string;
  field_type: FieldType;
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
  status: 'draft' | 'active' | 'archived';
  contract_template_fields: TemplateField[];
};

const emptyTemplate = (): Template => ({
  id: 'new',
  mode: 'client',
  name: '',
  description: '',
  content_html: '<h2>Agreement</h2><p>This agreement is between Aorthar and {{client_name}}.</p>',
  status: 'draft',
  contract_template_fields: [
    {
      key: 'client_name',
      label: 'Client Name',
      field_type: 'text',
      is_required: true,
      help_text: 'Full legal name or company name.',
      sort_order: 10,
    },
  ],
});

export default function TemplatesClient({ initialTemplates }: { initialTemplates: Template[] }) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedId, setSelectedId] = useState(initialTemplates[0]?.id ?? 'new');
  const selected = useMemo(
    () => templates.find((template) => template.id === selectedId) ?? emptyTemplate(),
    [templates, selectedId],
  );
  const [draft, setDraft] = useState<Template>(selected);
  const [saving, setSaving] = useState(false);

  function selectTemplate(id: string): void {
    const next = templates.find((template) => template.id === id) ?? emptyTemplate();
    setSelectedId(id);
    setDraft({ ...next, contract_template_fields: [...(next.contract_template_fields ?? [])] });
  }

  function updateField(index: number, patch: Partial<TemplateField>): void {
    setDraft((current) => ({
      ...current,
      contract_template_fields: current.contract_template_fields.map((field, fieldIndex) => (
        fieldIndex === index ? { ...field, ...patch } : field
      )),
    }));
  }

  async function saveTemplate(): Promise<void> {
    if (!draft.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (!draft.content_html.trim()) {
      toast.error('Template content is required');
      return;
    }

    setSaving(true);
    try {
      const isNew = draft.id === 'new';
      const res = await fetch(isNew ? '/api/admin/contract-templates' : `/api/admin/contract-templates/${draft.id}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: draft.mode,
          name: draft.name,
          description: draft.description,
          content_html: draft.content_html,
          status: draft.status,
          fields: draft.contract_template_fields,
        }),
      });
      const data = await res.json() as { template?: Template; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to save template');
        return;
      }
      toast.success('Template saved');
      router.refresh();
      if (data.template) {
        setTemplates((current) => [data.template as Template, ...current]);
        setSelectedId(data.template.id);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Contract Templates</h2>
          <p className="text-sm text-muted-foreground">Edit rich text templates and the clickable fields they require.</p>
        </div>
        <Button variant="outline" onClick={() => selectTemplate('new')}>
          <Plus className="h-4 w-4" /> New Template
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => selectTemplate(template.id)}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm ${selectedId === template.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
              >
                <span className="block font-medium">{template.name}</span>
                <span className="block text-xs capitalize text-muted-foreground">{template.mode} · {template.status}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Template Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Name">
                <Input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
              </Field>
              <Field label="Mode">
                <select className="h-9 rounded-md border bg-background px-3 text-sm" value={draft.mode} onChange={(event) => setDraft((current) => ({ ...current, mode: event.target.value as ContractMode }))}>
                  <option value="employee">Employee</option>
                  <option value="contractor">Contractor</option>
                  <option value="client">Client</option>
                </select>
              </Field>
              <Field label="Status">
                <select className="h-9 rounded-md border bg-background px-3 text-sm" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as Template['status'] }))}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </Field>
              <Field label="Description">
                <Input value={draft.description ?? ''} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rich Text Contract Body</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={draft.content_html}
                onChange={(content) => setDraft((current) => ({ ...current, content_html: content }))}
                minHeight="320px"
                placeholder="Write contract template with placeholders like {{client_name}}"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Clickable Fields</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDraft((current) => ({
                  ...current,
                  contract_template_fields: [
                    ...current.contract_template_fields,
                    { key: '', label: '', field_type: 'text', is_required: true, help_text: '', sort_order: (current.contract_template_fields.length + 1) * 10 },
                  ],
                }))}
              >
                <Plus className="h-4 w-4" /> Field
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {draft.contract_template_fields.map((field, index) => (
                <div key={`${field.key}-${index}`} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_1fr_130px_110px]">
                  <Input placeholder="client_name" value={field.key} onChange={(event) => updateField(index, { key: event.target.value })} />
                  <Input placeholder="Client Name" value={field.label} onChange={(event) => updateField(index, { label: event.target.value })} />
                  <select className="h-9 rounded-md border bg-background px-3 text-sm" value={field.field_type} onChange={(event) => updateField(index, { field_type: event.target.value as FieldType })}>
                    <option value="text">Text</option>
                    <option value="long_text">Long text</option>
                    <option value="money">Money</option>
                    <option value="date">Date</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="address">Address</option>
                    <option value="url">URL</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={field.is_required} onChange={(event) => updateField(index, { is_required: event.target.checked })} />
                    Required
                  </label>
                  <Textarea className="md:col-span-4" placeholder="Help text" value={field.help_text ?? ''} onChange={(event) => updateField(index, { help_text: event.target.value })} />
                </div>
              ))}
              <Button disabled={saving} onClick={saveTemplate}>
                <Save className="h-4 w-4" /> Save Template
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
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
