'use client';

import { useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { toast } from 'sonner';
import { GripVertical, Plus, Trash2, Upload, Type, Film, Quote, X, Move } from 'lucide-react';
import type { ReactElement } from 'react';
import type { StudioCaseStudyBlock, StudioCaseStudyBlockType } from '@/lib/studio/case-study-schema';

// ─── constants ─────────────────────────────────────────────────────────────────

const CANVAS_BG = '#0f1112';
const BLOCK_BG = '#18191a';
const BORDER = '#2a2a2a';
const TEXT_PRIMARY = '#ebefe0';
const TEXT_MUTED = '#6b6b6b';
const ACCENT = '#a7d252';

// ─── types ─────────────────────────────────────────────────────────────────────

type MediaItem = {
  type: 'image' | 'video';
  url: string;
  alt: string;
  aspectRatio: string;
  objectPosition?: string;
};

type ImgDragSrc = { blockId: string; idx: number } | null;
type UploadedFile = { url: string; mediaType: 'image' | 'video'; name: string };

// ─── API helpers ───────────────────────────────────────────────────────────────

async function apiUpload(studyId: string, files: File[]): Promise<UploadedFile[]> {
  const fd = new FormData();
  for (const f of files) fd.append('files', f);
  const res = await fetch(`/api/admin/studio/case-studies/${studyId}/upload`, { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({})) as { files?: UploadedFile[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Upload failed');
  return data.files ?? [];
}

async function apiCreateBlock(
  studyId: string,
  type: StudioCaseStudyBlockType,
  content: Record<string, unknown>,
): Promise<StudioCaseStudyBlock> {
  const res = await fetch(`/api/admin/studio/case-studies/${studyId}/blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, content }),
  });
  const data = await res.json().catch(() => ({})) as { data?: Record<string, unknown>; error?: string };
  if (!res.ok || !data.data) throw new Error(data.error ?? 'Failed to create block');
  return { id: data.data.id as string, sort_order: data.data.sort_order as number, type, ...content } as StudioCaseStudyBlock;
}

async function apiPatchBlock(studyId: string, block: StudioCaseStudyBlock): Promise<void> {
  const res = await fetch(`/api/admin/studio/case-studies/${studyId}/blocks/${block.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: block.type, content: blockToContent(block) }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(d.error ?? 'Save failed');
  }
}

async function apiDeleteBlock(studyId: string, blockId: string): Promise<void> {
  const res = await fetch(`/api/admin/studio/case-studies/${studyId}/blocks/${blockId}`, { method: 'DELETE' });
  if (!res.ok) {
    const d = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(d.error ?? 'Delete failed');
  }
}

async function apiReorder(studyId: string, orderedIds: string[]): Promise<void> {
  const res = await fetch(`/api/admin/studio/case-studies/${studyId}/blocks/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(d.error ?? 'Reorder failed');
  }
}

function blockToContent(block: StudioCaseStudyBlock): Record<string, unknown> {
  switch (block.type) {
    case 'text': return { body: block.body };
    case 'media_row': return { layout: block.layout, items: block.items };
    case 'video': return { url: block.url, coverUrl: block.coverUrl, caption: block.caption };
    case 'quote': return { quote: block.quote, name: block.name, role: block.role };
    case 'process_notes': return { orientation: block.orientation, title: block.title, body: block.body, images: block.images };
    case 'credits': return { items: block.items };
  }
}

// ─── SortableBlock ─────────────────────────────────────────────────────────────

function SortableBlock({
  block,
  onDelete,
  children,
}: {
  block: StudioCaseStudyBlock;
  onDelete: () => void;
  children: ReactElement;
}): ReactElement {
  const [hovered, setHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  return (
    <div
      ref={setNodeRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 }}
    >
      <div
        {...attributes}
        {...listeners}
        style={{ position: 'absolute', left: -32, top: '50%', transform: 'translateY(-50%)', opacity: hovered ? 1 : 0, transition: 'opacity 0.15s', cursor: 'grab', color: TEXT_MUTED, padding: '4px 2px', display: 'flex' }}
      >
        <GripVertical size={16} />
      </div>

      <button
        type="button"
        onClick={onDelete}
        style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s', background: 'rgba(0,0,0,0.7)', border: '1px solid #3a3a3a', color: '#e55', cursor: 'pointer', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
      >
        <Trash2 size={11} /> Delete
      </button>

      {children}
    </div>
  );
}

// ─── MediaBlock ────────────────────────────────────────────────────────────────

function MediaBlock({
  block,
  studyId,
  onUpdated,
  onDeleted,
  imgDragSrc,
  onImgDragStart,
  onImgDragEnd,
  onImgDrop,
}: {
  block: Extract<StudioCaseStudyBlock, { type: 'media_row' }>;
  studyId: string;
  onUpdated: (b: StudioCaseStudyBlock) => void;
  onDeleted: (id: string) => void;
  imgDragSrc: ImgDragSrc;
  onImgDragStart: (blockId: string, idx: number) => void;
  onImgDragEnd: () => void;
  onImgDrop: (targetBlockId: string, side: 'left' | 'right') => void;
}): ReactElement {
  const [uploading, setUploading] = useState(false);
  const [dropSide, setDropSide] = useState<'left' | 'right' | null>(null);
  const [cropIdx, setCropIdx] = useState<number | null>(null);
  const [livePos, setLivePos] = useState<Record<number, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const cropRef = useRef<{ startX: number; startY: number; px: number; py: number } | null>(null);

  // Is this block a valid drop target?
  const isDropTarget = imgDragSrc !== null
    && imgDragSrc.blockId !== block.id
    && block.items.length < 2;

  function getObjectPos(idx: number): string {
    return livePos[idx] ?? block.items[idx]?.objectPosition ?? '50% 50%';
  }

  // ── crop / position drag ─────────────────────────────────────────────────

  function startCrop(e: React.MouseEvent, idx: number): void {
    e.preventDefault();
    e.stopPropagation();
    const pos = getObjectPos(idx);
    const parts = pos.split(' ');
    const px = parseFloat(parts[0] ?? '50');
    const py = parseFloat(parts[1] ?? '50');
    cropRef.current = { startX: e.clientX, startY: e.clientY, px, py };
    setCropIdx(idx);

    function onMove(ev: MouseEvent): void {
      if (!cropRef.current) return;
      const dx = ev.clientX - cropRef.current.startX;
      const dy = ev.clientY - cropRef.current.startY;
      const nx = Math.max(0, Math.min(100, cropRef.current.px - dx * 0.4));
      const ny = Math.max(0, Math.min(100, cropRef.current.py - dy * 0.4));
      setLivePos((prev) => ({ ...prev, [idx]: `${nx.toFixed(1)}% ${ny.toFixed(1)}%` }));
    }

    async function onUp(): Promise<void> {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (!cropRef.current) return;
      cropRef.current = null;
      setCropIdx(null);
      // Save position
      setLivePos((prev) => {
        const finalPos = prev[idx];
        if (finalPos !== undefined) {
          const newItems = block.items.map((item, i) =>
            i === idx ? { ...item, objectPosition: finalPos } : item
          );
          const updated: Extract<StudioCaseStudyBlock, { type: 'media_row' }> = { ...block, items: newItems };
          void apiPatchBlock(studyId, updated)
            .then(() => onUpdated(updated))
            .catch((err: unknown) => toast.error(err instanceof Error ? err.message : 'Save failed'));
        }
        return {};
      });
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // ── add paired image ─────────────────────────────────────────────────────

  async function addImage(files: FileList | null): Promise<void> {
    if (!files?.length || block.items.length >= 2) return;
    setUploading(true);
    try {
      const uploaded = await apiUpload(studyId, [files[0]]);
      if (!uploaded.length) return;
      const newItem: MediaItem = { type: 'image', url: uploaded[0].url, alt: '', aspectRatio: '3/2' };
      const updated: Extract<StudioCaseStudyBlock, { type: 'media_row' }> = { ...block, layout: 'pair', items: [...block.items, newItem] };
      await apiPatchBlock(studyId, updated);
      onUpdated(updated);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setUploading(false); }
  }

  // ── remove image ─────────────────────────────────────────────────────────

  async function removeItem(index: number): Promise<void> {
    if (block.items.length === 1) {
      try { await apiDeleteBlock(studyId, block.id); onDeleted(block.id); }
      catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
      return;
    }
    const items = block.items.filter((_, i) => i !== index);
    const updated: Extract<StudioCaseStudyBlock, { type: 'media_row' }> = { ...block, layout: 'single', items };
    try { await apiPatchBlock(studyId, updated); onUpdated(updated); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  }

  // ── drag-over helpers ─────────────────────────────────────────────────────

  function onDragOver(e: React.DragEvent, side: 'left' | 'right'): void {
    if (!isDropTarget) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropSide(side);
  }

  function onDragLeave(e: React.DragEvent): void {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropSide(null);
  }

  function onDrop(e: React.DragEvent, side: 'left' | 'right'): void {
    e.preventDefault();
    setDropSide(null);
    onImgDrop(block.id, side);
  }

  return (
    <div style={{ background: BLOCK_BG, position: 'relative' }}>
      <div style={{ display: 'flex', gap: 2, minHeight: 280 }}>
        {block.items.map((item, idx) => (
          <div key={idx} style={{ flex: 1, position: 'relative', background: '#080808', overflow: 'hidden' }}>
            {item.url
              ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.alt}
                      draggable={cropIdx !== idx}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        onImgDragStart(block.id, idx);
                      }}
                      onDragEnd={onImgDragEnd}
                      style={{
                        width: '100%',
                        height: '100%',
                        minHeight: 280,
                        objectFit: 'cover',
                        objectPosition: getObjectPos(idx),
                        display: 'block',
                        cursor: cropIdx === idx ? 'move' : 'grab',
                        userSelect: 'none',
                      }}
                    />

                    {/* Crop button */}
                    <button
                      type="button"
                      title="Drag to reposition"
                      onMouseDown={(e) => startCrop(e, idx)}
                      style={{
                        position: 'absolute', bottom: 8, left: 8,
                        background: cropIdx === idx ? ACCENT : 'rgba(0,0,0,0.65)',
                        border: 'none', borderRadius: '50%', width: 26, height: 26,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'move', color: cropIdx === idx ? '#111' : '#fff',
                        zIndex: 5,
                      }}
                    >
                      <Move size={13} />
                    </button>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => void removeItem(idx)}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', zIndex: 5 }}
                    >
                      <X size={12} />
                    </button>

                    {/* Crop mode label */}
                    {cropIdx === idx && (
                      <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(167,210,82,0.9)', color: '#111', fontSize: 10, padding: '2px 6px', letterSpacing: '0.05em', fontWeight: 600, textTransform: 'uppercase', pointerEvents: 'none' }}>
                        Drag to reposition
                      </div>
                    )}
                  </>
                )
              : <div style={{ width: '100%', height: '100%', minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT_MUTED, fontSize: 12 }}>No image</div>}
          </div>
        ))}

        {/* Pair + slot */}
        {block.items.length < 2 && (
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            style={{ width: 52, background: 'rgba(255,255,255,0.025)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: uploading ? 'wait' : 'pointer', flexShrink: 0, minHeight: 280, borderLeft: `1px dashed ${BORDER}` }}
            title="Add image to pair"
          >
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => void addImage(e.target.files)} />
            {uploading
              ? <span style={{ color: TEXT_MUTED, fontSize: 10 }}>…</span>
              : <><Plus size={14} color={TEXT_MUTED} /><span style={{ color: TEXT_MUTED, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', writingMode: 'vertical-rl' }}>Pair</span></>}
          </div>
        )}
      </div>

      {/* Drop zone overlay — shown when another image is being dragged */}
      {isDropTarget && (
        <div
          onDragLeave={onDragLeave}
          style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', pointerEvents: 'all' }}
        >
          {/* Left drop zone */}
          <div
            onDragOver={(e) => onDragOver(e, 'left')}
            onDrop={(e) => onDrop(e, 'left')}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: dropSide === 'left' ? 'rgba(167,210,82,0.28)' : 'rgba(0,0,0,0.45)',
              borderRight: `1px solid rgba(167,210,82,${dropSide === 'left' ? '0.6' : '0.2'})`,
              transition: 'background 0.1s, border-color 0.1s',
            }}
          >
            {dropSide === 'left' && (
              <span style={{ color: ACCENT, fontSize: 28, fontWeight: 700, lineHeight: 1 }}>+</span>
            )}
          </div>

          {/* Right drop zone */}
          <div
            onDragOver={(e) => onDragOver(e, 'right')}
            onDrop={(e) => onDrop(e, 'right')}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: dropSide === 'right' ? 'rgba(167,210,82,0.28)' : 'rgba(0,0,0,0.45)',
              borderLeft: `1px solid rgba(167,210,82,${dropSide === 'right' ? '0.6' : '0.2'})`,
              transition: 'background 0.1s, border-color 0.1s',
            }}
          >
            {dropSide === 'right' && (
              <span style={{ color: ACCENT, fontSize: 28, fontWeight: 700, lineHeight: 1 }}>+</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TextBlock ─────────────────────────────────────────────────────────────────

function TextBlock({
  block,
  studyId,
  onUpdated,
}: {
  block: Extract<StudioCaseStudyBlock, { type: 'text' }>;
  studyId: string;
  onUpdated: (b: StudioCaseStudyBlock) => void;
}): ReactElement {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: 'Write something…' }),
    ],
    content: block.body || '<p></p>',
    editorProps: {
      attributes: {
        style: `outline:none;color:${TEXT_PRIMARY};font-size:16px;line-height:1.8;min-height:64px;padding:20px 24px;`,
      },
    },
    immediatelyRender: false,
    onBlur: ({ editor: e }) => {
      const html = e.getHTML();
      const updated: Extract<StudioCaseStudyBlock, { type: 'text' }> = { ...block, body: html };
      void apiPatchBlock(studyId, updated)
        .then(() => onUpdated(updated))
        .catch((err: unknown) => toast.error(err instanceof Error ? err.message : 'Save failed'));
    },
  });

  return (
    <div style={{ background: BLOCK_BG }}>
      {editor && (
        <div style={{ display: 'flex', gap: 4, padding: '6px 12px', borderBottom: `1px solid ${BORDER}`, flexWrap: 'wrap' }}>
          {[
            { label: 'B', title: 'Bold', cmd: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
            { label: 'I', title: 'Italic', cmd: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
            { label: 'H1', title: 'Heading 1', cmd: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
            { label: 'H2', title: 'Heading 2', cmd: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
          ].map((btn) => (
            <button key={btn.label} type="button" onClick={btn.cmd} title={btn.title}
              style={{ background: btn.active ? 'rgba(167,210,82,0.15)' : 'none', border: `1px solid ${btn.active ? ACCENT : BORDER}`, color: btn.active ? ACCENT : TEXT_MUTED, cursor: 'pointer', fontWeight: btn.label === 'B' ? 700 : 600, fontStyle: btn.label === 'I' ? 'italic' : 'normal', fontSize: 11, padding: '2px 7px' }}>
              {btn.label}
            </button>
          ))}
        </div>
      )}
      <EditorContent editor={editor} />
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: ${TEXT_MUTED}; pointer-events: none; height: 0; }
        .ProseMirror h1 { font-size: 2rem; font-weight: 700; margin: 0.5em 0 0.25em; color: ${TEXT_PRIMARY}; }
        .ProseMirror h2 { font-size: 1.4rem; font-weight: 700; margin: 0.5em 0 0.25em; color: ${TEXT_PRIMARY}; }
        .ProseMirror strong { font-weight: 700; }
        .ProseMirror em { font-style: italic; }
        .ProseMirror ul { list-style: disc; padding-left: 1.5rem; margin: 0.25rem 0; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; margin: 0.25rem 0; }
        .ProseMirror p { margin: 0; }
      `}</style>
    </div>
  );
}

// ─── QuoteBlock ────────────────────────────────────────────────────────────────

function QuoteBlock({
  block,
  studyId,
  onUpdated,
}: {
  block: Extract<StudioCaseStudyBlock, { type: 'quote' }>;
  studyId: string;
  onUpdated: (b: StudioCaseStudyBlock) => void;
}): ReactElement {
  async function save(patch: Partial<typeof block>): Promise<void> {
    const updated = { ...block, ...patch };
    try { await apiPatchBlock(studyId, updated); onUpdated(updated); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Save failed'); }
  }

  return (
    <div style={{ background: BLOCK_BG, padding: '32px 40px', borderLeft: `3px solid ${ACCENT}` }}>
      <textarea
        defaultValue={block.quote}
        onBlur={(e) => void save({ quote: e.target.value })}
        placeholder="Write a quote…"
        rows={3}
        style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: TEXT_PRIMARY, fontSize: 22, fontStyle: 'italic', lineHeight: 1.55, resize: 'none', fontFamily: 'inherit' }}
      />
      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        <input defaultValue={block.name ?? ''} onBlur={(e) => void save({ name: e.target.value || null })} placeholder="Name"
          style={{ flex: 1, background: 'none', border: 'none', borderBottom: `1px solid ${BORDER}`, outline: 'none', color: TEXT_MUTED, fontSize: 13, padding: '4px 0', fontFamily: 'inherit' }} />
        <input defaultValue={block.role ?? ''} onBlur={(e) => void save({ role: e.target.value || null })} placeholder="Role / company"
          style={{ flex: 1, background: 'none', border: 'none', borderBottom: `1px solid ${BORDER}`, outline: 'none', color: TEXT_MUTED, fontSize: 13, padding: '4px 0', fontFamily: 'inherit' }} />
      </div>
    </div>
  );
}

// ─── VideoBlock ────────────────────────────────────────────────────────────────

function VideoBlock({ block }: { block: Extract<StudioCaseStudyBlock, { type: 'video' }> }): ReactElement {
  const vimeoMatch = block.url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const embedUrl = vimeoMatch ? `https://player.vimeo.com/video/${vimeoMatch[1]}` : null;
  const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(block.url);

  return (
    <div style={{ background: BLOCK_BG, overflow: 'hidden', aspectRatio: '16/9' }}>
      {embedUrl
        ? <iframe src={embedUrl} style={{ width: '100%', height: '100%', border: 'none' }} allow="autoplay; fullscreen" allowFullScreen title="Video" />
        : isDirectVideo
          // eslint-disable-next-line jsx-a11y/media-has-caption
          ? <video src={block.url} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: TEXT_MUTED }}>
              <Film size={36} /><span style={{ fontSize: 12 }}>{block.url || 'No video URL'}</span>
            </div>}
    </div>
  );
}

// ─── GenericBlock ──────────────────────────────────────────────────────────────

function GenericBlock({ block }: { block: StudioCaseStudyBlock }): ReactElement {
  return (
    <div style={{ background: BLOCK_BG, padding: 20, color: TEXT_MUTED, fontSize: 13 }}>
      <strong style={{ color: TEXT_PRIMARY, textTransform: 'capitalize' }}>{block.type.replace('_', ' ')}</strong>
      <span style={{ marginLeft: 8 }}>— edit via Overview / Metadata tabs</span>
    </div>
  );
}

// ─── AddBlockBar ───────────────────────────────────────────────────────────────

function AddBlockBar({
  studyId,
  onBlockAdded,
}: {
  studyId: string;
  onBlockAdded: (block: StudioCaseStudyBlock) => void;
}): ReactElement {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(files: FileList | null): Promise<void> {
    if (!files?.length) return;
    setUploading(true);
    setOpen(false);
    try {
      const uploaded = await apiUpload(studyId, Array.from(files));
      const images = uploaded.filter((f) => f.mediaType === 'image');
      const videos = uploaded.filter((f) => f.mediaType === 'video');
      for (let i = 0; i < images.length; i += 2) {
        const batch = images.slice(i, i + 2);
        const block = await apiCreateBlock(studyId, 'media_row', {
          layout: batch.length === 2 ? 'pair' : 'single',
          items: batch.map((f) => ({ type: 'image', url: f.url, alt: f.name.replace(/\.[^.]+$/, ''), aspectRatio: '3/2' })),
        });
        onBlockAdded(block);
      }
      for (const v of videos) {
        const block = await apiCreateBlock(studyId, 'video', { url: v.url, coverUrl: null, caption: null });
        onBlockAdded(block);
      }
      toast.success(`${uploaded.length} file${uploaded.length !== 1 ? 's' : ''} added`);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Upload failed'); }
    finally { setUploading(false); }
  }

  async function handleAdd(type: StudioCaseStudyBlockType): Promise<void> {
    setOpen(false);
    const content: Record<string, unknown> = type === 'text' ? { body: '' }
      : type === 'video' ? { url: '', coverUrl: null, caption: null }
      : type === 'quote' ? { quote: '', name: null, role: null }
      : { layout: 'single', items: [] };
    try {
      const block = await apiCreateBlock(studyId, type, content);
      onBlockAdded(block);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 36 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: BORDER }} />
      <input ref={fileRef} type="file" multiple accept="image/*,video/*" style={{ display: 'none' }} onChange={(e) => void handleUpload(e.target.files)} />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={uploading}
        title="Add block"
        style={{ position: 'relative', zIndex: 1, background: BLOCK_BG, border: `1px solid ${BORDER}`, borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: TEXT_MUTED }}
      >
        {uploading ? <span style={{ fontSize: 10 }}>…</span> : <Plus size={13} />}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 2px)', zIndex: 30, background: BLOCK_BG, border: `1px solid ${BORDER}`, padding: 6, display: 'flex', gap: 4 }}>
          <PillBtn icon={<Upload size={14} color={ACCENT} />} label="Upload" onClick={() => fileRef.current?.click()} />
          <PillBtn icon={<Type size={14} />} label="Text" onClick={() => void handleAdd('text')} />
          <PillBtn icon={<Film size={14} />} label="Video" onClick={() => void handleAdd('video')} />
          <PillBtn icon={<Quote size={14} />} label="Quote" onClick={() => void handleAdd('quote')} />
        </div>
      )}
    </div>
  );
}

function PillBtn({ icon, label, onClick }: { icon: ReactElement; label: string; onClick: () => void }): ReactElement {
  return (
    <button type="button" onClick={onClick}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, padding: '8px 12px', cursor: 'pointer', color: TEXT_PRIMARY, fontSize: 11 }}>
      <span style={{ color: TEXT_MUTED }}>{icon}</span>
      {label}
    </button>
  );
}

// ─── BlockRenderer ─────────────────────────────────────────────────────────────

function BlockRenderer({
  block,
  studyId,
  onUpdated,
  onDeleted,
  imgDragSrc,
  onImgDragStart,
  onImgDragEnd,
  onImgDrop,
}: {
  block: StudioCaseStudyBlock;
  studyId: string;
  onUpdated: (b: StudioCaseStudyBlock) => void;
  onDeleted: (id: string) => void;
  imgDragSrc: ImgDragSrc;
  onImgDragStart: (blockId: string, idx: number) => void;
  onImgDragEnd: () => void;
  onImgDrop: (targetBlockId: string, side: 'left' | 'right') => void;
}): ReactElement {
  switch (block.type) {
    case 'media_row': return (
      <MediaBlock
        block={block}
        studyId={studyId}
        onUpdated={onUpdated}
        onDeleted={onDeleted}
        imgDragSrc={imgDragSrc}
        onImgDragStart={onImgDragStart}
        onImgDragEnd={onImgDragEnd}
        onImgDrop={onImgDrop}
      />
    );
    case 'text': return <TextBlock block={block} studyId={studyId} onUpdated={onUpdated} />;
    case 'video': return <VideoBlock block={block} />;
    case 'quote': return <QuoteBlock block={block} studyId={studyId} onUpdated={onUpdated} />;
    default: return <GenericBlock block={block} />;
  }
}

// ─── StoryCanvas ───────────────────────────────────────────────────────────────

export default function StoryCanvas({
  studyId,
  blocks,
  onBlockAdded,
  onBlockUpdated,
  onBlockDeleted,
  onBlocksReordered,
}: {
  studyId: string;
  blocks: StudioCaseStudyBlock[];
  onBlockAdded: (block: StudioCaseStudyBlock) => void;
  onBlockUpdated: (block: StudioCaseStudyBlock) => void;
  onBlockDeleted: (id: string) => void;
  onBlocksReordered: (blocks: StudioCaseStudyBlock[]) => void;
}): ReactElement {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [imgDragSrc, setImgDragSrc] = useState<ImgDragSrc>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // ── block-level drag-to-reorder (dnd-kit) ────────────────────────────────

  function handleDragStart({ active }: DragStartEvent): void {
    setActiveId(active.id as string);
  }

  async function handleDragEnd({ active, over }: DragEndEvent): Promise<void> {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(blocks, oldIndex, newIndex).map((b, i) => ({ ...b, sort_order: i }));
    onBlocksReordered(reordered);
    try {
      await apiReorder(studyId, reordered.map((b) => b.id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Reorder failed');
      onBlocksReordered(blocks);
    }
  }

  // ── image-level drag-to-merge ─────────────────────────────────────────────

  async function handleImgMerge(targetBlockId: string, side: 'left' | 'right'): Promise<void> {
    if (!imgDragSrc) return;
    const { blockId: srcId, idx: srcIdx } = imgDragSrc;
    setImgDragSrc(null);

    if (srcId === targetBlockId) return;

    const srcBlock = blocks.find((b) => b.id === srcId);
    const tgtBlock = blocks.find((b) => b.id === targetBlockId);
    if (!srcBlock || !tgtBlock || srcBlock.type !== 'media_row' || tgtBlock.type !== 'media_row') return;
    if (tgtBlock.items.length >= 2) return;

    const dragged = srcBlock.items[srcIdx];
    if (!dragged) return;

    const newSrcItems = srcBlock.items.filter((_, i) => i !== srcIdx);
    const newTgtItems = side === 'left'
      ? [dragged, ...tgtBlock.items]
      : [...tgtBlock.items, dragged];

    const updatedSrc: Extract<StudioCaseStudyBlock, { type: 'media_row' }> = { ...srcBlock, layout: newSrcItems.length > 1 ? 'pair' : 'single', items: newSrcItems };
    const updatedTgt: Extract<StudioCaseStudyBlock, { type: 'media_row' }> = { ...tgtBlock, layout: newTgtItems.length > 1 ? 'pair' : 'single', items: newTgtItems };

    // Optimistic update
    const newBlocks = blocks
      .map((b) => {
        if (b.id === srcId) return updatedSrc;
        if (b.id === targetBlockId) return updatedTgt;
        return b;
      })
      .filter((b) => !(b.id === srcId && newSrcItems.length === 0));

    onBlocksReordered(newBlocks);

    try {
      await apiPatchBlock(studyId, updatedTgt);
      if (newSrcItems.length === 0) {
        await apiDeleteBlock(studyId, srcId);
      } else {
        await apiPatchBlock(studyId, updatedSrc);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Merge failed');
      onBlocksReordered(blocks); // rollback
    }
  }

  async function handleDelete(block: StudioCaseStudyBlock): Promise<void> {
    try {
      await apiDeleteBlock(studyId, block.id);
      onBlockDeleted(block.id);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Delete failed'); }
  }

  const activeBlock = blocks.find((b) => b.id === activeId);

  return (
    <div style={{ background: CANVAS_BG, minHeight: '100%', padding: '0 48px 80px 56px' }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={(e) => void handleDragEnd(e)}
      >
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <AddBlockBar studyId={studyId} onBlockAdded={onBlockAdded} />

            {blocks.map((block) => (
              <div key={block.id} style={{ marginBottom: 2 }}>
                <SortableBlock block={block} onDelete={() => void handleDelete(block)}>
                  <BlockRenderer
                    block={block}
                    studyId={studyId}
                    onUpdated={onBlockUpdated}
                    onDeleted={onBlockDeleted}
                    imgDragSrc={imgDragSrc}
                    onImgDragStart={(blockId, idx) => setImgDragSrc({ blockId, idx })}
                    onImgDragEnd={() => setImgDragSrc(null)}
                    onImgDrop={(targetId, side) => void handleImgMerge(targetId, side)}
                  />
                </SortableBlock>
                <AddBlockBar studyId={studyId} onBlockAdded={onBlockAdded} />
              </div>
            ))}

            {blocks.length === 0 && (
              <div style={{ textAlign: 'center', color: TEXT_MUTED, paddingTop: 100, fontSize: 14 }}>
                Use the <strong style={{ color: TEXT_PRIMARY }}>+</strong> button to add images, text, or video
              </div>
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeBlock
            ? <div style={{ opacity: 0.75, pointerEvents: 'none', maxWidth: 960, filter: 'brightness(1.15)' }}>
                <BlockRenderer
                  block={activeBlock}
                  studyId={studyId}
                  onUpdated={() => undefined}
                  onDeleted={() => undefined}
                  imgDragSrc={null}
                  onImgDragStart={() => undefined}
                  onImgDragEnd={() => undefined}
                  onImgDrop={() => undefined}
                />
              </div>
            : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
