'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Copy, ExternalLink, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  createCaseStudyListFields,
  parseCaseStudyListFields,
  type CaseStudyListFields,
} from '@/lib/studio/case-study-editor';
import type { ReactElement } from 'react';
import type { StudioCaseStudyAdminDetail, StudioCaseStudyBlock, StudioCaseStudyBlockType, StudioCaseStudyStatus } from '@/lib/studio/case-study-schema';

type CaseStudyEditorProps = { study: StudioCaseStudyAdminDetail };
type StudyDraft = Omit<StudioCaseStudyAdminDetail, 'blocks' | 'created_at' | 'updated_at' | 'published_at'>;
type BlockEditorProps<T extends StudioCaseStudyBlock> = { block: T; onChange: (block: T) => void };

const emptyContentByType = {
  text: { body: '' },
  media_row: { layout: 'single', items: [{ type: 'image', url: '', alt: '', aspectRatio: '3/2' }] },
  video: { url: '', coverUrl: null, caption: null },
  quote: { quote: '', name: null, role: null },
  process_notes: { orientation: 'horizontal', title: '', body: '', images: [{ url: '', alt: '' }] },
  credits: { items: [{ category: '', names: null, url: null }] },
} as const;

const blockLabels: Record<StudioCaseStudyBlockType, string> = {
  text: 'Text', media_row: 'Media row', video: 'Video', quote: 'Quote', process_notes: 'Process notes', credits: 'Credits',
};

function contentForBlock(block: StudioCaseStudyBlock): Omit<StudioCaseStudyBlock, 'id' | 'sort_order' | 'type'> {
  switch (block.type) {
    case 'text': return { body: block.body };
    case 'media_row': return { layout: block.layout, items: block.items };
    case 'video': return { url: block.url, coverUrl: block.coverUrl, caption: block.caption };
    case 'quote': return { quote: block.quote, name: block.name, role: block.role };
    case 'process_notes': return { orientation: block.orientation, title: block.title, body: block.body, images: block.images };
    case 'credits': return { items: block.items };
  }
}

function fieldValue(value: string | null): string { return value ?? ''; }

export default function CaseStudyEditor({ study }: CaseStudyEditorProps): ReactElement {
  const router = useRouter();
  const [draft, setDraft] = useState<StudyDraft>(() => {
    return {
      id: study.id,
      slug: study.slug,
      title: study.title,
      subtitle: study.subtitle,
      client: study.client,
      year: study.year,
      tags: study.tags,
      services: study.services,
      cover_url: study.cover_url,
      cover_alt: study.cover_alt,
      cover_media_type: study.cover_media_type,
      is_featured: study.is_featured,
      display_order: study.display_order,
      release_date: study.release_date,
      featured_in: study.featured_in,
      preview_video_url: study.preview_video_url,
      seo_title: study.seo_title,
      seo_description: study.seo_description,
      og_image_url: study.og_image_url,
      status: study.status,
    };
  });
  const [listFields, setListFields] = useState<CaseStudyListFields>(() => createCaseStudyListFields(study));
  const [blocks, setBlocks] = useState<StudioCaseStudyBlock[]>(study.blocks);
  const [saving, setSaving] = useState<boolean>(false);

  function updateDraft<K extends keyof StudyDraft>(key: K, value: StudyDraft[K]): void {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateListField(key: keyof CaseStudyListFields, value: string): void {
    setListFields((current) => ({ ...current, [key]: value }));
  }

  async function saveStudy(nextStatus?: StudioCaseStudyStatus): Promise<void> {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/studio/case-studies/${study.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          ...parseCaseStudyListFields(listFields),
          status: nextStatus ?? draft.status,
        }),
      });
      const data = await res.json().catch((): { error?: string } => ({}));
      if (!res.ok) { toast.error(data.error ?? 'Failed to save case study'); return; }
      if (nextStatus) updateDraft('status', nextStatus);
      toast.success(nextStatus === 'published' ? 'Case study published' : 'Case study saved');
      router.refresh();
    } catch { toast.error('Failed to save case study'); } finally { setSaving(false); }
  }

  function updateBlock(nextBlock: StudioCaseStudyBlock): void {
    setBlocks((current) => current.map((block) => block.id === nextBlock.id ? nextBlock : block));
  }

  async function addBlock(type: StudioCaseStudyBlockType): Promise<void> {
    const content = emptyContentByType[type];
    try {
      const res = await fetch(`/api/admin/studio/case-studies/${study.id}/blocks`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, content }),
      });
      const data = await res.json().catch((): { data?: { id: string; sort_order: number } & Record<string, unknown>; error?: string } => ({}));
      if (!res.ok || !data.data) { toast.error(data.error ?? 'Failed to add block'); return; }
      const newBlock = { id: data.data.id, sort_order: data.data.sort_order, type, ...content } as StudioCaseStudyBlock;
      setBlocks((current) => [...current, newBlock]);
      toast.success(`${blockLabels[type]} block added`);
    } catch { toast.error('Failed to add block'); }
  }

  async function duplicateBlock(block: StudioCaseStudyBlock): Promise<void> {
    const content = contentForBlock(block);
    try {
      const res = await fetch(`/api/admin/studio/case-studies/${study.id}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: block.type, content }),
      });
      const data = await res.json().catch((): { data?: { id: string; sort_order: number }; error?: string } => ({}));
      if (!res.ok || !data.data) {
        toast.error(data.error ?? 'Failed to duplicate block');
        return;
      }
      const duplicate = {
        id: data.data.id,
        sort_order: data.data.sort_order,
        type: block.type,
        ...content,
      } as StudioCaseStudyBlock;
      setBlocks((current) => [...current, duplicate]);
      toast.success('Block duplicated');
    } catch {
      toast.error('Failed to duplicate block');
    }
  }

  async function saveBlock(block: StudioCaseStudyBlock): Promise<void> {
    try {
      const res = await fetch(`/api/admin/studio/case-studies/${study.id}/blocks/${block.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: block.type, content: contentForBlock(block) }),
      });
      const data = await res.json().catch((): { error?: string } => ({}));
      if (!res.ok) { toast.error(data.error ?? 'Failed to save block'); return; }
      toast.success('Block saved'); router.refresh();
    } catch { toast.error('Failed to save block'); }
  }

  async function deleteBlock(blockId: string): Promise<void> {
    try {
      const res = await fetch(`/api/admin/studio/case-studies/${study.id}/blocks/${blockId}`, { method: 'DELETE' });
      const data = await res.json().catch((): { error?: string } => ({}));
      if (!res.ok) { toast.error(data.error ?? 'Failed to delete block'); return; }
      setBlocks((current) => current.filter((block) => block.id !== blockId));
      toast.success('Block deleted'); router.refresh();
    } catch { toast.error('Failed to delete block'); }
  }

  async function moveBlock(index: number, direction: -1 | 1): Promise<void> {
    const destination = index + direction;
    if (destination < 0 || destination >= blocks.length) return;
    const reordered = [...blocks];
    [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
    const ordered = reordered.map((block, sortOrder) => ({ ...block, sort_order: sortOrder }));
    setBlocks(ordered);
    try {
      const res = await fetch(`/api/admin/studio/case-studies/${study.id}/blocks/reorder`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderedIds: ordered.map((block) => block.id) }),
      });
      const data = await res.json().catch((): { error?: string } => ({}));
      if (!res.ok) { setBlocks(blocks); toast.error(data.error ?? 'Failed to reorder blocks'); return; }
      toast.success('Block order updated'); router.refresh();
    } catch { setBlocks(blocks); toast.error('Failed to reorder blocks'); }
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div><Button asChild variant="ghost" size="sm" className="mb-2 -ml-3"><Link href="/admin/studio/work"><ArrowLeft />Back to work</Link></Button><h1 className="text-2xl font-semibold">{study.title}</h1><p className="mt-1 text-sm text-muted-foreground">Edit case study content and publishing details.</p></div>
      <div className="flex flex-wrap gap-2">{study.status === 'published' ? <Button asChild type="button" variant="outline"><a href={`/studio/work/${study.slug}`} target="_blank" rel="noreferrer"><ExternalLink />View live</a></Button> : null}<Button type="button" variant="outline" onClick={() => void saveStudy()} disabled={saving}><Save />Save</Button><Button type="button" onClick={() => void saveStudy('published')} disabled={saving}>{saving ? 'Saving...' : 'Publish'}</Button></div>
    </div>
    <Tabs defaultValue="overview">
      <TabsList className="h-auto w-full flex-wrap justify-start"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="media">Media</TabsTrigger><TabsTrigger value="metadata">Metadata</TabsTrigger><TabsTrigger value="story">Story</TabsTrigger><TabsTrigger value="credits">Credits</TabsTrigger><TabsTrigger value="seo">SEO</TabsTrigger></TabsList>
      <TabsContent value="overview" className="mt-6"><Card><CardContent className="grid gap-4 pt-6 md:grid-cols-2"><Field label="Title"><Input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} /></Field><Field label="Slug"><Input value={draft.slug} onChange={(event) => updateDraft('slug', event.target.value)} /></Field><Field label="Subtitle" className="md:col-span-2"><Textarea value={fieldValue(draft.subtitle)} onChange={(event) => updateDraft('subtitle', event.target.value || null)} /></Field><Field label="Client"><Input value={fieldValue(draft.client)} onChange={(event) => updateDraft('client', event.target.value || null)} /></Field><Field label="Status"><Select value={draft.status} onValueChange={(value) => updateDraft('status', value as StudioCaseStudyStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></Field></CardContent></Card></TabsContent>
      <TabsContent value="media" className="mt-6"><Card><CardContent className="grid gap-4 pt-6 md:grid-cols-2"><Field label="Hero media type"><Select value={draft.cover_media_type} onValueChange={(value) => updateDraft('cover_media_type', value as 'image' | 'video')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="image">Cover image</SelectItem><SelectItem value="video">Preview video</SelectItem></SelectContent></Select></Field><Field label="Cover image URL"><Input type="url" value={fieldValue(draft.cover_url)} onChange={(event) => updateDraft('cover_url', event.target.value || null)} placeholder="https://" /></Field><Field label="Cover alt text"><Input value={fieldValue(draft.cover_alt)} onChange={(event) => updateDraft('cover_alt', event.target.value || null)} /></Field><Field label="Preview video URL"><Input type="url" value={fieldValue(draft.preview_video_url)} onChange={(event) => updateDraft('preview_video_url', event.target.value || null)} placeholder="Vimeo or direct HTTPS video URL" /></Field></CardContent></Card></TabsContent>
      <TabsContent value="metadata" className="mt-6"><Card><CardContent className="grid gap-4 pt-6 md:grid-cols-2"><Field label="Year"><Input value={fieldValue(draft.year)} onChange={(event) => updateDraft('year', event.target.value || null)} /></Field><Field label="Release date"><Input type="date" value={fieldValue(draft.release_date)} onChange={(event) => updateDraft('release_date', event.target.value || null)} /></Field><Field label="Display order"><Input type="number" value={draft.display_order} onChange={(event) => updateDraft('display_order', Number(event.target.value) || 0)} /></Field><Field label="Featured"><Select value={draft.is_featured ? 'yes' : 'no'} onValueChange={(value) => updateDraft('is_featured', value === 'yes')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select></Field><Field label="Tags" className="md:col-span-2"><Input value={listFields.tags} onChange={(event) => updateListField('tags', event.target.value)} placeholder="Identity, Strategy" /></Field><Field label="Services" className="md:col-span-2"><Input value={listFields.services} onChange={(event) => updateListField('services', event.target.value)} placeholder="Brand strategy, Design" /></Field><Field label="Featured in" className="md:col-span-2"><Input value={listFields.featured_in} onChange={(event) => updateListField('featured_in', event.target.value)} placeholder="Publication, Award" /></Field></CardContent></Card></TabsContent>
      <TabsContent value="story" className="mt-6 space-y-4">
        {blocks.length === 0
          ? <EmptyCanvas study={draft} onAdd={addBlock} />
          : <>
              <Card><CardHeader><CardTitle>Add content block</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{(Object.keys(emptyContentByType) as StudioCaseStudyBlockType[]).map((type) => <Button key={type} type="button" variant="outline" size="sm" onClick={() => void addBlock(type)}><Plus />{blockLabels[type]}</Button>)}</CardContent></Card>
              {blocks.map((block, index) => <BlockCard key={block.id} block={block} index={index} total={blocks.length} onChange={updateBlock} onSave={saveBlock} onDuplicate={duplicateBlock} onDelete={deleteBlock} onMove={moveBlock} />)}
            </>
        }
      </TabsContent>
      <TabsContent value="credits" className="mt-6"><Card><CardContent className="space-y-4 pt-6"><p className="text-sm text-muted-foreground">Credits are managed as structured Credits blocks in the Story tab.</p><Button type="button" variant="outline" onClick={() => void addBlock('credits')}><Plus />Add credits block</Button></CardContent></Card></TabsContent>
      <TabsContent value="seo" className="mt-6"><Card><CardContent className="grid gap-4 pt-6"><Field label="SEO title"><Input value={fieldValue(draft.seo_title)} onChange={(event) => updateDraft('seo_title', event.target.value || null)} /></Field><Field label="SEO description"><Textarea value={fieldValue(draft.seo_description)} onChange={(event) => updateDraft('seo_description', event.target.value || null)} /></Field><Field label="Open Graph image URL"><Input type="url" value={fieldValue(draft.og_image_url)} onChange={(event) => updateDraft('og_image_url', event.target.value || null)} placeholder="https://" /></Field></CardContent></Card></TabsContent>
    </Tabs>
  </div>;
}

function EmptyCanvas({ study, onAdd }: { study: StudyDraft; onAdd: (type: StudioCaseStudyBlockType) => Promise<void> }): ReactElement {
  const [open, setOpen] = useState(false);
  const meta = [study.tags[0] ?? study.services[0] ?? null, study.year].filter(Boolean).join(' · ');

  return (
    <div style={{ display: 'flex', gap: 0, minHeight: 720, background: '#18191a', borderRadius: 8, overflow: 'hidden', border: '1px solid #2d2d2d' }}>
      {/* Sidebar */}
      <div style={{ width: 180, flexShrink: 0, borderRight: '1px solid #2d2d2d', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48, paddingBottom: 24 }}>
        <div style={{ textAlign: 'center', padding: '0 12px', marginBottom: 24 }}>
          <p style={{ color: '#fff', fontSize: 18, fontWeight: 400, margin: '0 0 6px', lineHeight: 1.2 }}>{(study.client ?? study.title) || 'Project Name'}</p>
          {meta && <p style={{ color: '#989898', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{meta}</p>}
        </div>
        <div style={{ width: '100%', padding: '0 12px' }}>
          <p style={{ color: '#fff', fontSize: 13, textAlign: 'center', padding: '6px 0', margin: 0 }}>Topics</p>
          <p style={{ color: '#a7d252', fontSize: 13, textAlign: 'center', padding: '6px 0', margin: 0, cursor: 'pointer' }} onClick={() => setOpen(true)}>+ Add block</p>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Dark canvas area */}
        <div style={{ flex: 1, position: 'relative', background: 'rgba(72,72,72,0.40)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 480 }}>
          <div style={{ border: '3px dashed #484848', padding: 16, width: 296, textAlign: 'center' }}>
            <p style={{ color: '#ebefe0', fontSize: 12, lineHeight: '18px', margin: 0 }}>Drag and drop your files here<br />or click to upload</p>
          </div>
        </div>

        {/* Add Block divider */}
        <div style={{ padding: '16px 0', borderTop: '1px solid #2d2d2d' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', marginBottom: open ? 16 : 0 }}>
            <div style={{ flex: 1, height: 1, background: '#484848' }} />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              style={{ color: '#a7d252', fontSize: 16, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', padding: 0 }}
            >
              Add Block [/]
            </button>
            <div style={{ flex: 1, height: 1, background: '#484848' }} />
          </div>

          {open && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 24px' }}>
              {(Object.keys(emptyContentByType) as StudioCaseStudyBlockType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => { void onAdd(type); setOpen(false); }}
                  style={{ background: '#2d2d2d', border: '1px solid #484848', borderRadius: 4, color: '#ebefe0', fontSize: 13, padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={13} />
                  {blockLabels[type]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: ReactElement }): ReactElement { return <label className={`grid gap-1.5 text-sm font-medium ${className ?? ''}`}>{label}{children}</label>; }

function BlockCard({ block, index, total, onChange, onSave, onDuplicate, onDelete, onMove }: { block: StudioCaseStudyBlock; index: number; total: number; onChange: (block: StudioCaseStudyBlock) => void; onSave: (block: StudioCaseStudyBlock) => Promise<void>; onDuplicate: (block: StudioCaseStudyBlock) => Promise<void>; onDelete: (id: string) => Promise<void>; onMove: (index: number, direction: -1 | 1) => Promise<void> }): ReactElement {
  return <Card><CardHeader className="flex-row items-center justify-between gap-3"><CardTitle className="text-base">{index + 1}. {blockLabels[block.type]}</CardTitle><div className="flex gap-1"><Button type="button" size="icon" variant="ghost" disabled={index === 0} onClick={() => void onMove(index, -1)} aria-label="Move block up"><ArrowUp /></Button><Button type="button" size="icon" variant="ghost" disabled={index === total - 1} onClick={() => void onMove(index, 1)} aria-label="Move block down"><ArrowDown /></Button><Button type="button" size="icon" variant="ghost" onClick={() => void onDuplicate(block)} aria-label="Duplicate block"><Copy /></Button><Button type="button" size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => void onDelete(block.id)} aria-label="Delete block"><Trash2 /></Button></div></CardHeader><CardContent className="space-y-4">{block.type === 'text' && <TextBlockEditor block={block} onChange={onChange} />}{block.type === 'media_row' && <MediaRowBlockEditor block={block} onChange={onChange} />}{block.type === 'video' && <VideoBlockEditor block={block} onChange={onChange} />}{block.type === 'quote' && <QuoteBlockEditor block={block} onChange={onChange} />}{block.type === 'process_notes' && <ProcessNotesBlockEditor block={block} onChange={onChange} />}{block.type === 'credits' && <CreditsBlockEditor block={block} onChange={onChange} />}<Button type="button" variant="outline" onClick={() => void onSave(block)}><Save />Save block</Button></CardContent></Card>;
}

function TextBlockEditor({ block, onChange }: BlockEditorProps<Extract<StudioCaseStudyBlock, { type: 'text' }>>): ReactElement { return <Field label="Body"><Textarea value={block.body} onChange={(event) => onChange({ ...block, body: event.target.value })} /></Field>; }
function MediaRowBlockEditor({ block, onChange }: BlockEditorProps<Extract<StudioCaseStudyBlock, { type: 'media_row' }>>): ReactElement {
  function updateItem(index: number, key: 'type' | 'url' | 'alt' | 'aspectRatio', value: string): void {
    const items = block.items.map((item, itemIndex) => (
      itemIndex === index
        ? { ...item, [key]: key === 'type' ? value as 'image' | 'video' : value }
        : item
    ));
    onChange({ ...block, items });
  }

  function removeItem(index: number): void {
    onChange({ ...block, items: block.items.filter((_, itemIndex) => itemIndex !== index) });
  }

  return <div className="space-y-4"><Field label="Layout"><Select value={block.layout} onValueChange={(value) => onChange({ ...block, layout: value as 'single' | 'pair' })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="pair">Pair</SelectItem></SelectContent></Select></Field>{block.items.map((item, index) => <div key={index} className="grid gap-3 rounded-md border p-3 md:grid-cols-[repeat(4,minmax(0,1fr))_auto]"><Select value={item.type} onValueChange={(value) => updateItem(index, 'type', value)}><SelectTrigger aria-label={`Media ${index + 1} type`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="image">Image</SelectItem><SelectItem value="video">Video</SelectItem></SelectContent></Select><Input aria-label={`Media ${index + 1} URL`} value={item.url} onChange={(event) => updateItem(index, 'url', event.target.value)} placeholder="https://" /><Input aria-label={`Media ${index + 1} alt text`} value={item.alt} onChange={(event) => updateItem(index, 'alt', event.target.value)} placeholder="Alt text" /><Input aria-label={`Media ${index + 1} aspect ratio`} value={item.aspectRatio} onChange={(event) => updateItem(index, 'aspectRatio', event.target.value)} placeholder="3/2" /><Button type="button" size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => removeItem(index)} aria-label={`Remove media ${index + 1}`}><Trash2 /></Button></div>)}{block.items.length < 2 ? <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...block, items: [...block.items, { type: 'image', url: '', alt: '', aspectRatio: '3/2' }] })}><Plus />Add media</Button> : null}</div>;
}
function VideoBlockEditor({ block, onChange }: BlockEditorProps<Extract<StudioCaseStudyBlock, { type: 'video' }>>): ReactElement { return <div className="grid gap-4"><Field label="Video URL"><Input type="url" value={block.url} onChange={(event) => onChange({ ...block, url: event.target.value })} placeholder="https://" /></Field><Field label="Cover URL"><Input type="url" value={fieldValue(block.coverUrl)} onChange={(event) => onChange({ ...block, coverUrl: event.target.value || null })} placeholder="https://" /></Field><Field label="Caption"><Input value={fieldValue(block.caption)} onChange={(event) => onChange({ ...block, caption: event.target.value || null })} /></Field></div>; }
function QuoteBlockEditor({ block, onChange }: BlockEditorProps<Extract<StudioCaseStudyBlock, { type: 'quote' }>>): ReactElement { return <div className="grid gap-4"><Field label="Quote"><Textarea value={block.quote} onChange={(event) => onChange({ ...block, quote: event.target.value })} /></Field><Field label="Name"><Input value={fieldValue(block.name)} onChange={(event) => onChange({ ...block, name: event.target.value || null })} /></Field><Field label="Role"><Input value={fieldValue(block.role)} onChange={(event) => onChange({ ...block, role: event.target.value || null })} /></Field></div>; }
function ProcessNotesBlockEditor({ block, onChange }: BlockEditorProps<Extract<StudioCaseStudyBlock, { type: 'process_notes' }>>): ReactElement {
  const updateImage = (index: number, key: 'url' | 'alt', value: string): void => onChange({
    ...block,
    images: block.images.map((image, imageIndex) => imageIndex === index ? { ...image, [key]: value } : image),
  });
  const removeImage = (index: number): void => onChange({
    ...block,
    images: block.images.filter((_, imageIndex) => imageIndex !== index),
  });
  return <div className="space-y-4"><Field label="Orientation"><Select value={block.orientation} onValueChange={(value) => onChange({ ...block, orientation: value as 'horizontal' | 'vertical' })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="horizontal">Horizontal</SelectItem><SelectItem value="vertical">Vertical</SelectItem></SelectContent></Select></Field><Field label="Title"><Input value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} /></Field><Field label="Body"><Textarea value={block.body} onChange={(event) => onChange({ ...block, body: event.target.value })} /></Field>{block.images.map((image, index) => <div key={index} className="grid gap-3 rounded-md border p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"><Input value={image.url} onChange={(event) => updateImage(index, 'url', event.target.value)} placeholder="https://" /><Input value={image.alt} onChange={(event) => updateImage(index, 'alt', event.target.value)} placeholder="Alt text" /><Button type="button" size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => removeImage(index)} aria-label={`Remove process image ${index + 1}`}><Trash2 /></Button></div>)}<Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...block, images: [...block.images, { url: '', alt: '' }] })}><Plus />Add image</Button></div>;
}

function CreditsBlockEditor({ block, onChange }: BlockEditorProps<Extract<StudioCaseStudyBlock, { type: 'credits' }>>): ReactElement {
  const updateItem = (index: number, key: 'category' | 'names' | 'url', value: string): void => onChange({
    ...block,
    items: block.items.map((item, itemIndex) => (
      itemIndex === index
        ? { ...item, [key]: key === 'category' ? value : value || null }
        : item
    )),
  });
  const removeItem = (index: number): void => onChange({
    ...block,
    items: block.items.filter((_, itemIndex) => itemIndex !== index),
  });
  return <div className="space-y-4">{block.items.map((item, index) => <div key={index} className="grid gap-3 rounded-md border p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"><Input value={item.category} onChange={(event) => updateItem(index, 'category', event.target.value)} placeholder="Category" /><Input value={fieldValue(item.names)} onChange={(event) => updateItem(index, 'names', event.target.value)} placeholder="Names" /><Input type="url" value={fieldValue(item.url)} onChange={(event) => updateItem(index, 'url', event.target.value)} placeholder="https://" /><Button type="button" size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => removeItem(index)} aria-label={`Remove credit ${index + 1}`}><Trash2 /></Button></div>)}<Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...block, items: [...block.items, { category: '', names: null, url: null }] })}><Plus />Add credit</Button></div>;
}
