'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Copy, ExternalLink, Film, MessageSquare, Plus, Redo, Save, Trash2, Type, Undo, Upload, X } from 'lucide-react';
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
import type { StudioCaseStudyAdminDetail, StudioCaseStudyBlock, StudioCaseStudyBlockType, StudioCaseStudyStatus, StudioCaseStudyTopic } from '@/lib/studio/case-study-schema';
import StoryCanvas from './StoryCanvas';

type CaseStudyEditorProps = { study: StudioCaseStudyAdminDetail };
type StudyDraft = Omit<StudioCaseStudyAdminDetail, 'blocks' | 'topics' | 'created_at' | 'updated_at' | 'published_at'>;
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

function contentForBlock(block: StudioCaseStudyBlock): Record<string, unknown> {
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
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') ?? 'overview';
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
  const [topics, setTopics] = useState<StudioCaseStudyTopic[]>(study.topics ?? []);
  const [activeTopic, setActiveTopic] = useState<string | null>(() => (study.topics ?? [])[0]?.id ?? null);
  const [saving, setSaving] = useState<boolean>(false);

  // ── undo / redo ────────────────────────────────────────────────────────────
  const historyRef = useRef<StudioCaseStudyBlock[][]>([study.blocks]);
  const pointerRef = useRef<number>(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pushHistory = useCallback((next: StudioCaseStudyBlock[]): void => {
    const pointer = pointerRef.current;
    const trimmed = historyRef.current.slice(0, pointer + 1);
    trimmed.push(next);
    if (trimmed.length > 100) trimmed.shift();
    historyRef.current = trimmed;
    pointerRef.current = trimmed.length - 1;
    setCanUndo(trimmed.length > 1);
    setCanRedo(false);
  }, []);

  const undo = useCallback((): void => {
    if (pointerRef.current <= 0) return;
    pointerRef.current -= 1;
    const snapshot = historyRef.current[pointerRef.current];
    setBlocks(snapshot);
    setCanUndo(pointerRef.current > 0);
    setCanRedo(true);
  }, []);

  const redo = useCallback((): void => {
    if (pointerRef.current >= historyRef.current.length - 1) return;
    pointerRef.current += 1;
    const snapshot = historyRef.current[pointerRef.current];
    setBlocks(snapshot);
    setCanUndo(true);
    setCanRedo(pointerRef.current < historyRef.current.length - 1);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (mod && e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
      if (mod && e.key === 'y') { e.preventDefault(); redo(); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  function updateDraft<K extends keyof StudyDraft>(key: K, value: StudyDraft[K]): void {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateListField(key: keyof CaseStudyListFields, value: string): void {
    setListFields((current) => ({ ...current, [key]: value }));
  }

  function setBlocksWithHistory(updater: StudioCaseStudyBlock[] | ((prev: StudioCaseStudyBlock[]) => StudioCaseStudyBlock[])): void {
    setBlocks((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      pushHistory(next);
      return next;
    });
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
    setBlocksWithHistory((current) => current.map((block) => block.id === nextBlock.id ? nextBlock : block));
  }

  async function addBlock(type: StudioCaseStudyBlockType, contentOverride?: Record<string, unknown>, topicId?: string | null): Promise<void> {
    const content = contentOverride ?? emptyContentByType[type];
    try {
      const res = await fetch(`/api/admin/studio/case-studies/${study.id}/blocks`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, content, topic_id: topicId ?? null }),
      });
      const data = await res.json().catch((): { data?: { id: string; sort_order: number } & Record<string, unknown>; error?: string } => ({}));
      if (!res.ok || !data.data) { toast.error(data.error ?? 'Failed to add block'); return; }
      const newBlock = { id: data.data.id, sort_order: data.data.sort_order, type, ...content } as StudioCaseStudyBlock;
      setBlocksWithHistory((current) => [...current, newBlock]);
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
      setBlocksWithHistory((current) => [...current, duplicate]);
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
      setBlocksWithHistory((current) => current.filter((block) => block.id !== blockId));
      toast.success('Block deleted'); router.refresh();
    } catch { toast.error('Failed to delete block'); }
  }

  async function moveBlock(index: number, direction: -1 | 1): Promise<void> {
    const destination = index + direction;
    if (destination < 0 || destination >= blocks.length) return;
    const reordered = [...blocks];
    [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
    const ordered = reordered.map((block, sortOrder) => ({ ...block, sort_order: sortOrder }));
    setBlocksWithHistory(ordered);
    try {
      const res = await fetch(`/api/admin/studio/case-studies/${study.id}/blocks/reorder`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderedIds: ordered.map((block) => block.id) }),
      });
      const data = await res.json().catch((): { error?: string } => ({}));
      if (!res.ok) { setBlocksWithHistory(blocks); toast.error(data.error ?? 'Failed to reorder blocks'); return; }
      toast.success('Block order updated'); router.refresh();
    } catch { setBlocksWithHistory(blocks); toast.error('Failed to reorder blocks'); }
  }

  async function addTopic(title: string): Promise<void> {
    const res = await fetch(`/api/admin/studio/case-studies/${study.id}/topics`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }),
    });
    const data = await res.json().catch((): { data?: StudioCaseStudyTopic; error?: string } => ({}));
    if (!res.ok || !data.data) { toast.error(data.error ?? 'Failed to add topic'); return; }
    if (topics.length === 0) setActiveTopic(data.data.id);
    setTopics((curr) => [...curr, data.data!]);
  }

  async function deleteTopic(id: string): Promise<void> {
    const res = await fetch(`/api/admin/studio/case-studies/${study.id}/topics/${id}`, { method: 'DELETE' });
    const data = await res.json().catch((): { error?: string } => ({}));
    if (!res.ok) { toast.error(data.error ?? 'Failed to delete topic'); return; }
    const remaining = topics.filter((t) => t.id !== id);
    setTopics(remaining);
    if (activeTopic === id) setActiveTopic(remaining[0]?.id ?? null);
  }

  async function renameTopic(id: string, title: string): Promise<void> {
    const res = await fetch(`/api/admin/studio/case-studies/${study.id}/topics/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }),
    });
    const data = await res.json().catch((): { error?: string } => ({}));
    if (!res.ok) { toast.error(data.error ?? 'Failed to rename topic'); return; }
    setTopics((curr) => curr.map((t) => t.id === id ? { ...t, title } : t));
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div><Button asChild variant="ghost" size="sm" className="mb-2 -ml-3"><Link href="/admin/studio/work"><ArrowLeft />Back to work</Link></Button><h1 className="text-2xl font-semibold">{study.title}</h1><p className="mt-1 text-sm text-muted-foreground">Edit case study content and publishing details.</p></div>
      <div className="flex flex-wrap gap-2">{study.status === 'published' ? <Button asChild type="button" variant="outline"><a href={`/studio/work/${study.slug}`} target="_blank" rel="noreferrer"><ExternalLink />View live</a></Button> : null}<Button type="button" variant="outline" onClick={() => void saveStudy()} disabled={saving}><Save />Save</Button><Button type="button" onClick={() => void saveStudy('published')} disabled={saving}>{saving ? 'Saving...' : 'Publish'}</Button></div>
    </div>
    <Tabs defaultValue={defaultTab}>
      <TabsList className="h-auto w-full flex-wrap justify-start"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="media">Media</TabsTrigger><TabsTrigger value="metadata">Metadata</TabsTrigger><TabsTrigger value="story">Story</TabsTrigger><TabsTrigger value="credits">Credits</TabsTrigger><TabsTrigger value="seo">SEO</TabsTrigger></TabsList>
      <TabsContent value="overview" className="mt-6"><Card><CardContent className="grid gap-4 pt-6 md:grid-cols-2"><Field label="Title"><Input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} /></Field><Field label="Slug"><Input value={draft.slug} onChange={(event) => updateDraft('slug', event.target.value)} /></Field><Field label="Subtitle" className="md:col-span-2"><Textarea value={fieldValue(draft.subtitle)} onChange={(event) => updateDraft('subtitle', event.target.value || null)} /></Field><Field label="Client"><Input value={fieldValue(draft.client)} onChange={(event) => updateDraft('client', event.target.value || null)} /></Field><Field label="Status"><Select value={draft.status} onValueChange={(value) => updateDraft('status', value as StudioCaseStudyStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></Field></CardContent></Card></TabsContent>
      <TabsContent value="media" className="mt-6"><Card><CardContent className="grid gap-4 pt-6 md:grid-cols-2"><Field label="Hero media type"><Select value={draft.cover_media_type} onValueChange={(value) => updateDraft('cover_media_type', value as 'image' | 'video')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="image">Cover image</SelectItem><SelectItem value="video">Preview video</SelectItem></SelectContent></Select></Field><Field label="Cover image URL"><Input type="url" value={fieldValue(draft.cover_url)} onChange={(event) => updateDraft('cover_url', event.target.value || null)} placeholder="https://" /></Field><Field label="Cover alt text"><Input value={fieldValue(draft.cover_alt)} onChange={(event) => updateDraft('cover_alt', event.target.value || null)} /></Field><Field label="Preview video URL"><Input type="url" value={fieldValue(draft.preview_video_url)} onChange={(event) => updateDraft('preview_video_url', event.target.value || null)} placeholder="Vimeo or direct HTTPS video URL" /></Field></CardContent></Card></TabsContent>
      <TabsContent value="metadata" className="mt-6"><Card><CardContent className="grid gap-4 pt-6 md:grid-cols-2"><Field label="Year"><Input value={fieldValue(draft.year)} onChange={(event) => updateDraft('year', event.target.value || null)} /></Field><Field label="Release date"><Input type="date" value={fieldValue(draft.release_date)} onChange={(event) => updateDraft('release_date', event.target.value || null)} /></Field><Field label="Display order"><Input type="number" value={draft.display_order} onChange={(event) => updateDraft('display_order', Number(event.target.value) || 0)} /></Field><Field label="Featured"><Select value={draft.is_featured ? 'yes' : 'no'} onValueChange={(value) => updateDraft('is_featured', value === 'yes')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select></Field><Field label="Tags" className="md:col-span-2"><Input value={listFields.tags} onChange={(event) => updateListField('tags', event.target.value)} placeholder="Identity, Strategy" /></Field><Field label="Services" className="md:col-span-2"><Input value={listFields.services} onChange={(event) => updateListField('services', event.target.value)} placeholder="Brand strategy, Design" /></Field><Field label="Featured in" className="md:col-span-2"><Input value={listFields.featured_in} onChange={(event) => updateListField('featured_in', event.target.value)} placeholder="Publication, Award" /></Field></CardContent></Card></TabsContent>
      <TabsContent value="story" className="mt-0 p-0">
        <StudioCanvas
          study={draft}
          studyId={study.id}
          blocks={blocks}
          saving={saving}
          topics={topics}
          activeTopic={activeTopic}
          onAdd={addBlock}
          onSave={() => saveStudy()}
          onBlockAdded={(b) => setBlocksWithHistory((curr) => [...curr, b])}
          onBlockUpdated={(b) => setBlocksWithHistory((curr) => curr.map((x) => x.id === b.id ? b : x))}
          onBlockDeleted={(id) => setBlocksWithHistory((curr) => curr.filter((x) => x.id !== id))}
          onBlocksReordered={setBlocksWithHistory}
          onTopicChange={setActiveTopic}
          onTopicAdd={addTopic}
          onTopicDelete={deleteTopic}
          onTopicRename={renameTopic}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
        />
      </TabsContent>
      <TabsContent value="credits" className="mt-6"><Card><CardContent className="space-y-4 pt-6"><p className="text-sm text-muted-foreground">Credits are managed as structured Credits blocks in the Story tab.</p><Button type="button" variant="outline" onClick={() => void addBlock('credits')}><Plus />Add credits block</Button></CardContent></Card></TabsContent>
      <TabsContent value="seo" className="mt-6"><Card><CardContent className="grid gap-4 pt-6"><Field label="SEO title"><Input value={fieldValue(draft.seo_title)} onChange={(event) => updateDraft('seo_title', event.target.value || null)} /></Field><Field label="SEO description"><Textarea value={fieldValue(draft.seo_description)} onChange={(event) => updateDraft('seo_description', event.target.value || null)} /></Field><Field label="Open Graph image URL"><Input type="url" value={fieldValue(draft.og_image_url)} onChange={(event) => updateDraft('og_image_url', event.target.value || null)} placeholder="https://" /></Field></CardContent></Card></TabsContent>
    </Tabs>
  </div>;
}

type UploadedFile = { url: string; mediaType: 'image' | 'video'; name: string };

function StudioCanvas({
  study,
  studyId,
  blocks,
  saving,
  topics,
  activeTopic,
  onAdd,
  onSave,
  onBlockAdded,
  onBlockUpdated,
  onBlockDeleted,
  onBlocksReordered,
  onTopicChange,
  onTopicAdd,
  onTopicDelete,
  onTopicRename,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: {
  study: StudyDraft;
  studyId: string;
  blocks: StudioCaseStudyBlock[];
  saving: boolean;
  topics: StudioCaseStudyTopic[];
  activeTopic: string | null;
  onAdd: (type: StudioCaseStudyBlockType, content?: Record<string, unknown>, topicId?: string | null) => Promise<void>;
  onSave: () => Promise<void>;
  onBlockAdded: (block: StudioCaseStudyBlock) => void;
  onBlockUpdated: (block: StudioCaseStudyBlock) => void;
  onBlockDeleted: (id: string) => void;
  onBlocksReordered: (blocks: StudioCaseStudyBlock[]) => void;
  onTopicChange: (id: string | null) => void;
  onTopicAdd: (title: string) => Promise<void>;
  onTopicDelete: (id: string) => Promise<void>;
  onTopicRename: (id: string, title: string) => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}): ReactElement {
  const [open, setOpen] = useState(false);
  const bottomFileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadLabel, setUploadLabel] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const progressRef = useRef(0);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newTopicInput, setNewTopicInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (!uploading) { progressRef.current = 0; setUploadProgress(0); return; }
    const ceiling = uploadLabel.startsWith('Uploading') ? 62 : 91;
    progressTimerRef.current = setInterval(() => {
      const cur = progressRef.current;
      const next = Math.min(cur + (ceiling - cur) * 0.045 + 0.25, ceiling);
      progressRef.current = next;
      setUploadProgress(Math.round(next));
    }, 40);
    return () => { if (progressTimerRef.current) clearInterval(progressTimerRef.current); };
  }, [uploading, uploadLabel]);

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const projectName = study.client || study.title || 'Project Name';
  const category = study.tags[0] ?? study.services[0] ?? null;
  const year = study.year ?? null;

  const topicBlocks = activeTopic != null ? blocks.filter((b) => b.topic_id === activeTopic) : blocks;
  const otherBlocks = activeTopic != null ? blocks.filter((b) => b.topic_id !== activeTopic) : [];

  async function handleFiles(fileList: FileList | File[]): Promise<void> {
    const files = Array.from(fileList);
    if (!files.length) return;
    setUploading(true);
    setUploadLabel(`Uploading ${files.length} file${files.length !== 1 ? 's' : ''}…`);
    try {
      const formData = new FormData();
      for (const file of files) formData.append('files', file);
      const res = await fetch(`/api/admin/studio/case-studies/${studyId}/upload`, {
        method: 'POST', body: formData,
      });
      const data = await res.json().catch((): { files?: UploadedFile[]; error?: string } => ({})) as { files?: UploadedFile[]; error?: string };
      if (!res.ok) { toast.error(data.error ?? 'Upload failed'); return; }
      const uploaded = data.files ?? [];
      const images = uploaded.filter((f) => f.mediaType === 'image');
      const videos = uploaded.filter((f) => f.mediaType === 'video');
      setUploadLabel('Creating blocks…');
      for (let i = 0; i < images.length; i += 2) {
        const batch = images.slice(i, i + 2);
        await onAdd('media_row', {
          layout: batch.length === 2 ? 'pair' : 'single',
          items: batch.map((f) => ({ type: 'image', url: f.url, alt: f.name.replace(/\.[^.]+$/, ''), aspectRatio: '3/2' })),
        }, activeTopic);
      }
      for (const video of videos) {
        await onAdd('video', { url: video.url, coverUrl: null, caption: null }, activeTopic);
      }
      toast.success(`${uploaded.length} file${uploaded.length !== 1 ? 's' : ''} added`);
    } catch { toast.error('Upload failed'); } finally { setUploading(false); setUploadLabel(''); }
  }

  function onDragOver(e: React.DragEvent): void { e.preventDefault(); setIsDragging(true); }
  function onDragLeave(e: React.DragEvent): void {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  }
  function onDrop(e: React.DragEvent): void { e.preventDefault(); setIsDragging(false); void handleFiles(e.dataTransfer.files); }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#18191a', display: 'flex', flexDirection: 'column', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>

      {/* Upload loading overlay */}
      {uploading && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(15,17,18,0.88)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, border: '3px solid rgba(167,210,82,0.25)', borderTopColor: '#a7d252', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
          <p style={{ color: '#ebefe0', fontSize: 15, margin: 0, letterSpacing: '-0.01em' }}>{uploadLabel}</p>
          <p style={{ color: '#a7d252', fontSize: 36, fontWeight: 700, margin: 0, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{uploadProgress}%</p>
        </div>
      )}

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#18191a', flexShrink: 0 }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>Aorthar</span>
        <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button type="button" onClick={onUndo} disabled={!canUndo}
              title="Undo (⌘Z)"
              style={{ background: 'none', border: 'none', borderRadius: 0, cursor: canUndo ? 'pointer' : 'default', color: canUndo ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)', padding: 0, display: 'flex' }}>
              <Undo size={16} />
            </button>
            <button type="button" onClick={onRedo} disabled={!canRedo}
              title="Redo (⌘⇧Z)"
              style={{ background: 'none', border: 'none', borderRadius: 0, cursor: canRedo ? 'pointer' : 'default', color: canRedo ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)', padding: 0, display: 'flex' }}>
              <Redo size={16} />
            </button>
          </div>
          <Link href={`/admin/studio/work/${studyId}/preview`} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textDecoration: 'none' }}>Preview</Link>
          <button type="button" disabled={saving} onClick={() => void onSave()}
            style={{ background: 'none', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 14, padding: 0 }}>
            {saving ? 'Saving…' : 'Save as draft'}
          </button>
          <Link href="/admin/studio/work" style={{ color: '#a7d252', fontSize: 14, textDecoration: 'none' }}>Close</Link>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

        {/* Left sidebar */}
        <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Project header */}
          <div style={{ padding: '40px 16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: '#fff', fontSize: 18, margin: '0 0 6px', lineHeight: 1.2, fontWeight: 600 }}>{projectName}</p>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
              {category && <span style={{ color: '#989898', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{category}</span>}
              {category && year && <span style={{ width: 2, height: 2, borderRadius: '50%', background: '#989898', flexShrink: 0 }} />}
              {year && <span style={{ color: '#989898', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{year}</span>}
            </div>
          </div>

          {/* Topics navigation */}
          <div style={{ flex: 1, paddingTop: 16 }}>
            <p style={{ color: '#555', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px', padding: '0 16px', fontWeight: 600 }}>Topics</p>
            {topics.map((topic) => (
              <div key={topic.id}
                onClick={() => onTopicChange(topic.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onTopicChange(topic.id); }}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 16px', cursor: 'pointer', background: activeTopic === topic.id ? 'rgba(167,210,82,0.08)' : 'transparent', borderLeft: `2px solid ${activeTopic === topic.id ? '#a7d252' : 'transparent'}` }}>
                {renamingId === topic.id
                  ? <input autoFocus defaultValue={topic.title}
                      style={{ flex: 1, background: 'none', border: 'none', borderBottom: '1px solid #a7d252', outline: 'none', color: '#ebefe0', fontSize: 14, padding: 0, fontFamily: 'inherit', minWidth: 0 }}
                      onBlur={(e) => { void onTopicRename(topic.id, e.target.value.trim() || topic.title); setRenamingId(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setRenamingId(null); }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  : <>
                      <span style={{ flex: 1, color: activeTopic === topic.id ? '#ebefe0' : '#989898', fontSize: 14, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        onDoubleClick={(e) => { e.stopPropagation(); setRenamingId(topic.id); }}>
                        {topic.title}
                      </span>
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); void onTopicDelete(topic.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: '2px', display: 'flex', flexShrink: 0, lineHeight: 1 }}>
                        <X size={11} />
                      </button>
                    </>
                }
              </div>
            ))}
            {topics.length === 0 && !addingNew && (
              <p style={{ color: '#3a3a3a', fontSize: 13, margin: 0, padding: '4px 16px' }}>No topics yet</p>
            )}
            {addingNew
              ? <div style={{ padding: '6px 16px' }}>
                  <input autoFocus value={newTopicInput} onChange={(e) => setNewTopicInput(e.target.value)}
                    placeholder="Topic name"
                    style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid #a7d252', outline: 'none', color: '#ebefe0', fontSize: 14, padding: '2px 0', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTopicInput.trim()) { void onTopicAdd(newTopicInput.trim()); setNewTopicInput(''); setAddingNew(false); }
                      if (e.key === 'Escape') { setNewTopicInput(''); setAddingNew(false); }
                    }}
                    onBlur={() => { if (newTopicInput.trim()) void onTopicAdd(newTopicInput.trim()); setNewTopicInput(''); setAddingNew(false); }}
                  />
                </div>
              : <button type="button" onClick={() => setAddingNew(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a7d252', fontSize: 14, margin: 0, textAlign: 'left', padding: '7px 16px', width: '100%', fontFamily: 'inherit' }}>
                  + Add Topic
                </button>
            }
          </div>
        </div>

        {/* Canvas area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}
            onDragOver={topicBlocks.length === 0 ? onDragOver : undefined}
            onDragLeave={topicBlocks.length === 0 ? onDragLeave : undefined}
            onDrop={topicBlocks.length === 0 ? onDrop : undefined}
          >
            {topicBlocks.length === 0 ? (
              /* ── Empty state: upload zone ── */
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 48px 48px 40px' }}>
                <div style={{
                  width: '100%', maxWidth: 600, aspectRatio: '16/9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDragging ? 'rgba(167,210,82,0.06)' : 'rgba(72,72,72,0.25)',
                  border: isDragging ? '2px dashed #a7d252' : '2px dashed transparent',
                  transition: 'all 0.15s',
                }}>
                  <input ref={fileInputRef} type="file" multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
                    style={{ display: 'none' }}
                    onChange={(e) => { if (e.target.files) void handleFiles(e.target.files); e.target.value = ''; }}
                  />
                  <div role="button" tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                    style={{ border: `2px dashed ${isDragging ? '#a7d252' : '#484848'}`, padding: '24px 32px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}>
                    <p style={{ color: '#ebefe0', fontSize: 13, margin: 0, lineHeight: '20px', whiteSpace: 'pre-line' }}>
                      {isDragging ? 'Drop files here' : 'Drag and drop your files here\nor click to upload'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Has blocks: visual canvas ── */
              <StoryCanvas
                studyId={studyId}
                topicId={activeTopic}
                blocks={topicBlocks}
                onBlockAdded={onBlockAdded}
                onBlockUpdated={onBlockUpdated}
                onBlockDeleted={onBlockDeleted}
                onBlocksReordered={(reordered) => onBlocksReordered([...reordered, ...otherBlocks])}
              />
            )}
          </div>

          {/* Fixed-bottom add block bar */}
          <div style={{ flexShrink: 0, position: 'relative', borderTop: '1px solid #2a2a2a' }}>
            <input ref={bottomFileRef} type="file" multiple
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
              style={{ display: 'none' }}
              onChange={(e) => { if (e.target.files) void handleFiles(e.target.files); if (e.target) e.target.value = ''; setOpen(false); }}
            />
            {open && (
              <div style={{ position: 'absolute', bottom: 'calc(100% + 4px)', left: '50%', transform: 'translateX(-50%)', zIndex: 30 }}>
                <div style={{ background: '#18191a', border: '1px solid #2a2a2a', padding: 6, display: 'flex', gap: 4, boxShadow: '0 -4px 16px rgba(0,0,0,0.4)' }}>
                  {[
                    { icon: <Upload size={14} color="#a7d252" />, label: 'Upload', action: () => { bottomFileRef.current?.click(); } },
                    { icon: <Type size={14} />, label: 'Text', action: () => { void onAdd('text', undefined, activeTopic); setOpen(false); } },
                    { icon: <Film size={14} />, label: 'Video', action: () => { void onAdd('video', undefined, activeTopic); setOpen(false); } },
                    { icon: <MessageSquare size={14} />, label: 'Quote', action: () => { void onAdd('quote', undefined, activeTopic); setOpen(false); } },
                  ].map((btn) => (
                    <button key={btn.label} type="button" onClick={btn.action}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a2a', padding: '8px 12px', cursor: 'pointer', color: '#ebefe0', fontSize: 11 }}>
                      <span style={{ color: '#6b6b6b' }}>{btn.icon}</span>{btn.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px' }}>
              <div style={{ flex: 1, height: 1, background: '#2a2a2a' }} />
              <button type="button" onClick={() => setOpen((v) => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a7d252', fontSize: 13, fontWeight: 400, padding: 0, whiteSpace: 'nowrap' }}>
                + add block <span style={{ opacity: 0.5 }}>/</span>
              </button>
              <div style={{ flex: 1, height: 1, background: '#2a2a2a' }} />
            </div>
          </div>

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
