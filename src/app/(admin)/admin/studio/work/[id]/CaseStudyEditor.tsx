'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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

function splitList(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

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
    const initial = { ...study };
    delete initial.blocks;
    delete initial.created_at;
    delete initial.updated_at;
    delete initial.published_at;
    return initial;
  });
  const [blocks, setBlocks] = useState<StudioCaseStudyBlock[]>(study.blocks);
  const [saving, setSaving] = useState<boolean>(false);

  function updateDraft<K extends keyof StudyDraft>(key: K, value: StudyDraft[K]): void {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function saveStudy(nextStatus?: StudioCaseStudyStatus): Promise<void> {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/studio/case-studies/${study.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draft, status: nextStatus ?? draft.status }),
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
      <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => void saveStudy()} disabled={saving}><Save />Save draft</Button><Button type="button" onClick={() => void saveStudy('published')} disabled={saving}>{saving ? 'Saving...' : 'Publish'}</Button></div>
    </div>
    <Tabs defaultValue="overview">
      <TabsList className="h-auto w-full flex-wrap justify-start"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="media">Media</TabsTrigger><TabsTrigger value="metadata">Metadata</TabsTrigger><TabsTrigger value="story">Story</TabsTrigger><TabsTrigger value="credits">Credits</TabsTrigger><TabsTrigger value="seo">SEO</TabsTrigger></TabsList>
      <TabsContent value="overview" className="mt-6"><Card><CardContent className="grid gap-4 pt-6 md:grid-cols-2"><Field label="Title"><Input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} /></Field><Field label="Slug"><Input value={draft.slug} onChange={(event) => updateDraft('slug', event.target.value)} /></Field><Field label="Subtitle" className="md:col-span-2"><Textarea value={fieldValue(draft.subtitle)} onChange={(event) => updateDraft('subtitle', event.target.value || null)} /></Field><Field label="Client"><Input value={fieldValue(draft.client)} onChange={(event) => updateDraft('client', event.target.value || null)} /></Field><Field label="Status"><Select value={draft.status} onValueChange={(value) => updateDraft('status', value as StudioCaseStudyStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></Field></CardContent></Card></TabsContent>
      <TabsContent value="media" className="mt-6"><Card><CardContent className="grid gap-4 pt-6 md:grid-cols-2"><Field label="Cover media type"><Select value={draft.cover_media_type} onValueChange={(value) => updateDraft('cover_media_type', value as 'image' | 'video')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="image">Image</SelectItem><SelectItem value="video">Video</SelectItem></SelectContent></Select></Field><Field label="Cover URL"><Input type="url" value={fieldValue(draft.cover_url)} onChange={(event) => updateDraft('cover_url', event.target.value || null)} placeholder="https://" /></Field><Field label="Cover alt text"><Input value={fieldValue(draft.cover_alt)} onChange={(event) => updateDraft('cover_alt', event.target.value || null)} /></Field><Field label="Preview video URL"><Input type="url" value={fieldValue(draft.preview_video_url)} onChange={(event) => updateDraft('preview_video_url', event.target.value || null)} placeholder="https://" /></Field></CardContent></Card></TabsContent>
      <TabsContent value="metadata" className="mt-6"><Card><CardContent className="grid gap-4 pt-6 md:grid-cols-2"><Field label="Year"><Input value={fieldValue(draft.year)} onChange={(event) => updateDraft('year', event.target.value || null)} /></Field><Field label="Release date"><Input type="date" value={fieldValue(draft.release_date)} onChange={(event) => updateDraft('release_date', event.target.value || null)} /></Field><Field label="Display order"><Input type="number" value={draft.display_order} onChange={(event) => updateDraft('display_order', Number(event.target.value) || 0)} /></Field><Field label="Featured"><Select value={draft.is_featured ? 'yes' : 'no'} onValueChange={(value) => updateDraft('is_featured', value === 'yes')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select></Field><Field label="Tags" className="md:col-span-2"><Input value={draft.tags.join(', ')} onChange={(event) => updateDraft('tags', splitList(event.target.value))} placeholder="Identity, Strategy" /></Field><Field label="Services" className="md:col-span-2"><Input value={draft.services.join(', ')} onChange={(event) => updateDraft('services', splitList(event.target.value))} placeholder="Brand strategy, Design" /></Field><Field label="Featured in" className="md:col-span-2"><Input value={draft.featured_in.join(', ')} onChange={(event) => updateDraft('featured_in', splitList(event.target.value))} placeholder="Publication, Award" /></Field></CardContent></Card></TabsContent>
      <TabsContent value="story" className="mt-6 space-y-4"><Card><CardHeader><CardTitle>Add content block</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{(Object.keys(emptyContentByType) as StudioCaseStudyBlockType[]).map((type) => <Button key={type} type="button" variant="outline" size="sm" onClick={() => void addBlock(type)}><Plus />{blockLabels[type]}</Button>)}</CardContent></Card>{blocks.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">No story blocks yet.</p> : blocks.map((block, index) => <BlockCard key={block.id} block={block} index={index} total={blocks.length} onChange={updateBlock} onSave={saveBlock} onDelete={deleteBlock} onMove={moveBlock} />)}</TabsContent>
      <TabsContent value="credits" className="mt-6"><Card><CardContent className="space-y-4 pt-6"><p className="text-sm text-muted-foreground">Credits are managed as structured Credits blocks in the Story tab.</p><Button type="button" variant="outline" onClick={() => void addBlock('credits')}><Plus />Add credits block</Button></CardContent></Card></TabsContent>
      <TabsContent value="seo" className="mt-6"><Card><CardContent className="grid gap-4 pt-6"><Field label="SEO title"><Input value={fieldValue(draft.seo_title)} onChange={(event) => updateDraft('seo_title', event.target.value || null)} /></Field><Field label="SEO description"><Textarea value={fieldValue(draft.seo_description)} onChange={(event) => updateDraft('seo_description', event.target.value || null)} /></Field><Field label="Open Graph image URL"><Input type="url" value={fieldValue(draft.og_image_url)} onChange={(event) => updateDraft('og_image_url', event.target.value || null)} placeholder="https://" /></Field></CardContent></Card></TabsContent>
    </Tabs>
  </div>;
}

function Field({ label, className, children }: { label: string; className?: string; children: ReactElement }): ReactElement { return <label className={`grid gap-1.5 text-sm font-medium ${className ?? ''}`}>{label}{children}</label>; }

function BlockCard({ block, index, total, onChange, onSave, onDelete, onMove }: { block: StudioCaseStudyBlock; index: number; total: number; onChange: (block: StudioCaseStudyBlock) => void; onSave: (block: StudioCaseStudyBlock) => Promise<void>; onDelete: (id: string) => Promise<void>; onMove: (index: number, direction: -1 | 1) => Promise<void> }): ReactElement {
  return <Card><CardHeader className="flex-row items-center justify-between gap-3"><CardTitle className="text-base">{index + 1}. {blockLabels[block.type]}</CardTitle><div className="flex gap-1"><Button type="button" size="icon" variant="ghost" disabled={index === 0} onClick={() => void onMove(index, -1)} aria-label="Move block up"><ArrowUp /></Button><Button type="button" size="icon" variant="ghost" disabled={index === total - 1} onClick={() => void onMove(index, 1)} aria-label="Move block down"><ArrowDown /></Button><Button type="button" size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => void onDelete(block.id)} aria-label="Delete block"><Trash2 /></Button></div></CardHeader><CardContent className="space-y-4">{block.type === 'text' && <TextBlockEditor block={block} onChange={onChange} />}{block.type === 'media_row' && <MediaRowBlockEditor block={block} onChange={onChange} />}{block.type === 'video' && <VideoBlockEditor block={block} onChange={onChange} />}{block.type === 'quote' && <QuoteBlockEditor block={block} onChange={onChange} />}{block.type === 'process_notes' && <ProcessNotesBlockEditor block={block} onChange={onChange} />}{block.type === 'credits' && <CreditsBlockEditor block={block} onChange={onChange} />}<Button type="button" variant="outline" onClick={() => void onSave(block)}><Save />Save block</Button></CardContent></Card>;
}

function TextBlockEditor({ block, onChange }: BlockEditorProps<Extract<StudioCaseStudyBlock, { type: 'text' }>>): ReactElement { return <Field label="Body"><Textarea value={block.body} onChange={(event) => onChange({ ...block, body: event.target.value })} /></Field>; }
function MediaRowBlockEditor({ block, onChange }: BlockEditorProps<Extract<StudioCaseStudyBlock, { type: 'media_row' }>>): ReactElement { const updateItem = (index: number, key: 'type' | 'url' | 'alt' | 'aspectRatio', value: string): void => { const items = block.items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: key === 'type' ? value as 'image' | 'video' : value } : item); onChange({ ...block, items }); }; return <div className="space-y-4"><Field label="Layout"><Select value={block.layout} onValueChange={(value) => onChange({ ...block, layout: value as 'single' | 'pair' })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="pair">Pair</SelectItem></SelectContent></Select></Field>{block.items.map((item, index) => <div key={index} className="grid gap-3 rounded-md border p-3 md:grid-cols-4"><Select value={item.type} onValueChange={(value) => updateItem(index, 'type', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="image">Image</SelectItem><SelectItem value="video">Video</SelectItem></SelectContent></Select><Input value={item.url} onChange={(event) => updateItem(index, 'url', event.target.value)} placeholder="https://" /><Input value={item.alt} onChange={(event) => updateItem(index, 'alt', event.target.value)} placeholder="Alt text" /><Input value={item.aspectRatio} onChange={(event) => updateItem(index, 'aspectRatio', event.target.value)} placeholder="3/2" /></div>)}<Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...block, items: [...block.items, { type: 'image', url: '', alt: '', aspectRatio: '3/2' }] })}><Plus />Add media</Button></div>; }
function VideoBlockEditor({ block, onChange }: BlockEditorProps<Extract<StudioCaseStudyBlock, { type: 'video' }>>): ReactElement { return <div className="grid gap-4"><Field label="Video URL"><Input type="url" value={block.url} onChange={(event) => onChange({ ...block, url: event.target.value })} placeholder="https://" /></Field><Field label="Cover URL"><Input type="url" value={fieldValue(block.coverUrl)} onChange={(event) => onChange({ ...block, coverUrl: event.target.value || null })} placeholder="https://" /></Field><Field label="Caption"><Input value={fieldValue(block.caption)} onChange={(event) => onChange({ ...block, caption: event.target.value || null })} /></Field></div>; }
function QuoteBlockEditor({ block, onChange }: BlockEditorProps<Extract<StudioCaseStudyBlock, { type: 'quote' }>>): ReactElement { return <div className="grid gap-4"><Field label="Quote"><Textarea value={block.quote} onChange={(event) => onChange({ ...block, quote: event.target.value })} /></Field><Field label="Name"><Input value={fieldValue(block.name)} onChange={(event) => onChange({ ...block, name: event.target.value || null })} /></Field><Field label="Role"><Input value={fieldValue(block.role)} onChange={(event) => onChange({ ...block, role: event.target.value || null })} /></Field></div>; }
function ProcessNotesBlockEditor({ block, onChange }: BlockEditorProps<Extract<StudioCaseStudyBlock, { type: 'process_notes' }>>): ReactElement { const updateImage = (index: number, key: 'url' | 'alt', value: string): void => onChange({ ...block, images: block.images.map((image, imageIndex) => imageIndex === index ? { ...image, [key]: value } : image) }); return <div className="space-y-4"><Field label="Orientation"><Select value={block.orientation} onValueChange={(value) => onChange({ ...block, orientation: value as 'horizontal' | 'vertical' })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="horizontal">Horizontal</SelectItem><SelectItem value="vertical">Vertical</SelectItem></SelectContent></Select></Field><Field label="Title"><Input value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} /></Field><Field label="Body"><Textarea value={block.body} onChange={(event) => onChange({ ...block, body: event.target.value })} /></Field>{block.images.map((image, index) => <div key={index} className="grid gap-3 rounded-md border p-3 md:grid-cols-2"><Input value={image.url} onChange={(event) => updateImage(index, 'url', event.target.value)} placeholder="https://" /><Input value={image.alt} onChange={(event) => updateImage(index, 'alt', event.target.value)} placeholder="Alt text" /></div>)}<Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...block, images: [...block.images, { url: '', alt: '' }] })}><Plus />Add image</Button></div>; }
function CreditsBlockEditor({ block, onChange }: BlockEditorProps<Extract<StudioCaseStudyBlock, { type: 'credits' }>>): ReactElement { const updateItem = (index: number, key: 'category' | 'names' | 'url', value: string): void => onChange({ ...block, items: block.items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: key === 'category' ? value : value || null } : item) }); return <div className="space-y-4">{block.items.map((item, index) => <div key={index} className="grid gap-3 rounded-md border p-3 md:grid-cols-3"><Input value={item.category} onChange={(event) => updateItem(index, 'category', event.target.value)} placeholder="Category" /><Input value={fieldValue(item.names)} onChange={(event) => updateItem(index, 'names', event.target.value)} placeholder="Names" /><Input type="url" value={fieldValue(item.url)} onChange={(event) => updateItem(index, 'url', event.target.value)} placeholder="https://" /></div>)}<Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...block, items: [...block.items, { category: '', names: null, url: null }] })}><Plus />Add credit</Button></div>; }
