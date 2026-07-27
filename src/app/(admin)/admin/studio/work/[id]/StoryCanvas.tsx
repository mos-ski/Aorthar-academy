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
import { GripVertical, Plus, Trash2, Upload, Type, Film, Quote, X, Move, RotateCcw } from 'lucide-react';
import type { ReactElement, CSSProperties } from 'react';
import type { StudioCaseStudyBlock, StudioCaseStudyBlockType } from '@/lib/studio/case-study-schema';

// ─── constants ─────────────────────────────────────────────────────────────────

const CANVAS_BG = '#0f1112';
const BLOCK_BG = '#18191a';
const BORDER = '#2a2a2a';
const TEXT_PRIMARY = '#ebefe0';
const TEXT_MUTED = '#6b6b6b';
const ACCENT = '#a7d252';
const ROW_H = 300; // px — height of one image row in all layouts

// ─── types ─────────────────────────────────────────────────────────────────────

type MediaLayout = 'single' | 'pair' | 'trio-left' | 'trio-right';
type MediaItem = { type: 'image' | 'video'; url: string; alt: string; aspectRatio: string; objectPosition?: string };
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

async function apiCreateBlock(studyId: string, type: StudioCaseStudyBlockType, content: Record<string, unknown>): Promise<StudioCaseStudyBlock> {
  const res = await fetch(`/api/admin/studio/case-studies/${studyId}/blocks`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, content }),
  });
  const data = await res.json().catch(() => ({})) as { data?: Record<string, unknown>; error?: string };
  if (!res.ok || !data.data) throw new Error(data.error ?? 'Failed to create block');
  return { id: data.data.id as string, sort_order: data.data.sort_order as number, type, ...content } as StudioCaseStudyBlock;
}

async function apiPatchBlock(studyId: string, block: StudioCaseStudyBlock): Promise<void> {
  const res = await fetch(`/api/admin/studio/case-studies/${studyId}/blocks/${block.id}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
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
    method: 'POST', headers: { 'Content-Type': 'application/json' },
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

function deriveLayout(count: number, existing: MediaLayout): MediaLayout {
  if (count <= 0) return 'single';
  if (count === 1) return 'single';
  if (count === 2) {
    // Downgrade trio to pair, keep pair
    if (existing === 'trio-left' || existing === 'trio-right') return 'pair';
    return existing === 'pair' ? 'pair' : 'single';
  }
  // count === 3: keep trio orientation
  return existing;
}

// ─── SortableBlock ─────────────────────────────────────────────────────────────

function SortableBlock({ block, onDelete, children }: { block: StudioCaseStudyBlock; onDelete: () => void; children: ReactElement }): ReactElement {
  const [hovered, setHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  return (
    <div ref={setNodeRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 }}
    >
      <div {...attributes} {...listeners}
        style={{ position: 'absolute', left: -32, top: '50%', transform: 'translateY(-50%)', opacity: hovered ? 1 : 0, transition: 'opacity 0.15s', cursor: 'grab', color: TEXT_MUTED, padding: '4px 2px', display: 'flex' }}>
        <GripVertical size={16} />
      </div>
      <button type="button" onClick={onDelete}
        style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s', background: 'rgba(0,0,0,0.7)', border: '1px solid #3a3a3a', color: '#e55', cursor: 'pointer', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
        <Trash2 size={11} /> Delete
      </button>
      {children}
    </div>
  );
}

// ─── ImageCell ─────────────────────────────────────────────────────────────────

function ImageCell({
  item, idx, blockId, style,
  onRemove, onUpdated,
  onDragStart, onDragEnd,
}: {
  item: MediaItem | undefined;
  idx: number;
  blockId: string;
  style?: CSSProperties;
  onRemove: () => void;
  onUpdated: (pos: string) => void;
  onDragStart: (blockId: string, idx: number) => void;
  onDragEnd: () => void;
}): ReactElement {
  const [livePos, setLivePos] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const cropRef = useRef<{ startX: number; startY: number; px: number; py: number } | null>(null);

  const savedPos = item?.objectPosition ?? '50% 50%';
  const objectPos = livePos ?? savedPos;
  const isOffCenter = savedPos !== '50% 50%' && savedPos !== '';

  function startCrop(e: React.MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    const parts = objectPos.split(' ');
    cropRef.current = {
      startX: e.clientX, startY: e.clientY,
      px: parseFloat(parts[0] ?? '50'),
      py: parseFloat(parts[1] ?? '50'),
    };
    setCropping(true);

    function onMove(ev: MouseEvent): void {
      if (!cropRef.current) return;
      const nx = Math.max(0, Math.min(100, cropRef.current.px - (ev.clientX - cropRef.current.startX) * 0.4));
      const ny = Math.max(0, Math.min(100, cropRef.current.py - (ev.clientY - cropRef.current.startY) * 0.4));
      setLivePos(`${nx.toFixed(1)}% ${ny.toFixed(1)}%`);
    }

    function onUp(): void {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      cropRef.current = null;
      setCropping(false);
      setLivePos((pos) => { if (pos) onUpdated(pos); return null; });
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  function resetPos(): void {
    setLivePos(null);
    onUpdated('50% 50%');
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: '#080808', ...style }}>
      {item?.url
        ? <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.alt}
              draggable={!cropping}
              onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(blockId, idx); }}
              onDragEnd={onDragEnd}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: objectPos, display: 'block', cursor: cropping ? 'move' : 'grab', userSelect: 'none' }}
            />
            {/* Bottom-left controls: Move + Reset */}
            <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 4, zIndex: 5 }}>
              <button type="button" onMouseDown={startCrop} title="Drag to reposition"
                style={{ background: cropping ? ACCENT : 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'move', color: cropping ? '#111' : '#fff' }}>
                <Move size={13} />
              </button>
              {(isOffCenter || cropping) && (
                <button type="button" onClick={resetPos} title="Reset to center"
                  style={{ background: 'rgba(0,0,0,0.65)', border: `1px solid ${ACCENT}`, borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: ACCENT }}>
                  <RotateCcw size={12} />
                </button>
              )}
            </div>
            {cropping && <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(167,210,82,0.9)', color: '#111', fontSize: 10, padding: '2px 6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', pointerEvents: 'none' }}>Drag to reposition</div>}
            {/* Remove */}
            <button type="button" onClick={onRemove}
              style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', zIndex: 5 }}>
              <X size={12} />
            </button>
          </>
        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT_MUTED, fontSize: 12 }}>No image</div>
      }
    </div>
  );
}

// ─── MediaBlock ────────────────────────────────────────────────────────────────

function MediaBlock({
  block, studyId, onUpdated, onDeleted,
  imgDragSrc, onImgDragStart, onImgDragEnd, onImgDrop,
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
  const fileRef = useRef<HTMLInputElement>(null);

  const isDropTarget = imgDragSrc !== null && imgDragSrc.blockId !== block.id && block.items.length < 3;
  const isTrio = block.layout === 'trio-left' || block.layout === 'trio-right';

  // ── remove item ──────────────────────────────────────────────────────────

  async function removeItem(index: number): Promise<void> {
    const newItems = block.items.filter((_, i) => i !== index);
    if (newItems.length === 0) {
      try { await apiDeleteBlock(studyId, block.id); onDeleted(block.id); }
      catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
      return;
    }
    const newLayout: MediaLayout = newItems.length >= 2 ? 'pair' : 'single';
    const updated = { ...block, layout: newLayout, items: newItems } as Extract<StudioCaseStudyBlock, { type: 'media_row' }>;
    try { await apiPatchBlock(studyId, updated); onUpdated(updated); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  }

  // ── update object position ────────────────────────────────────────────────

  async function updatePos(idx: number, pos: string): Promise<void> {
    const newItems = block.items.map((item, i) => i === idx ? { ...item, objectPosition: pos } : item);
    const updated = { ...block, items: newItems } as Extract<StudioCaseStudyBlock, { type: 'media_row' }>;
    try { await apiPatchBlock(studyId, updated); onUpdated(updated); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to save position'); }
  }

  // ── add paired image (single → pair) ────────────────────────────────────

  async function addImage(files: FileList | null): Promise<void> {
    if (!files?.length || block.items.length >= 2) return;
    setUploading(true);
    try {
      const uploaded = await apiUpload(studyId, [files[0]]);
      if (!uploaded.length) return;
      const newItem: MediaItem = { type: 'image', url: uploaded[0].url, alt: '', aspectRatio: '3/2' };
      const updated = { ...block, layout: 'pair' as MediaLayout, items: [...block.items, newItem] } as Extract<StudioCaseStudyBlock, { type: 'media_row' }>;
      await apiPatchBlock(studyId, updated);
      onUpdated(updated);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setUploading(false); }
  }

  // ── drag-over helpers ─────────────────────────────────────────────────────

  function onZoneDragOver(e: React.DragEvent, side: 'left' | 'right'): void {
    if (!isDropTarget) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropSide(side);
  }

  function onContainerDragLeave(e: React.DragEvent): void {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropSide(null);
  }

  function onZoneDrop(e: React.DragEvent, side: 'left' | 'right'): void {
    e.preventDefault();
    setDropSide(null);
    onImgDrop(block.id, side);
  }

  // ── render helpers ───────────────────────────────────────────────────────

  const dropZoneLabel = block.items.length < 2
    ? (side: 'left' | 'right') => side === 'left' ? '← Add left' : 'Add right →'
    : (side: 'left' | 'right') => side === 'left' ? '← Tall left' : 'Tall right →';

  const cell = (idx: number, style?: CSSProperties): ReactElement => (
    <ImageCell
      key={idx}
      item={block.items[idx]}
      idx={idx}
      blockId={block.id}
      style={style}
      onRemove={() => void removeItem(idx)}
      onUpdated={(pos) => void updatePos(idx, pos)}
      onDragStart={onImgDragStart}
      onDragEnd={onImgDragEnd}
    />
  );

  // ── grid layouts ─────────────────────────────────────────────────────────

  let content: ReactElement;

  if (isTrio) {
    const isLeft = block.layout === 'trio-left';
    content = (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: `${ROW_H}px ${ROW_H}px`, gap: 2 }}>
        {isLeft ? (
          <>
            {/* Tall image on left, spans both rows */}
            {cell(0, { gridRow: '1 / 3', gridColumn: '1', height: ROW_H * 2 + 2 })}
            {cell(1, { height: ROW_H })}
            {cell(2, { height: ROW_H })}
          </>
        ) : (
          <>
            {/* Two stacked on left, tall on right */}
            {cell(1, { height: ROW_H, gridRow: '1', gridColumn: '1' })}
            {/* Tall image on right, spans both rows */}
            {cell(0, { gridRow: '1 / 3', gridColumn: '2', height: ROW_H * 2 + 2 })}
            {cell(2, { height: ROW_H, gridRow: '2', gridColumn: '1' })}
          </>
        )}
      </div>
    );
  } else if (block.layout === 'pair') {
    content = (
      <div style={{ display: 'flex', gap: 2 }}>
        {cell(0, { flex: '1', height: ROW_H })}
        {cell(1, { flex: '1', height: ROW_H })}
      </div>
    );
  } else {
    // single
    content = (
      <div style={{ display: 'flex', gap: 2 }}>
        {cell(0, { flex: '1', height: ROW_H })}
        {/* + Pair slot */}
        {block.items.length < 2 && (
          <div onClick={() => !uploading && fileRef.current?.click()}
            style={{ width: 52, background: 'rgba(255,255,255,0.025)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: uploading ? 'wait' : 'pointer', flexShrink: 0, height: ROW_H, borderLeft: `1px dashed ${BORDER}` }}
            title="Add second image (pair)">
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => void addImage(e.target.files)} />
            {uploading ? <span style={{ color: TEXT_MUTED, fontSize: 10 }}>…</span>
              : <><Plus size={14} color={TEXT_MUTED} /><span style={{ color: TEXT_MUTED, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', writingMode: 'vertical-rl' }}>Pair</span></>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: BLOCK_BG, position: 'relative' }}>
      {content}

      {/* Drop-zone overlay — when another image is being dragged */}
      {isDropTarget && (
        <div onDragLeave={onContainerDragLeave}
          style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', pointerEvents: 'all' }}>
          <div
            onDragOver={(e) => onZoneDragOver(e, 'left')}
            onDrop={(e) => onZoneDrop(e, 'left')}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: dropSide === 'left' ? 'rgba(167,210,82,0.28)' : 'rgba(0,0,0,0.5)', borderRight: `1px solid rgba(167,210,82,${dropSide === 'left' ? '0.7' : '0.2'})`, transition: 'background 0.1s' }}>
            {dropSide === 'left' && <>
              <span style={{ color: ACCENT, fontSize: 24, lineHeight: 1, fontWeight: 700 }}>+</span>
              <span style={{ color: ACCENT, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{dropZoneLabel('left')}</span>
            </>}
          </div>
          <div
            onDragOver={(e) => onZoneDragOver(e, 'right')}
            onDrop={(e) => onZoneDrop(e, 'right')}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: dropSide === 'right' ? 'rgba(167,210,82,0.28)' : 'rgba(0,0,0,0.5)', borderLeft: `1px solid rgba(167,210,82,${dropSide === 'right' ? '0.7' : '0.2'})`, transition: 'background 0.1s' }}>
            {dropSide === 'right' && <>
              <span style={{ color: ACCENT, fontSize: 24, lineHeight: 1, fontWeight: 700 }}>+</span>
              <span style={{ color: ACCENT, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{dropZoneLabel('right')}</span>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TextBlock ─────────────────────────────────────────────────────────────────

function TextBlock({ block, studyId, onUpdated }: { block: Extract<StudioCaseStudyBlock, { type: 'text' }>; studyId: string; onUpdated: (b: StudioCaseStudyBlock) => void }): ReactElement {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } }), Placeholder.configure({ placeholder: 'Write something…' })],
    content: block.body || '<p></p>',
    editorProps: { attributes: { style: `outline:none;color:${TEXT_PRIMARY};font-size:16px;line-height:1.8;min-height:64px;padding:20px 24px;` } },
    immediatelyRender: false,
    onBlur: ({ editor: e }) => {
      const html = e.getHTML();
      const updated: Extract<StudioCaseStudyBlock, { type: 'text' }> = { ...block, body: html };
      void apiPatchBlock(studyId, updated).then(() => onUpdated(updated)).catch((err: unknown) => toast.error(err instanceof Error ? err.message : 'Save failed'));
    },
  });

  return (
    <div style={{ background: BLOCK_BG }}>
      {editor && (
        <div style={{ display: 'flex', gap: 4, padding: '6px 12px', borderBottom: `1px solid ${BORDER}`, flexWrap: 'wrap' }}>
          {[
            { label: 'B', cmd: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
            { label: 'I', cmd: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
            { label: 'H1', cmd: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
            { label: 'H2', cmd: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
          ].map((btn) => (
            <button key={btn.label} type="button" onClick={btn.cmd}
              style={{ background: btn.active ? 'rgba(167,210,82,0.15)' : 'none', border: `1px solid ${btn.active ? ACCENT : BORDER}`, color: btn.active ? ACCENT : TEXT_MUTED, cursor: 'pointer', fontWeight: btn.label === 'B' ? 700 : 600, fontStyle: btn.label === 'I' ? 'italic' : 'normal', fontSize: 11, padding: '2px 7px' }}>
              {btn.label}
            </button>
          ))}
        </div>
      )}
      <EditorContent editor={editor} />
      <style>{`.ProseMirror p.is-editor-empty:first-child::before{content:attr(data-placeholder);float:left;color:${TEXT_MUTED};pointer-events:none;height:0}.ProseMirror h1{font-size:2rem;font-weight:700;margin:.5em 0 .25em;color:${TEXT_PRIMARY}}.ProseMirror h2{font-size:1.4rem;font-weight:700;margin:.5em 0 .25em;color:${TEXT_PRIMARY}}.ProseMirror strong{font-weight:700}.ProseMirror em{font-style:italic}.ProseMirror ul{list-style:disc;padding-left:1.5rem;margin:.25rem 0}.ProseMirror ol{list-style:decimal;padding-left:1.5rem;margin:.25rem 0}.ProseMirror p{margin:0}`}</style>
    </div>
  );
}

// ─── QuoteBlock ────────────────────────────────────────────────────────────────

function QuoteBlock({ block, studyId, onUpdated }: { block: Extract<StudioCaseStudyBlock, { type: 'quote' }>; studyId: string; onUpdated: (b: StudioCaseStudyBlock) => void }): ReactElement {
  async function save(patch: Partial<typeof block>): Promise<void> {
    const updated = { ...block, ...patch };
    try { await apiPatchBlock(studyId, updated); onUpdated(updated); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Save failed'); }
  }
  return (
    <div style={{ background: BLOCK_BG, padding: '32px 40px', borderLeft: `3px solid ${ACCENT}` }}>
      <textarea defaultValue={block.quote} onBlur={(e) => void save({ quote: e.target.value })} placeholder="Write a quote…" rows={3}
        style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: TEXT_PRIMARY, fontSize: 22, fontStyle: 'italic', lineHeight: 1.55, resize: 'none', fontFamily: 'inherit' }} />
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
      {embedUrl ? <iframe src={embedUrl} style={{ width: '100%', height: '100%', border: 'none' }} allow="autoplay; fullscreen" allowFullScreen title="Video" />
        : isDirectVideo
          // eslint-disable-next-line jsx-a11y/media-has-caption
          ? <video src={block.url} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: TEXT_MUTED }}><Film size={36} /><span style={{ fontSize: 12 }}>{block.url || 'No video URL'}</span></div>}
    </div>
  );
}

function GenericBlock({ block }: { block: StudioCaseStudyBlock }): ReactElement {
  return <div style={{ background: BLOCK_BG, padding: 20, color: TEXT_MUTED, fontSize: 13 }}><strong style={{ color: TEXT_PRIMARY, textTransform: 'capitalize' }}>{block.type.replace('_', ' ')}</strong><span style={{ marginLeft: 8 }}>— edit via Overview / Metadata tabs</span></div>;
}

// ─── AddBlockBar ───────────────────────────────────────────────────────────────

function AddBlockBar({
  studyId, onBlockAdded,
  imgDragSrc, onImgExtract,
}: {
  studyId: string;
  onBlockAdded: (block: StudioCaseStudyBlock) => void;
  imgDragSrc: ImgDragSrc;
  onImgExtract: () => void;
}): ReactElement {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(files: FileList | null): Promise<void> {
    if (!files?.length) return;
    setUploading(true); setOpen(false);
    try {
      const uploaded = await apiUpload(studyId, Array.from(files));
      const images = uploaded.filter((f) => f.mediaType === 'image');
      const videos = uploaded.filter((f) => f.mediaType === 'video');
      for (let i = 0; i < images.length; i += 2) {
        const batch = images.slice(i, i + 2);
        const block = await apiCreateBlock(studyId, 'media_row', { layout: batch.length === 2 ? 'pair' : 'single', items: batch.map((f) => ({ type: 'image', url: f.url, alt: f.name.replace(/\.[^.]+$/, ''), aspectRatio: '3/2' })) });
        onBlockAdded(block);
      }
      for (const v of videos) { const block = await apiCreateBlock(studyId, 'video', { url: v.url, coverUrl: null, caption: null }); onBlockAdded(block); }
      toast.success(`${uploaded.length} file${uploaded.length !== 1 ? 's' : ''} added`);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Upload failed'); }
    finally { setUploading(false); }
  }

  async function handleAdd(type: StudioCaseStudyBlockType): Promise<void> {
    setOpen(false);
    const content: Record<string, unknown> = type === 'text' ? { body: '' } : type === 'video' ? { url: '', coverUrl: null, caption: null } : type === 'quote' ? { quote: '', name: null, role: null } : { layout: 'single', items: [] };
    try { const block = await apiCreateBlock(studyId, type, content); onBlockAdded(block); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  }

  // ── drag-to-extract drop zone ────────────────────────────────────────────────
  const isExtractTarget = imgDragSrc !== null;

  function onDragOver(e: React.DragEvent): void {
    if (!isExtractTarget) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  }

  function onDragLeave(e: React.DragEvent): void {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
  }

  function onDrop(e: React.DragEvent): void {
    e.preventDefault();
    setDragOver(false);
    onImgExtract();
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: isExtractTarget ? 48 : 36,
        transition: 'height 0.15s',
        background: dragOver ? 'rgba(167,210,82,0.1)' : 'transparent',
        borderTop: dragOver ? `1px dashed ${ACCENT}` : '1px solid transparent',
        borderBottom: dragOver ? `1px dashed ${ACCENT}` : '1px solid transparent',
      }}>
      {isExtractTarget
        ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: dragOver ? ACCENT : TEXT_MUTED, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', pointerEvents: 'none', transition: 'color 0.1s' }}>
            <span style={{ fontSize: 18, lineHeight: 1, fontWeight: 700 }}>+</span>
            <span>New block here</span>
          </div>
        )
        : <>
            <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: BORDER }} />
            <input ref={fileRef} type="file" multiple accept="image/*,video/*" style={{ display: 'none' }} onChange={(e) => void handleUpload(e.target.files)} />
            <button type="button" onClick={() => setOpen((v) => !v)} disabled={uploading} title="Add block"
              style={{ position: 'relative', zIndex: 1, background: BLOCK_BG, border: `1px solid ${BORDER}`, borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: TEXT_MUTED }}>
              {uploading ? <span style={{ fontSize: 10 }}>…</span> : <Plus size={13} />}
            </button>
            {open && (
              <div style={{ position: 'absolute', top: 'calc(100% + 2px)', zIndex: 30, background: BLOCK_BG, border: `1px solid ${BORDER}`, padding: 6, display: 'flex', gap: 4 }}>
                {[
                  { icon: <Upload size={14} color={ACCENT} />, label: 'Upload', action: () => fileRef.current?.click() },
                  { icon: <Type size={14} />, label: 'Text', action: () => void handleAdd('text') },
                  { icon: <Film size={14} />, label: 'Video', action: () => void handleAdd('video') },
                  { icon: <Quote size={14} />, label: 'Quote', action: () => void handleAdd('quote') },
                ].map((btn) => (
                  <button key={btn.label} type="button" onClick={btn.action}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, padding: '8px 12px', cursor: 'pointer', color: TEXT_PRIMARY, fontSize: 11 }}>
                    <span style={{ color: TEXT_MUTED }}>{btn.icon}</span>{btn.label}
                  </button>
                ))}
              </div>
            )}
          </>
      }
    </div>
  );
}

// ─── BlockRenderer ─────────────────────────────────────────────────────────────

function BlockRenderer({ block, studyId, onUpdated, onDeleted, imgDragSrc, onImgDragStart, onImgDragEnd, onImgDrop }: {
  block: StudioCaseStudyBlock; studyId: string;
  onUpdated: (b: StudioCaseStudyBlock) => void; onDeleted: (id: string) => void;
  imgDragSrc: ImgDragSrc;
  onImgDragStart: (blockId: string, idx: number) => void;
  onImgDragEnd: () => void;
  onImgDrop: (targetBlockId: string, side: 'left' | 'right') => void;
}): ReactElement {
  if (block.type === 'media_row') return <MediaBlock block={block} studyId={studyId} onUpdated={onUpdated} onDeleted={onDeleted} imgDragSrc={imgDragSrc} onImgDragStart={onImgDragStart} onImgDragEnd={onImgDragEnd} onImgDrop={onImgDrop} />;
  if (block.type === 'text') return <TextBlock block={block} studyId={studyId} onUpdated={onUpdated} />;
  if (block.type === 'video') return <VideoBlock block={block} />;
  if (block.type === 'quote') return <QuoteBlock block={block} studyId={studyId} onUpdated={onUpdated} />;
  return <GenericBlock block={block} />;
}

// ─── StoryCanvas ───────────────────────────────────────────────────────────────

export default function StoryCanvas({ studyId, blocks, onBlockAdded, onBlockUpdated, onBlockDeleted, onBlocksReordered }: {
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

  // ── block reorder ──────────────────────────────────────────────────────────

  async function handleDragEnd({ active, over }: DragEndEvent): Promise<void> {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(blocks, oldIndex, newIndex).map((b, i) => ({ ...b, sort_order: i }));
    onBlocksReordered(reordered);
    try { await apiReorder(studyId, reordered.map((b) => b.id)); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Reorder failed'); onBlocksReordered(blocks); }
  }

  // ── image drag-to-extract (drop on AddBlockBar gap) ────────────────────────

  async function handleImgExtract(insertAfterIndex: number): Promise<void> {
    if (!imgDragSrc) return;
    const { blockId: srcId, idx: srcIdx } = imgDragSrc;
    setImgDragSrc(null);

    const srcBlock = blocks.find((b) => b.id === srcId);
    if (!srcBlock || srcBlock.type !== 'media_row') return;

    const dragged = srcBlock.items[srcIdx];
    if (!dragged) return;

    const newSrcItems = srcBlock.items.filter((_, i) => i !== srcIdx);
    const updatedSrc = { ...srcBlock, layout: deriveLayout(newSrcItems.length, srcBlock.layout), items: newSrcItems } as Extract<StudioCaseStudyBlock, { type: 'media_row' }>;

    // Optimistically insert placeholder then replace with real block after API
    const srcBlockIndex = blocks.findIndex((b) => b.id === srcId);
    const targetIndex = insertAfterIndex >= srcBlockIndex ? insertAfterIndex : insertAfterIndex; // insert after given position

    // Build updated blocks without src (or shrunk) then splice new block in
    const withoutExtracted = newSrcItems.length === 0
      ? blocks.filter((b) => b.id !== srcId)
      : blocks.map((b) => b.id === srcId ? updatedSrc : b);

    // Find where to insert: insertAfterIndex is the index in the original array
    const insertPos = Math.min(insertAfterIndex + 1, withoutExtracted.length);
    const reordered = [
      ...withoutExtracted.slice(0, insertPos),
      { id: '__placeholder__', type: 'media_row' as const, sort_order: insertPos, layout: 'single' as const, items: [dragged] },
      ...withoutExtracted.slice(insertPos),
    ].map((b, i) => ({ ...b, sort_order: i }));

    onBlocksReordered(reordered);

    try {
      // 1. Patch/delete source
      if (newSrcItems.length === 0) {
        await apiDeleteBlock(studyId, srcId);
      } else {
        await apiPatchBlock(studyId, updatedSrc);
      }

      // 2. Create the new block
      const newBlock = await apiCreateBlock(studyId, 'media_row', { layout: 'single', items: [dragged] });

      // 3. Replace placeholder with real block, keep ordering
      const final = reordered
        .map((b) => b.id === '__placeholder__' ? newBlock : b)
        .map((b, i) => ({ ...b, sort_order: i }));
      onBlocksReordered(final);

      // 4. Persist the order
      await apiReorder(studyId, final.map((b) => b.id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to extract block');
      onBlocksReordered(blocks);
    }
  }

  // ── image drag-to-merge ─────────────────────────────────────────────────────

  async function handleImgMerge(targetBlockId: string, side: 'left' | 'right'): Promise<void> {
    if (!imgDragSrc) return;
    const { blockId: srcId, idx: srcIdx } = imgDragSrc;
    setImgDragSrc(null);
    if (srcId === targetBlockId) return;

    const srcBlock = blocks.find((b) => b.id === srcId);
    const tgtBlock = blocks.find((b) => b.id === targetBlockId);
    if (!srcBlock || !tgtBlock || srcBlock.type !== 'media_row' || tgtBlock.type !== 'media_row') return;
    if (tgtBlock.items.length >= 3) return;

    const dragged = srcBlock.items[srcIdx];
    if (!dragged) return;

    const newSrcItems = srcBlock.items.filter((_, i) => i !== srcIdx);

    let newTgtLayout: MediaLayout;
    let newTgtItems: typeof tgtBlock.items;

    if (tgtBlock.items.length < 2) {
      // single → pair
      newTgtLayout = 'pair';
      newTgtItems = side === 'left' ? [dragged, ...tgtBlock.items] : [...tgtBlock.items, dragged];
    } else {
      // pair → trio (dragged becomes the tall image)
      newTgtLayout = side === 'left' ? 'trio-left' : 'trio-right';
      newTgtItems = [dragged, ...tgtBlock.items]; // items[0] = tall, [1] = top stacked, [2] = bottom stacked
    }

    const updatedSrc = { ...srcBlock, layout: deriveLayout(newSrcItems.length, srcBlock.layout), items: newSrcItems } as Extract<StudioCaseStudyBlock, { type: 'media_row' }>;
    const updatedTgt = { ...tgtBlock, layout: newTgtLayout, items: newTgtItems } as Extract<StudioCaseStudyBlock, { type: 'media_row' }>;

    const newBlocks = blocks
      .map((b) => b.id === srcId ? updatedSrc : b.id === targetBlockId ? updatedTgt : b)
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
      onBlocksReordered(blocks);
    }
  }

  async function handleDelete(block: StudioCaseStudyBlock): Promise<void> {
    try { await apiDeleteBlock(studyId, block.id); onBlockDeleted(block.id); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Delete failed'); }
  }

  const activeBlock = blocks.find((b) => b.id === activeId);

  return (
    <div style={{ background: CANVAS_BG, minHeight: '100%', padding: '0 48px 80px 56px' }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter}
        onDragStart={({ active }: DragStartEvent) => setActiveId(active.id as string)}
        onDragEnd={(e) => void handleDragEnd(e)}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <AddBlockBar studyId={studyId} onBlockAdded={onBlockAdded}
              imgDragSrc={imgDragSrc} onImgExtract={() => void handleImgExtract(-1)} />
            {blocks.map((block, blockIndex) => (
              <div key={block.id} style={{ marginBottom: 2 }}>
                <SortableBlock block={block} onDelete={() => void handleDelete(block)}>
                  <BlockRenderer block={block} studyId={studyId}
                    onUpdated={onBlockUpdated} onDeleted={onBlockDeleted}
                    imgDragSrc={imgDragSrc}
                    onImgDragStart={(blockId, idx) => setImgDragSrc({ blockId, idx })}
                    onImgDragEnd={() => setImgDragSrc(null)}
                    onImgDrop={(targetId, side) => void handleImgMerge(targetId, side)}
                  />
                </SortableBlock>
                <AddBlockBar studyId={studyId} onBlockAdded={onBlockAdded}
                  imgDragSrc={imgDragSrc} onImgExtract={() => void handleImgExtract(blockIndex)} />
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
          {activeBlock ? (
            <div style={{ opacity: 0.75, pointerEvents: 'none', maxWidth: 960 }}>
              <BlockRenderer block={activeBlock} studyId={studyId}
                onUpdated={() => undefined} onDeleted={() => undefined}
                imgDragSrc={null} onImgDragStart={() => undefined}
                onImgDragEnd={() => undefined} onImgDrop={() => undefined}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
