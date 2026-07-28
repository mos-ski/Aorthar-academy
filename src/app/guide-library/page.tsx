'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage, AvatarBadge } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertCircle, ArrowLeft, ArrowRight, Award, BarChart3, Bell, BookOpen, Briefcase, Building2, Calendar, Check, Copy,
  ChevronDown, ChevronRight, Circle, Clock, Code, Coffee, Download, Edit, Eye, File, FileText, Filter,
  Flame, Folder, Github, Globe, GraduationCap, Grid3X3, Hash, Heart, HelpCircle, Home, Info, Layout,
  Layers, Leaf, Lightbulb, Link, Linkedin, List, Lock, Mail, MapPin, MessageCircle, MessageSquare,
  Minus, Monitor, MoreHorizontal, Mountain, Moon, Newspaper, Palette, PanelRight, Pen, Phone, Play,
  Plus, Presentation, RefreshCw, Rocket, Search, Send, Settings, Share2, Shield, Sparkles, Star, Sun,
  Trash2, TrendingUp, Trophy, Tv, Type, Upload, User, Users, Video, X, Zap,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    group: 'Foundations',
    items: [
      { id: 'colors', label: 'Colors' },
      { id: 'typography', label: 'Typography' },
      { id: 'logos', label: 'Logos' },
      { id: 'icons', label: 'Icons' },
      { id: 'misc-icons', label: 'Misc icons' },
      { id: 'effect-styles', label: 'Effect styles' },
      { id: 'spacing', label: 'Spacing, radius & grids' },
      { id: 'portfolio-mockups', label: 'Portfolio mockups' },
      { id: 'design-annotations', label: 'Design annotations' },
    ],
  },
  {
    group: 'Shared Components',
    items: [
      { id: 'buttons', label: 'Buttons' },
      { id: 'button-groups', label: 'Button groups' },
      { id: 'badges', label: 'Badges' },
      { id: 'tags', label: 'Tags' },
      { id: 'dropdowns', label: 'Dropdowns' },
      { id: 'inputs', label: 'Inputs' },
      { id: 'toggles', label: 'Toggles' },
      { id: 'checkboxes', label: 'Checkboxes' },
      { id: 'checkbox-groups', label: 'Checkbox groups' },
      { id: 'avatars', label: 'Avatars' },
      { id: 'tooltips', label: 'Tooltips' },
      { id: 'progress-indicators', label: 'Progress indicators' },
      { id: 'sliders', label: 'Sliders' },
    ],
  },
  {
    group: 'Shared Assets',
    items: [
      { id: 'login-signup', label: 'Log in and sign up pages' },
      { id: '404', label: '404 pages' },
      { id: 'email-templates', label: 'Email templates' },
      { id: 'misc-assets', label: 'Miscellaneous assets' },
      { id: 'background-elements', label: 'Background elements' },
    ],
  },
  {
    group: 'Marketing Website Components',
    items: [
      { id: 'header-navigation', label: 'Header navigation' },
      { id: 'header-sections', label: 'Header sections' },
      { id: 'features-sections', label: 'Features sections' },
      { id: 'pricing-sections', label: 'Pricing sections' },
      { id: 'cta-sections', label: 'CTA sections' },
      { id: 'metrics-sections', label: 'Metrics sections' },
      { id: 'newsletter-cta', label: 'Newsletter CTA sections' },
      { id: 'testimonial-sections', label: 'Testimonial sections' },
      { id: 'social-proof', label: 'Social proof sections' },
      { id: 'blog-sections', label: 'Blog sections' },
      { id: 'content', label: 'Content' },
      { id: 'contact-sections', label: 'Contact sections' },
      { id: 'team-sections', label: 'Team sections' },
      { id: 'careers-sections', label: 'Careers sections' },
      { id: 'faq-sections', label: 'FAQ sections' },
      { id: 'footers', label: 'Footers' },
      { id: 'banners', label: 'Banners' },
    ],
  },
  {
    group: 'Application Components',
    items: [
      { id: 'page-headers', label: 'Page headers' },
      { id: 'card-headers', label: 'Card headers' },
      { id: 'section-headers', label: 'Section headers' },
      { id: 'section-footers', label: 'Section footers' },
      { id: 'app-navigation', label: 'Application navigation' },
      { id: 'modals', label: 'Modals' },
      { id: 'command-menus', label: 'Command menus' },
      { id: 'charts', label: 'Charts' },
      { id: 'metrics', label: 'Metrics' },
      { id: 'slideout-menus', label: 'Slideout menus' },
      { id: 'inline-ctas', label: 'Inline CTAs' },
      { id: 'pagination', label: 'Pagination' },
      { id: 'progress-steps', label: 'Progress steps' },
      { id: 'activity-feeds', label: 'Activity feeds' },
      { id: 'messaging', label: 'Messaging' },
      { id: 'tabs', label: 'Tabs' },
      { id: 'tables', label: 'Tables' },
      { id: 'breadcrumbs', label: 'Breadcrumbs' },
      { id: 'alerts-notifications', label: 'Alerts & notifications' },
      { id: 'date-pickers', label: 'Date pickers' },
      { id: 'file-upload', label: 'File upload' },
      { id: 'content-dividers', label: 'Content dividers' },
      { id: 'loading-indicators', label: 'Loading indicators' },
      { id: 'empty-states', label: 'Empty states' },
      { id: 'code-snippets', label: 'Code snippets' },
    ],
  },
];

const COLORS = [
  { name: 'Lemon', hex: '#a7d252', token: '--primary', note: 'Primary action, active states, highlights' },
  { name: 'Dark Green', hex: '#08694a', token: '--primary (light)', note: 'Primary in light mode' },
  { name: 'Secondary', hex: '#24453b', token: '--secondary', note: 'Secondary backgrounds' },
  { name: 'Accent', hex: '#2a5a4b', token: '--accent', note: 'Hover backgrounds' },
  { name: 'Background', hex: '#101112', token: '--background', note: 'Page background (dark)' },
  { name: 'Card', hex: '#18191a', token: '--card', note: 'Card & popover surfaces' },
  { name: 'Border', hex: '#2a2d2f', token: '--border', note: 'Borders and dividers' },
  { name: 'Foreground', hex: '#f5f8ef', token: '--foreground', note: 'Primary text' },
  { name: 'Muted', hex: '#a0aba7', token: '--muted-foreground', note: 'Secondary / placeholder text' },
  { name: 'Destructive', hex: '#ef4444', token: '--destructive', note: 'Errors, delete actions' },
];

function Section({ id, title, description, refText, children }: { id: string; title: string; description?: string; refText?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-20 scroll-mt-8">
      <div className="mb-6 border-b border-border pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {refText && <RefBlock text={refText} />}
        </div>
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, hex, token, note }: { name: string; hex: string; token: string; note: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-16 w-full border border-border" style={{ background: hex }} />
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="font-mono text-xs text-muted-foreground">{hex}</p>
        <p className="text-xs text-muted-foreground">{token}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">{note}</p>
      </div>
    </div>
  );
}

function Preview({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      {label && <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>}
      <div className="border border-border bg-muted/20 p-6">
        {children}
      </div>
    </div>
  );
}

function RefBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} className="mt-4 flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
      <Copy className="size-3" /> {copied ? 'Copied to clipboard' : 'Copy agent prompt'}
    </button>
  );
}

function AnimatedProgress() {
  const [value, setValue] = useState(0);
  const [running, setRunning] = useState(false);
  function start() {
    if (running) return;
    setRunning(true);
    setValue(0);
    let v = 0;
    const id = setInterval(() => {
      v += Math.floor(Math.random() * 12) + 4;
      if (v >= 100) { v = 100; clearInterval(id); setRunning(false); }
      setValue(v);
    }, 120);
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-muted-foreground">Upload progress</span>
        <span className="font-mono text-sm text-primary">{value}%</span>
      </div>
      <Progress value={value} />
      <Button size="sm" variant="outline" onClick={start} disabled={running}>
        {running ? 'Running…' : value === 100 ? 'Run again' : 'Start'}
      </Button>
    </div>
  );
}

export default function GuideLibraryPage() {
  const [activeNav, setActiveNav] = useState('colors');
  const [isDark, setIsDark] = useState(true);
  const clickedRef = useRef(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
  }, [isDark]);

  useEffect(() => {
    const allIds = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.id));
    const observers: IntersectionObserver[] = [];
    allIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting && !clickedRef.current) setActiveNav(id); },
        { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <TooltipProvider>
    <div className="flex min-h-screen bg-background text-foreground">

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-52 overflow-y-auto border-r border-border bg-card px-4 py-8">
        <div className="mb-8">
          <img src="/Aorthar Logo long complete.svg" alt="Aorthar" className="h-7 w-auto brightness-0 dark:brightness-100" />
          <h1 className="mt-1 text-base font-bold">Design System</h1>
        </div>
        <nav className="space-y-4">
          {NAV_GROUPS.map(({ group, items }) => (
            <div key={group}>
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{group}</p>
              <div className="space-y-0.5">
                {items.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={() => {
                      setActiveNav(id);
                      clickedRef.current = true;
                      setTimeout(() => { clickedRef.current = false; }, 800);
                    }}
                    className={`block rounded-none px-3 py-1.5 text-[13px] transition-colors ${activeNav === id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-12 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">All components use <span className="font-mono">rounded-none</span>. No curves.</p>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-52 flex-1 px-12 py-10 max-w-4xl">

        {/* Page header */}
        <div className="mb-16">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="inline-block h-3 w-3 bg-primary" />
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">v1.0</p>
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Component Library</h1>
              <p className="mt-3 max-w-xl text-muted-foreground">
                All UI primitives for the Aorthar design system. Sharp edges, lemon accents, dark-first.
              </p>
            </div>
            <div className="flex items-center gap-2 border border-border bg-card px-3 py-1.5">
              <Sun className="size-3.5 text-muted-foreground" />
              <Switch checked={isDark} onCheckedChange={setIsDark} />
              <Moon className="size-3.5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════ FOUNDATIONS ════════════════════════════════════════════ */}

        {/* ── COLORS ── */}
        <Section id="colors" title="Colors" description="Core brand palette and semantic tokens." refText={`Aorthar color tokens (dark mode primary):
- --primary: #a7d252 (lemon) — active states, CTAs, highlights
- --primary-foreground: #121413 (dark on lemon)
- --secondary: #24453b — secondary backgrounds
- --accent: #2a5a4b — hover backgrounds
- --background: #101112 — page bg
- --card: #18191a — card/popover surfaces
- --border: #2a2d2f — borders, dividers
- --foreground: #f5f8ef — primary text
- --muted-foreground: #a0aba7 — secondary text
- --destructive: oklch(0.704 0.191 22.216) — errors, delete

Light mode swaps: --primary becomes #08694a (dark green), --secondary becomes #a7d252 (lemon).
Brand hex: #a7d252 (Lemon), #08694a (Dark Green), #18191a (Ink).
All components use rounded-none. No border-radius.`}>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {COLORS.map((c) => <Swatch key={c.name} {...c} />)}
          </div>
          <div className="mt-8 border border-border bg-card p-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Brand mark</p>
            <div className="flex items-center gap-3">
              <img src="/Aorthar Favion.svg" alt="Aorthar" className="h-4 w-4" />
              <span className="font-mono text-sm text-primary">#a7d252 — Lemon</span>
            </div>
          </div>
        </Section>

        {/* ── TYPOGRAPHY ── */}
        <Section id="typography" title="Typography" description="Type scale. Impact for H1 display; system sans-serif for everything else." refText={`Typography rules:
- H1 display (hero): font-family Impact — 85px, weight 400, line-height 71.4px, letter-spacing -3.825px, uppercase
- Body font: "Helvetica Neue" (mapped as --font-sans)
- Mono font: "SFMono-Regular", Menlo, Monaco, Consolas (mapped as --font-mono)
- Scale: text-4xl/bold (display), text-3xl/bold (section), text-2xl/semibold (page title), text-xl/medium (subheading), text-base (body), text-sm + text-muted-foreground (meta), text-xs/uppercase/tracking-widest (labels)
- Impact on lemon bg: use color #101112 (dark)
- Impact on dark bg: use color #FFF`}>
          <Preview label="Impact H1 — website display">
            <div>
              <p className="mb-3 font-mono text-[10px] text-muted-foreground">font-family: Impact · 85px · weight 400 · line-height 71.4px · letter-spacing -3.825px · uppercase</p>
              <p style={{ color: '#FFF', fontFamily: 'Impact', fontSize: 85, fontWeight: 400, lineHeight: '71.4px', letterSpacing: '-3.825px', textTransform: 'uppercase' }}>
                Build Sharp
              </p>
            </div>
          </Preview>
          <Preview label="Impact H1 — on lemon">
            <div style={{ background: '#a7d252', padding: '24px 32px', display: 'inline-block' }}>
              <p style={{ color: '#101112', fontFamily: 'Impact', fontSize: 85, fontWeight: 400, lineHeight: '71.4px', letterSpacing: '-3.825px', textTransform: 'uppercase' }}>
                Aorthar
              </p>
            </div>
          </Preview>
          <Preview label="Body type scale">
            <div className="space-y-6">
              <div><p className="mb-1 font-mono text-[10px] text-muted-foreground">text-4xl / font-bold</p><p className="text-4xl font-bold leading-none">Display heading</p></div>
              <div><p className="mb-1 font-mono text-[10px] text-muted-foreground">text-3xl / font-bold</p><p className="text-3xl font-bold">Section heading</p></div>
              <div><p className="mb-1 font-mono text-[10px] text-muted-foreground">text-2xl / font-semibold</p><p className="text-2xl font-semibold">Page title</p></div>
              <div><p className="mb-1 font-mono text-[10px] text-muted-foreground">text-xl / font-medium</p><p className="text-xl font-medium">Sub-heading</p></div>
              <div><p className="mb-1 font-mono text-[10px] text-muted-foreground">text-base</p><p className="text-base">Body text — the quick brown fox jumps over the lazy dog.</p></div>
              <div><p className="mb-1 font-mono text-[10px] text-muted-foreground">text-sm / text-muted-foreground</p><p className="text-sm text-muted-foreground">Secondary / meta text — labels, captions, timestamps.</p></div>
              <div><p className="mb-1 font-mono text-[10px] text-muted-foreground">text-xs / uppercase / tracking-widest</p><p className="text-xs uppercase tracking-widest text-muted-foreground">Section label</p></div>
              <div><p className="mb-1 font-mono text-[10px] text-muted-foreground">font-mono</p><p className="font-mono text-sm">/api/admin/studio/case-studies/:id</p></div>
            </div>
          </Preview>
        </Section>

        {/* ── LOGOS ── */}
        <Section id="logos" title="Logos" description="Wordmark and icon mark. Usage rules and clear space." refText={`Logo usage:
- Wordmark: /Aorthar Logo long complete.svg
- Icon mark: /Aorthar Favion.svg (lemon #A7D252 strokes, no background)
- Minimum clear space: 1x icon height on all sides
- Dark bg wordmark: brightness-0 dark:brightness-100 on SVG
- Do not stretch, rotate, or apply effects`}>
          <Preview label="Wordmark">
            <div className="flex items-center gap-6">
              <img src="/Aorthar Logo long complete.svg" alt="Aorthar" className="h-8 w-auto brightness-0 dark:brightness-100" />
              <img src="/Aorthar Logo long complete.svg" alt="Aorthar" className="h-6 w-auto" />
            </div>
          </Preview>
          <Preview label="Icon mark">
            <div className="flex items-end gap-8">
              <img src="/Aorthar Favion.svg" alt="Aorthar" className="h-24 w-24" />
              <img src="/Aorthar Favion.svg" alt="Aorthar" className="h-16 w-16" />
              <img src="/Aorthar Favion.svg" alt="Aorthar" className="h-12 w-12" />
            </div>
          </Preview>
          <Preview label="Usage rules">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Minimum clear space: 1x the icon height on all sides.</p>
              <p>Do not stretch, rotate, or apply effects to the logo.</p>
              <p>Icon mark: lemon (#A7D252) strokes, no background.</p>
              <p>Wordmark: use brightness-0 dark:brightness-100 for dark/light mode.</p>
            </div>
          </Preview>
        </Section>

        {/* ── ICONS ── */}
        <Section id="icons" title="Icons" description="Primary icon set (Lucide). Size scale and usage." refText={`Icon system:
- Library: lucide-react (import individual icons)
- Size classes: size-3 (12px), size-4 (16px, default), size-5 (20px), size-6 (24px), size-8 (32px), size-10 (40px)
- Use inline: <Icon className="size-4 text-foreground" />
- On primary bg: text-primary-foreground
- On muted bg: text-muted-foreground
- Common icons: Home, User, Settings, Mail, Search, Calendar, FileText, Download, Upload, Trash2, Plus, Check, Star, ArrowLeft/Right, ChevronDown/Right, MoreHorizontal, Filter, Eye, Edit, Copy, Share2, ExternalLink
- Icon-only buttons: use Button size="icon" or "icon-sm" or "icon-lg"`}>
          <Preview label="Icon set — sample Lucide icons">
            <div className="grid grid-cols-8 gap-4">
              {[
                { Icon: Home, label: 'Home' }, { Icon: User, label: 'User' }, { Icon: Settings, label: 'Settings' },
                { Icon: Mail, label: 'Mail' }, { Icon: Search, label: 'Search' }, { Icon: Bell, label: 'Bell' },
                { Icon: Calendar, label: 'Calendar' }, { Icon: FileText, label: 'FileText' },
                { Icon: Download, label: 'Download' }, { Icon: Upload, label: 'Upload' }, { Icon: Trash2, label: 'Trash' },
                { Icon: Edit, label: 'Edit' }, { Icon: Plus, label: 'Plus' }, { Icon: Minus, label: 'Minus' },
                { Icon: Check, label: 'Check' }, { Icon: X, label: 'X' },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <Icon className="size-5 text-foreground" />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </Preview>
          <Preview label="Size scale">
            <div className="flex items-end gap-6">
              {[12, 16, 20, 24, 32, 40].map((s) => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <Star style={{ width: s, height: s }} className="text-primary" />
                  <span className="text-[10px] text-muted-foreground">{s}px</span>
                </div>
              ))}
            </div>
          </Preview>
        </Section>

        {/* ── MISC ICONS ── */}
        <Section id="misc-icons" title="Misc Icons" description="Custom / brand icons used across the app." refText={`Brand / misc icons (lucide-react):
- Leaf — growth, organic, nature
- Rocket — launch, speed, new features
- Award — achievement, certificate, completion
- GraduationCap — education, university, learning
- Flame — trending, hot, popular
- Sparkles — premium, special, magic
- Use with text-primary for brand accent, text-muted-foreground for neutral`}>
          <Preview label="Brand icons">
            <div className="grid grid-cols-6 gap-6">
              {[
                { Icon: Leaf, label: 'Leaf / Growth' }, { Icon: Rocket, label: 'Rocket / Launch' },
                { Icon: Award, label: 'Award / Achievement' }, { Icon: GraduationCap, label: 'Education' },
                { Icon: Flame, label: 'Flame / Hot' }, { Icon: Sparkles, label: 'Sparkles / Premium' },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <Icon className="size-6 text-primary" />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </Preview>
        </Section>

        {/* ── EFFECT STYLES ── */}
        <Section id="effect-styles" title="Effect Styles" description="Shadows, glows, overlays, and visual effects." refText={`Effects:
- Shadows: shadow-sm, shadow, shadow-md, shadow-lg (Tailwind defaults)
- Primary glow: bg-primary/10 border border-primary/20
- Destructive glow: bg-destructive/10 border border-destructive/20
- Overlay: absolute inset-0 bg-background/60
- Grain texture: SVG feTurbulence filter, opacity-[0.03], absolute inset-0
- Body gradients (dark): radial-gradient lime at 85% top + radial-gradient forest at -10% top + linear gradient
- Selection: background rgba(8,105,74,0.2) color #0f2a21
- Animations: [data-reveal] scroll-reveal, .landing-pulse (7s), .landing-float (10s)`}>
          <Preview label="Shadows">
            <div className="flex gap-6">
              <div className="h-20 w-40 border border-border bg-card shadow-sm flex items-center justify-center text-xs text-muted-foreground">shadow-sm</div>
              <div className="h-20 w-40 border border-border bg-card shadow flex items-center justify-center text-xs text-muted-foreground">shadow</div>
              <div className="h-20 w-40 border border-border bg-card shadow-md flex items-center justify-center text-xs text-muted-foreground">shadow-md</div>
              <div className="h-20 w-40 border border-border bg-card shadow-lg flex items-center justify-center text-xs text-muted-foreground">shadow-lg</div>
            </div>
          </Preview>
          <Preview label="Glows">
            <div className="flex gap-6">
              <div className="h-20 w-40 bg-primary/10 border border-primary/20 flex items-center justify-center text-xs text-primary">primary glow</div>
              <div className="h-20 w-40 bg-destructive/10 border border-destructive/20 flex items-center justify-center text-xs text-destructive">destructive glow</div>
            </div>
          </Preview>
          <Preview label="Overlays">
            <div className="relative h-24 w-full bg-muted flex items-center justify-center">
              <span className="text-sm text-muted-foreground">Base layer</span>
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center text-sm">Overlay (60%)</div>
            </div>
          </Preview>
          <Preview label="Grain texture">
            <div className="relative h-24 w-full bg-card flex items-center justify-center overflow-hidden">
              <span className="relative z-10 text-sm text-muted-foreground">With grain texture</span>
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
            </div>
          </Preview>
        </Section>

        {/* ── SPACING ── */}
        <Section id="spacing" title="Spacing, Radius & Grids" description="Spacing scale, border-radius (always 0), grid system." refText={`Spacing & layout:
- Spacing scale: space-1 (4px), space-2 (8px), space-3 (12px), space-4 (16px), space-5 (20px), space-6 (24px), space-8 (32px), space-10 (40px), space-12 (48px)
- Border radius: ALWAYS rounded-none (0px). No curves anywhere.
- CSS --radius exists (0.625rem) but override with Tailwind rounded-none on all components.
- Grid: standard Tailwind grid — grid-cols-2, grid-cols-3, grid-cols-4 with gap-4 or gap-6
- Dashboard layout: px-[15%] padding from (dashboard)/layout.tsx — do not add per-page horizontal padding`}>
          <Preview label="Spacing scale">
            <div className="space-y-3">
              {[
                { space: '1', px: 4, label: '4px' },
                { space: '2', px: 8, label: '8px' },
                { space: '3', px: 12, label: '12px' },
                { space: '4', px: 16, label: '16px' },
                { space: '5', px: 20, label: '20px' },
                { space: '6', px: 24, label: '24px' },
                { space: '8', px: 32, label: '32px' },
                { space: '10', px: 40, label: '40px' },
                { space: '12', px: 48, label: '48px' },
              ].map(({ space, px, label }) => (
                <div key={space} className="flex items-center gap-4">
                  <span className="w-12 text-xs text-muted-foreground">space-{space}</span>
                  <div className="h-4 bg-primary/30" style={{ width: px }} />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </Preview>
          <Preview label="Border radius — all 0">
            <div className="flex gap-4">
              <div className="h-12 w-24 bg-primary flex items-center justify-center text-xs text-primary-foreground rounded-none">rounded-none</div>
              <div className="h-12 w-24 bg-muted flex items-center justify-center text-xs text-muted-foreground border border-border">No curves anywhere</div>
            </div>
          </Preview>
          <Preview label="Grid system">
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map((i) => <div key={i} className="h-10 bg-primary/20 border border-primary/30 flex items-center justify-center text-xs">col</div>)}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1,2,3].map((i) => <div key={i} className="h-10 bg-primary/20 border border-primary/30 flex items-center justify-center text-xs">col</div>)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1,2].map((i) => <div key={i} className="h-10 bg-primary/20 border border-primary/30 flex items-center justify-center text-xs">col</div>)}
              </div>
            </div>
          </Preview>
        </Section>

        {/* ── PORTFOLIO MOCKUPS ── */}
        <Section id="portfolio-mockups" title="Portfolio Mockups" description="Device frames and presentation mockups." refText={`Device mockups:
- Desktop frame: border border-border bg-card, top bar with 3 dots + address bar, content area bg-muted/30
- Mobile frame: border border-border bg-card, notch bar (h-6, centered pill), content area, home indicator bar
- Use for: hero images, portfolio previews, app screenshots
- Keep frames sharp (rounded-none)`}>
          <Preview label="Desktop frame">
            <div className="border border-border bg-card overflow-hidden max-w-lg">
              <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                <span className="ml-3 flex-1 h-5 bg-muted rounded-none" />
              </div>
              <div className="h-48 bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">Website preview</div>
            </div>
          </Preview>
          <Preview label="Mobile frame">
            <div className="border border-border bg-card overflow-hidden w-48 mx-auto">
              <div className="h-6 bg-muted flex items-center justify-center"><span className="h-1.5 w-12 bg-muted-foreground/20 rounded-full" /></div>
              <div className="h-64 bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">App preview</div>
              <div className="h-5 bg-muted flex items-center justify-center"><span className="h-1 w-16 bg-muted-foreground/20 rounded-full" /></div>
            </div>
          </Preview>
        </Section>

        {/* ── DESIGN ANNOTATIONS ── */}
        <Section id="design-annotations" title="Design Annotations" description="Redline / spec annotation components." refText={`Annotations:
- Spacing annotation: horizontal h-px bg-destructive line with "16px" label between two elements
- Dimension annotation: vertical measurement line with "320px" label above element
- Color annotation: color swatch + mono label with hex value (e.g. "bg-primary #a7d252")
- Use for design specs, QA reviews, and handoff documentation`}>
          <Preview label="Spacing annotation">
            <div className="flex items-center gap-4">
              <div className="h-10 w-24 bg-primary flex items-center justify-center text-xs text-primary-foreground">Element</div>
              <div className="flex flex-col items-center">
                <div className="h-px w-12 bg-destructive" />
                <span className="text-[10px] text-destructive mt-1">16px</span>
              </div>
              <div className="h-10 w-24 bg-muted flex items-center justify-center text-xs text-muted-foreground border border-border">Element</div>
            </div>
          </Preview>
          <Preview label="Dimension annotation">
            <div className="flex flex-col items-start gap-2">
              <div className="relative">
                <div className="h-10 w-40 bg-primary/20 border border-primary/30" />
                <div className="absolute -top-4 left-0 right-0 flex items-center justify-center">
                  <div className="h-px flex-1 bg-destructive" />
                  <span className="text-[10px] text-destructive px-1">320px</span>
                  <div className="h-px flex-1 bg-destructive" />
                </div>
              </div>
            </div>
          </Preview>
          <Preview label="Color annotation">
            <div className="flex items-center gap-4">
              <div className="h-10 w-24 bg-primary" />
              <div className="flex flex-col">
                <span className="text-xs font-mono text-foreground">bg-primary</span>
                <span className="text-[10px] text-muted-foreground">#a7d252</span>
              </div>
            </div>
          </Preview>
        </Section>

        {/* ════════════════════════════════════════════ SHARED COMPONENTS ════════════════════════════════════════════ */}

        {/* ── BUTTONS ── */}
        <Section id="buttons" title="Buttons" description="Six variants across four sizes. All sharp-edged." refText={`Button component: import { Button } from '@/components/ui/button'
Variants: default (bg-primary text-primary-foreground), outline, secondary, ghost, destructive, link
Sizes: lg (h-10), default (h-9), sm (h-8), xs (h-6), icon (size-9), icon-sm (size-8), icon-lg (size-10), icon-xs (size-6)
States: disabled (opacity-50), loading (animate-spin border on child)
Icons: <Button><Plus className="size-4" /> Create</Button> — icon auto-sizes to 4 via [&_svg:not([class*='size-'])]:size-4
All buttons: rounded-none, font-medium, text-sm, whitespace-nowrap, transition-all`}>
          <Preview label="Variants">
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
          </Preview>
          <Preview label="Sizes">
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg">Large</Button>
              <Button size="default">Default</Button>
              <Button size="sm">Small</Button>
              <Button size="xs">XSmall</Button>
            </div>
          </Preview>
          <Preview label="States">
            <div className="flex flex-wrap gap-3">
              <Button disabled>Disabled</Button>
              <Button variant="outline" disabled>Disabled outline</Button>
              <Button><svg className="mr-1 size-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="50 150" /></svg>Loading</Button>
            </div>
          </Preview>
          <Preview label="With icons">
            <div className="flex flex-wrap gap-3">
              <Button><Plus className="size-4" /> Create</Button>
              <Button variant="outline"><Download className="size-4" /> Export</Button>
              <Button variant="ghost" size="icon"><Settings className="size-4" /></Button>
            </div>
          </Preview>
        </Section>

        {/* ── BUTTON GROUPS ── */}
        <Section id="button-groups" title="Button Groups" description="Segmented / connected button rows." refText={`Button groups:
- Container: inline-flex border border-border
- Each button: rounded-none, border-r-0 (except last), no gap between
- Segmented: <div className="inline-flex border border-border"><Button variant="outline" className="rounded-none border-r-0">Left</Button>...</div>
- Icon groups: same pattern with size="icon" buttons
- Mixed: text + icon buttons in same group`}>
          <Preview label="Segmented group">
            <div className="inline-flex border border-border">
              <Button variant="outline" className="rounded-none border-r-0">Left</Button>
              <Button variant="outline" className="rounded-none border-r-0">Center</Button>
              <Button variant="outline" className="rounded-none">Right</Button>
            </div>
          </Preview>
          <Preview label="Icon button group">
            <div className="inline-flex border border-border">
              <Button variant="outline" size="icon" className="rounded-none border-r-0"><ArrowLeft className="size-4" /></Button>
              <Button variant="outline" size="icon" className="rounded-none border-r-0"><ArrowRight className="size-4" /></Button>
              <Button variant="outline" size="icon" className="rounded-none"><RefreshCw className="size-4" /></Button>
            </div>
          </Preview>
          <Preview label="Mixed group">
            <div className="inline-flex border border-border">
              <Button variant="outline" className="rounded-none border-r-0"><Copy className="size-4" /> Copy</Button>
              <Button variant="outline" className="rounded-none border-r-0"><Share2 className="size-4" /> Share</Button>
              <Button variant="outline" size="icon" className="rounded-none"><Trash2 className="size-4" /></Button>
            </div>
          </Preview>
        </Section>

        {/* ── BADGES ── */}
        <Section id="badges" title="Badges" description="Small status indicators and labels." refText={`Badge component: import { Badge } from '@/components/ui/badge'
Variants: default (bg-primary), secondary, outline, destructive, ghost
Shape: rounded-full (badges are the one exception to rounded-none)
Size: inline-flex w-fit shrink-0, px-2 py-0.5, text-xs
Usage: <Badge>Published</Badge>, <Badge variant="secondary">Draft</Badge>, <Badge variant="outline">Tag</Badge>
Status pattern: default=published/active, secondary=draft, destructive=archived/error, ghost=neutral/free`}>
          <Preview label="Variants">
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="ghost">Ghost</Badge>
            </div>
          </Preview>
          <Preview label="In context">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Draft</Badge>
              <Badge>Published</Badge>
              <Badge variant="outline">Brand Identity</Badge>
              <Badge variant="outline">Strategy</Badge>
              <Badge variant="destructive">Archived</Badge>
              <Badge variant="ghost">Free</Badge>
            </div>
          </Preview>
        </Section>

        {/* ── TAGS ── */}
        <Section id="tags" title="Tags" description="Removable / interactive tags." refText={`Tags (custom, not shadcn):
- Base: inline-flex items-center gap-1.5 border border-border bg-muted/50 px-2.5 py-1 text-xs
- Variants: default (border bg-card), primary (border-primary/30 bg-primary/10 text-primary), destructive (border-destructive/30 bg-destructive/10 text-destructive), muted (bg-muted text-muted-foreground)
- Removable: add × button with text-muted-foreground hover:text-foreground
- Interactive: add cursor-pointer hover:bg-muted transition-colors
- Status dot: <span className="h-1.5 w-1.5 bg-primary" /> for active state`}>
          <Preview label="Removable tags">
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Next.js', 'Supabase', 'Tailwind'].map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 border border-border bg-muted/50 px-2.5 py-1 text-xs">
                  {tag}
                  <button className="text-muted-foreground hover:text-foreground"><span className="text-xs">×</span></button>
                </span>
              ))}
            </div>
          </Preview>
          <Preview label="Tag variants">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 border border-border bg-card px-2.5 py-1 text-xs">Default</span>
              <span className="inline-flex items-center gap-1 border border-primary/30 bg-primary/10 text-primary px-2.5 py-1 text-xs">Primary</span>
              <span className="inline-flex items-center gap-1 border border-destructive/30 bg-destructive/10 text-destructive px-2.5 py-1 text-xs">Destructive</span>
              <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 text-xs text-muted-foreground">Muted</span>
            </div>
          </Preview>
          <Preview label="Interactive tags">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 border border-border bg-card px-2.5 py-1 text-xs cursor-pointer hover:bg-muted transition-colors">
                <span className="h-1.5 w-1.5 bg-primary" /> Active
              </span>
              <span className="inline-flex items-center gap-1.5 border border-border bg-card px-2.5 py-1 text-xs cursor-pointer hover:bg-muted transition-colors">
                <span className="h-1.5 w-1.5 bg-muted-foreground/40" /> Inactive
              </span>
            </div>
          </Preview>
        </Section>

        {/* ── DROPDOWNS ── */}
        <Section id="dropdowns" title="Dropdowns" description="Context menus and action menus triggered by a button." refText={`DropdownMenu: import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup } from '@/components/ui/dropdown-menu'
Pattern: <DropdownMenu><DropdownMenuTrigger asChild><Button>...</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>...</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
Icons in items: <DropdownMenuItem><User className="mr-2 size-4" /> Profile</DropdownMenuItem>
Destructive item: <DropdownMenuItem className="text-destructive focus:text-destructive">
Separator: <DropdownMenuSeparator />
Label: <DropdownMenuLabel>My Account</DropdownMenuLabel>`}>
          <Preview label="User actions menu">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Account <ChevronDown className="ml-1 size-3.5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem><User className="mr-2 size-4" /> Profile</DropdownMenuItem>
                  <DropdownMenuItem><Settings className="mr-2 size-4" /> Settings</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="mr-2 size-4" /> Delete account</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Preview>
          <Preview label="Case study actions">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">Actions <ChevronDown className="ml-1 size-3" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>View live</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">Archive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Preview>
        </Section>

        {/* ── INPUTS ── */}
        <Section id="inputs" title="Inputs" description="Text, email, password, number inputs. States: default, disabled, error." refText={`Input components: import { Input } from '@/components/ui/input' / import { Textarea } from '@/components/ui/textarea' / import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select' / import { Label } from '@/components/ui/label'
Input types: text, email, password, number, date — all use type prop
States: default, disabled (disabled prop), error (className border-destructive focus-visible:ring-destructive + <p className="text-xs text-destructive">)
With icon: wrap in relative div, absolute icon left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground, input pl-9
Textarea: <Textarea placeholder="..." rows={3} />
Select: <Select defaultValue="draft"><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem></SelectContent></Select>
Label: <Label htmlFor="id">Label text</Label>`}>
          <Preview label="Text inputs">
            <div className="max-w-sm space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="inp-text">Text input</Label>
                <Input id="inp-text" placeholder="e.g. Test Canvas Study" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inp-email">Email</Label>
                <Input id="inp-email" type="email" placeholder="admin@aorthar.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inp-pw">Password</Label>
                <Input id="inp-pw" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inp-num">Number</Label>
                <Input id="inp-num" type="number" placeholder="0" />
              </div>
            </div>
          </Preview>
          <Preview label="States">
            <div className="max-w-sm space-y-4">
              <div className="space-y-1.5">
                <Label>Disabled</Label>
                <Input value="Read-only value" disabled />
              </div>
              <div className="space-y-1.5">
                <Label className="text-destructive">Error</Label>
                <Input className="border-destructive focus-visible:ring-destructive" value="Invalid input" />
                <p className="text-xs text-destructive">This field is required.</p>
              </div>
            </div>
          </Preview>
          <Preview label="With icon">
            <div className="max-w-sm space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input type="email" placeholder="Email address" className="pl-9" />
              </div>
            </div>
          </Preview>
          <Preview label="Textarea">
            <div className="max-w-sm space-y-1.5">
              <Label htmlFor="inp-ta">Subtitle</Label>
              <Textarea id="inp-ta" placeholder="Describe the project…" />
            </div>
          </Preview>
          <Preview label="Select">
            <div className="max-w-xs space-y-1.5">
              <Label>Status</Label>
              <Select defaultValue="draft">
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Preview>
        </Section>

        {/* ── TOGGLES ── */}
        <Section id="toggles" title="Toggles" description="Switch on/off boolean toggle." refText={`Switch: import { Switch } from '@/components/ui/switch'
Sizes: "default" (h-[1.15rem] w-8), "sm" (h-3.5 w-6)
States: default (unchecked), defaultChecked, disabled
Pattern: <div className="flex items-center gap-3"><Switch id="toggle" /><Label htmlFor="toggle">Label</Label></div>
Checked: data-[state=checked]:bg-primary, unchecked: bg-input
Thumb: rounded-full, checked: translate-x-[calc(100%-2px)]
With description: add <p className="text-xs text-muted-foreground"> below Label`}>
          <Preview label="Default">
            <div className="flex items-center gap-3">
              <Switch id="toggle-1" />
              <Label htmlFor="toggle-1">Enable notifications</Label>
            </div>
          </Preview>
          <Preview label="Checked state">
            <div className="flex items-center gap-3">
              <Switch id="toggle-2" defaultChecked />
              <Label htmlFor="toggle-2">Auto-save drafts</Label>
            </div>
          </Preview>
          <Preview label="Disabled">
            <div className="flex items-center gap-3">
              <Switch disabled />
              <Label className="text-muted-foreground">Locked setting</Label>
            </div>
          </Preview>
          <Preview label="Small size">
            <div className="flex items-center gap-3">
              <Switch size="sm" id="toggle-sm" />
              <Label htmlFor="toggle-sm" className="text-sm">Compact mode</Label>
            </div>
          </Preview>
          <Preview label="With description">
            <div className="flex items-center gap-3">
              <Switch id="toggle-desc" defaultChecked />
              <div>
                <Label htmlFor="toggle-desc">Premium content</Label>
                <p className="text-xs text-muted-foreground">Show premium-only courses to all users</p>
              </div>
            </div>
          </Preview>
        </Section>

        {/* ── CHECKBOXES ── */}
        <Section id="checkboxes" title="Checkboxes" description="Single checkbox, checked / unchecked / disabled states." refText={`Checkbox: import { Checkbox } from '@/components/ui/checkbox'
States: unchecked, defaultChecked, disabled, defaultChecked disabled
Pattern: <div className="flex items-center gap-2"><Checkbox id="cb" /><Label htmlFor="cb">Label</Label></div>
Checked: bg-primary text-primary-foreground with CheckIcon
Unchecked: border border-input, rounded-[4px]
With description: <div className="flex items-start gap-2"><Checkbox className="mt-0.5" /><div><Label>...</Label><p className="text-xs text-muted-foreground">...</p></div></div>`}>
          <Preview label="States">
            <div className="space-y-3">
              <div className="flex items-center gap-2"><Checkbox id="cb-unchecked" /><Label htmlFor="cb-unchecked">Unchecked</Label></div>
              <div className="flex items-center gap-2"><Checkbox id="cb-checked" defaultChecked /><Label htmlFor="cb-checked">Checked</Label></div>
              <div className="flex items-center gap-2"><Checkbox disabled /><Label className="text-muted-foreground">Disabled</Label></div>
              <div className="flex items-center gap-2"><Checkbox defaultChecked disabled /><Label className="text-muted-foreground">Disabled checked</Label></div>
            </div>
          </Preview>
          <Preview label="With description">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox id="cb-desc" className="mt-0.5" defaultChecked />
                <div>
                  <Label htmlFor="cb-desc">Publish course</Label>
                  <p className="text-xs text-muted-foreground">Make this course visible to all students</p>
                </div>
              </div>
            </div>
          </Preview>
        </Section>

        {/* ── CHECKBOX GROUPS ── */}
        <Section id="checkbox-groups" title="Checkbox Groups" description="Grouped checkbox lists." refText={`Checkbox groups:
- Wrap in a container with <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2"> for group label
- Each item: <div className="flex items-center gap-2"><Checkbox id="perm-1" /><Label htmlFor="perm-1">Label</Label></div>
- Spacing: space-y-2 between items, space-y-4 between groups
- Pre-check with defaultChecked prop
- Use for: permissions, notification preferences, multi-select filters, bulk actions`}>
          <Preview label="Permission groups">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Course permissions</p>
                <div className="space-y-2">
                  {['View courses', 'Edit content', 'Manage quizzes', 'Delete courses'].map((item, i) => (
                    <div key={item} className="flex items-center gap-2">
                      <Checkbox id={`perm-${i}`} defaultChecked={i < 2} />
                      <Label htmlFor={`perm-${i}`}>{item}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Preview>
          <Preview label="Notification preferences">
            <div className="space-y-2">
              {['Email notifications', 'Push notifications', 'SMS alerts', 'Weekly digest'].map((item, i) => (
                <div key={item} className="flex items-center gap-2">
                  <Checkbox id={`notif-${i}`} defaultChecked={i === 0} />
                  <Label htmlFor={`notif-${i}`}>{item}</Label>
                </div>
              ))}
            </div>
          </Preview>
        </Section>

        {/* ── AVATARS ── */}
        <Section id="avatars" title="Avatars" description="Square user avatars, fallback initials, badge, group." refText={`Avatar: import { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar'
Sizes: "lg" (size-10), "default" (size-8), "sm" (size-6)
Pattern: <Avatar size="lg"><AvatarImage src="..." alt="User" /><AvatarFallback>MO</AvatarFallback></Avatar>
With badge: <Avatar><AvatarFallback>MO</AvatarFallback><AvatarBadge /></AvatarBadge> — online/active indicator
Group: <AvatarGroup><Avatar>...</Avatar><Avatar>...</Avatar><AvatarGroupCount>+4</AvatarGroupCount></AvatarGroup>
Group overlap: -space-x-2 with ring-2 ring-background on each avatar
All avatars: rounded-none (square)`}>
          <Preview label="Sizes">
            <div className="flex items-end gap-4">
              <Avatar size="lg"><AvatarImage src="https://github.com/shadcn.png" alt="User" /><AvatarFallback>MO</AvatarFallback></Avatar>
              <Avatar size="default"><AvatarImage src="https://github.com/shadcn.png" alt="User" /><AvatarFallback>MO</AvatarFallback></Avatar>
              <Avatar size="sm"><AvatarImage src="https://github.com/shadcn.png" alt="User" /><AvatarFallback>MO</AvatarFallback></Avatar>
            </div>
          </Preview>
          <Preview label="Fallback initials">
            <div className="flex items-center gap-4">
              <Avatar size="lg"><AvatarFallback>MO</AvatarFallback></Avatar>
              <Avatar size="default"><AvatarFallback>TY</AvatarFallback></Avatar>
              <Avatar size="sm"><AvatarFallback>AD</AvatarFallback></Avatar>
            </div>
          </Preview>
          <Preview label="With badge">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarFallback>MO</AvatarFallback>
                <AvatarBadge />
              </Avatar>
              <Avatar size="default">
                <AvatarFallback>TY</AvatarFallback>
                <AvatarBadge />
              </Avatar>
            </div>
          </Preview>
          <Preview label="Group">
            <AvatarGroup>
              <Avatar><AvatarFallback>MO</AvatarFallback></Avatar>
              <Avatar><AvatarFallback>TY</AvatarFallback></Avatar>
              <Avatar><AvatarFallback>AD</AvatarFallback></Avatar>
              <AvatarGroupCount>+4</AvatarGroupCount>
            </AvatarGroup>
          </Preview>
        </Section>

        {/* ── TOOLTIPS ── */}
        <Section id="tooltips" title="Tooltips" description="Hover tooltips (top / bottom / left / right)." refText={`Tooltip: import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
Wrap app in <TooltipProvider> (delayDuration=0 by default)
Pattern: <Tooltip><TooltipTrigger asChild><Button>Trigger</Button></TooltipTrigger><TooltipContent side="top"><p>Tooltip text</p></TooltipContent></Tooltip>
Sides: top, bottom, left, right
Style: bg-foreground text-background, rounded-md, with arrow
Use on icon buttons, compact UI, or anywhere label is hidden
Tooltip has arrow indicator pointing to trigger`}>
          <Preview label="Positions">
            <div className="flex flex-wrap gap-4">
              <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm">Top</Button></TooltipTrigger><TooltipContent side="top"><p>Tooltip top</p></TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm">Bottom</Button></TooltipTrigger><TooltipContent side="bottom"><p>Tooltip bottom</p></TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm">Left</Button></TooltipTrigger><TooltipContent side="left"><p>Tooltip left</p></TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm">Right</Button></TooltipTrigger><TooltipContent side="right"><p>Tooltip right</p></TooltipContent></Tooltip>
            </div>
          </Preview>
          <Preview label="On icons">
            <div className="flex gap-4">
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon"><Settings className="size-4" /></Button></TooltipTrigger><TooltipContent><p>Settings</p></TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon"><Info className="size-4" /></Button></TooltipTrigger><TooltipContent><p>More info</p></TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon"><HelpCircle className="size-4" /></Button></TooltipTrigger><TooltipContent><p>Help</p></TooltipContent></Tooltip>
            </div>
          </Preview>
        </Section>

        {/* ── PROGRESS INDICATORS ── */}
        <Section id="progress-indicators" title="Progress Indicators" description="Progress bar + animated demo." refText={`Progress: import { Progress } from '@/components/ui/progress'
Props: value (0-100)
Pattern: <Progress value={75} />
Bar: bg-primary (lemon), track: bg-muted, h-1.5, rounded-full
Label pattern: <div className="flex justify-between mb-1.5 text-xs text-muted-foreground"><span>75%</span><span>Label</span></div>
Circular variant: SVG with two circles (track stroke-muted, fill stroke-primary), strokeDasharray for percentage
Use for: file upload, course completion, quiz progress, enrollment status`}>
          <Preview label="Interactive">
            <AnimatedProgress />
          </Preview>
          <Preview label="Static states">
            <div className="space-y-4 max-w-sm">
              {[{ v: 0, l: 'Empty' }, { v: 25, l: 'Starting' }, { v: 50, l: 'Halfway' }, { v: 75, l: 'Almost done' }, { v: 100, l: 'Complete' }].map(({ v, l }) => (
                <div key={v}>
                  <div className="flex justify-between mb-1.5 text-xs text-muted-foreground"><span>{v}%</span><span>{l}</span></div>
                  <Progress value={v} />
                </div>
              ))}
            </div>
          </Preview>
          <Preview label="Circular indicators">
            <div className="flex gap-8 items-center">
              {[20, 40, 60, 80, 100].map((v) => (
                <div key={v} className="flex flex-col items-center gap-2">
                  <div className="relative size-12">
                    <svg className="size-12 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted" strokeWidth="3" />
                      <circle cx="18" cy="18" r="16" fill="none" className="stroke-primary" strokeWidth="3" strokeDasharray={`${v} 100`} strokeLinecap="square" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono">{v}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Preview>
        </Section>

        {/* ── SLIDERS ── */}
        <Section id="sliders" title="Sliders" description="Range slider input." refText={`Slider: import { Slider } from '@/components/ui/slider'
Props: defaultValue={[50]}, min, max, disabled
Single: <Slider defaultValue={[60]} />
Range: <Slider defaultValue={[20, 80]} /> (two thumbs)
Disabled: <Slider defaultValue={[50]} disabled />
Track: bg-muted, h-1.5, rounded-full
Range fill: bg-primary (lemon)
Thumb: size-4, rounded-full, border border-primary bg-white, ring on focus
Label pattern: <div className="flex justify-between text-xs text-muted-foreground"><span>Label</span><span className="font-mono">Value</span></div>`}>
          <Preview label="Default">
            <div className="max-w-sm space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground"><span>Volume</span><span className="font-mono">60%</span></div>
                <Slider defaultValue={[60]} />
              </div>
            </div>
          </Preview>
          <Preview label="Range (two thumbs)">
            <div className="max-w-sm space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground"><span>Price range</span><span className="font-mono">$20 — $80</span></div>
              <Slider defaultValue={[20, 80]} />
            </div>
          </Preview>
          <Preview label="Disabled">
            <div className="max-w-sm">
              <Slider defaultValue={[50]} disabled />
            </div>
          </Preview>
        </Section>

        {/* ════════════════════════════════════════════ SHARED ASSETS ════════════════════════════════════════════ */}

        {/* ── LOGIN SIGNUP ── */}
        <Section id="login-signup" title="Login & Sign Up Pages" description="Auth page layouts." refText={`Login/Signup page pattern:
- Container: border border-border bg-card max-w-sm mx-auto p-8
- Logo: inline-block h-4 w-4 bg-primary + "Aorthar" bold
- Heading: text-xl font-semibold + text-sm text-muted-foreground subtitle
- Form: space-y-3 with Input components + full-width Button
- Footer: text-xs text-muted-foreground with "Don't have an account? Sign up" link
- Sign up: add Confirm password field
- No rounded corners on any element`}>
          <Preview label="Login page">
            <div className="border border-border bg-card max-w-sm mx-auto p-8">
              <div className="flex items-center gap-2 mb-6">
                <img src="/Aorthar Favion.svg" alt="Aorthar" className="h-4 w-4" />
                <span className="font-bold">Aorthar</span>
              </div>
              <h2 className="text-xl font-semibold mb-1">Welcome back</h2>
              <p className="text-sm text-muted-foreground mb-6">Sign in to your account</p>
              <div className="space-y-3">
                <Input placeholder="Email address" type="email" />
                <Input placeholder="Password" type="password" />
                <Button className="w-full">Sign in</Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">Don&apos;t have an account? <span className="text-primary cursor-pointer">Sign up</span></p>
            </div>
          </Preview>
          <Preview label="Sign up page">
            <div className="border border-border bg-card max-w-sm mx-auto p-8">
              <div className="flex items-center gap-2 mb-6">
                <img src="/Aorthar Favion.svg" alt="Aorthar" className="h-4 w-4" />
                <span className="font-bold">Aorthar</span>
              </div>
              <h2 className="text-xl font-semibold mb-1">Create account</h2>
              <p className="text-sm text-muted-foreground mb-6">Join Aorthar Academy</p>
              <div className="space-y-3">
                <Input placeholder="Full name" />
                <Input placeholder="Email address" type="email" />
                <Input placeholder="Password" type="password" />
                <Input placeholder="Confirm password" type="password" />
                <Button className="w-full">Create account</Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">Already have an account? <span className="text-primary cursor-pointer">Sign in</span></p>
            </div>
          </Preview>
        </Section>

        {/* ── 404 ── */}
        <Section id="404" title="404 Page" description="404 error page layout." refText={`404 page pattern:
- Centered layout: flex flex-col items-center justify-center py-16 text-center
- Big number: text-8xl font-bold text-primary/20 (transparent "404")
- Heading: text-2xl font-semibold "Page not found"
- Description: text-sm text-muted-foreground max-w-sm
- CTA: <Button>Go home</Button>
- Minimal, no sidebar, no nav`}>
          <Preview>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-8xl font-bold text-primary/20 mb-4">404</p>
              <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
              <Button>Go home</Button>
            </div>
          </Preview>
        </Section>

        {/* ── EMAIL TEMPLATES ── */}
        <Section id="email-templates" title="Email Templates" description="Transactional email template layouts." refText={`Email template pattern:
- Container: border border-border bg-card max-w-md mx-auto p-8
- Logo header: inline-block h-4 w-4 bg-primary + "Aorthar" bold
- Welcome: h2 + p text-muted-foreground + Button CTA
- Payment: Check icon + "Payment confirmed" + detail table (flex justify-between in border container) + Button
- Separator between content and footer
- Footer: text-xs text-muted-foreground
- Keep simple — email clients have limited CSS support`}>
          <Preview label="Welcome email">
            <div className="border border-border bg-card max-w-md mx-auto p-8">
              <div className="flex items-center gap-2 mb-6">
                <img src="/Aorthar Favion.svg" alt="Aorthar" className="h-4 w-4" />
                <span className="font-bold">Aorthar</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Welcome to Aorthar!</h2>
              <p className="text-sm text-muted-foreground mb-4">Your account has been created. Start exploring courses and building your skills.</p>
              <Button className="mb-4">Get started</Button>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">If you didn&apos;t create this account, please contact support.</p>
            </div>
          </Preview>
          <Preview label="Payment confirmation">
            <div className="border border-border bg-card max-w-md mx-auto p-8">
              <div className="flex items-center gap-2 mb-6">
                <img src="/Aorthar Favion.svg" alt="Aorthar" className="h-4 w-4" />
                <span className="font-bold">Aorthar</span>
              </div>
              <div className="flex items-center gap-2 mb-4"><Check className="size-5 text-primary" /><h2 className="text-xl font-semibold">Payment confirmed</h2></div>
              <div className="space-y-2 text-sm border border-border p-4 mb-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span>Standard</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span>₦50,000</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>1 Jul 2026</span></div>
              </div>
              <Button className="w-full">View dashboard</Button>
            </div>
          </Preview>
        </Section>

        {/* ── MISC ASSETS ── */}
        <Section id="misc-assets" title="Miscellaneous Assets" description="Reusable visual assets and patterns." refText={`Misc assets:
- QR code: grid of black/white squares (placeholder for actual QR generation)
- Star rating: Star icon from lucide, fill-primary text-primary for filled, text-muted-foreground for empty
- Badge counters, status dots, and other small visual elements
- Use for: testimonials, reviews, ratings, badges`}>
          <Preview label="QR code placeholder">
            <div className="inline-block border border-border bg-card p-4">
              <div className="grid grid-cols-5 gap-0.5">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={`size-4 ${Math.random() > 0.5 ? 'bg-foreground' : 'bg-card'}`} />
                ))}
              </div>
            </div>
          </Preview>
          <Preview label="Star rating">
            <div className="flex gap-1">
              {[1,2,3,4,5].map((s) => <Star key={s} className={`size-5 ${s <= 4 ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />)}
            </div>
          </Preview>
        </Section>

        {/* ── BACKGROUND ELEMENTS ── */}
        <Section id="background-elements" title="Background Elements" description="Texture, grain, gradient overlays." refText={`Background patterns:
- Lime glow: radial-gradient(1200px 520px at 85% 0px, rgba(167,210,82,0.16), transparent 65%)
- Forest glow: radial-gradient(900px 420px at -10% 0px, rgba(8,105,74,0.12), transparent 70%)
- Noise texture: SVG feTurbulence filter at opacity-[0.03-0.04], absolute inset-0
- Body gradient (dark): radial lime + radial forest + linear-gradient(180deg, #0f1112 0%, #141617 55%)
- Body gradient (light): radial lime + radial forest + linear-gradient(180deg, #f7f9f4 0%, #ffffff 40%)
- Apply as background-image on container div, relative with overflow-hidden`}>
          <Preview label="Gradient overlay — lime glow">
            <div className="h-32 w-full bg-background relative overflow-hidden">
              <div className="absolute inset-0" style={{ background: 'radial-gradient(1200px 520px at 85% 0px, rgba(167, 210, 82, 0.16), transparent 65%)' }} />
              <span className="relative z-10 text-sm text-muted-foreground p-4">lime glow top-right</span>
            </div>
          </Preview>
          <Preview label="Gradient overlay — forest glow">
            <div className="h-32 w-full bg-background relative overflow-hidden">
              <div className="absolute inset-0" style={{ background: 'radial-gradient(900px 420px at -10% 0px, rgba(8, 105, 74, 0.12), transparent 70%)' }} />
              <span className="relative z-10 text-sm text-muted-foreground p-4">forest glow top-left</span>
            </div>
          </Preview>
          <Preview label="Noise texture">
            <div className="h-32 w-full bg-card relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 512 512\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.7\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
              <span className="relative z-10 text-sm text-muted-foreground p-4">noise texture</span>
            </div>
          </Preview>
        </Section>

        {/* ════════════════════════════════════════════ MARKETING WEBSITE COMPONENTS ════════════════════════════════════════════ */}

        {/* ── HEADER NAVIGATION ── */}
        <Section id="header-navigation" title="Header Navigation" description="Top nav bar with logo, links, CTA." refText={`Header nav pattern:
- Container: border border-border bg-card px-6 py-3 flex items-center justify-between
- Logo: inline-block h-4 w-4 bg-primary + "Aorthar" bold
- Nav links: flex gap-6 text-sm text-muted-foreground, active = text-foreground
- CTA area: <Button variant="ghost" size="sm">Log in</Button> + <Button size="sm">Sign up</Button>
- Sticky variant: bg-card/80 backdrop-blur-md
- Subdomain-aware: links change per university/bootcamp/internship`}>
          <Preview label="Full nav bar">
            <div className="border border-border bg-card px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/Aorthar Favion.svg" alt="Aorthar" className="h-4 w-4" />
                <span className="font-bold text-sm">Aorthar</span>
              </div>
              <nav className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="text-foreground cursor-pointer">Home</span>
                <span className="cursor-pointer hover:text-foreground transition-colors">Courses</span>
                <span className="cursor-pointer hover:text-foreground transition-colors">Bootcamps</span>
                <span className="cursor-pointer hover:text-foreground transition-colors">Internship</span>
              </nav>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">Log in</Button>
                <Button size="sm">Sign up</Button>
              </div>
            </div>
          </Preview>
          <Preview label="Sticky header variant">
            <div className="border border-border bg-card/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/Aorthar Favion.svg" alt="Aorthar" className="h-4 w-4" />
                <span className="font-bold text-sm">Aorthar</span>
              </div>
              <Button size="sm">Enroll now</Button>
            </div>
          </Preview>
        </Section>

        {/* ── HEADER SECTIONS ── */}
        <Section id="header-sections" title="Header Sections" description="Hero sections: full-bleed, split, centered." refText={`Hero patterns:
- Centered: py-16 text-center, Badge + h1 text-4xl font-bold + p text-muted-foreground max-w-lg + flex gap-3 justify-center buttons
- Split: grid grid-cols-2 gap-8, left text content + right image placeholder (h-48 bg-muted border border-border)
- Impact headline: use Impact font, 64px, uppercase, negative letter-spacing
- Badge above heading: <Badge variant="secondary">Now enrolling</Badge>
- Two-button CTA: primary Button + outline Button
- Hero text: always max-w-lg or max-w-xl mx-auto for readable width`}>
          <Preview label="Centered hero">
            <div className="py-16 text-center">
              <Badge variant="secondary" className="mb-4">Now enrolling</Badge>
              <p style={{ fontFamily: 'Impact', fontSize: 64, fontWeight: 400, lineHeight: '54px', letterSpacing: '-2.88px', textTransform: 'uppercase' }} className="mb-4">
                BUILD THE<br />FUTURE WITH CODE
              </p>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6">Join Aorthar Academy and learn software engineering through real-world projects and mentorship.</p>
              <div className="flex gap-3 justify-center">
                <Button>Get started</Button>
                <Button variant="outline">Learn more</Button>
              </div>
            </div>
          </Preview>
          <Preview label="Split hero">
            <div className="grid grid-cols-2 gap-8 items-center">
              <div>
                <Badge variant="secondary" className="mb-4">New cohort</Badge>
                <p style={{ fontFamily: 'Impact', fontSize: 56, fontWeight: 400, lineHeight: '47px', letterSpacing: '-2.52px', textTransform: 'uppercase' }} className="mb-3">
                  MASTER<br />SOFTWARE ENGINEERING
                </p>
                <p className="text-sm text-muted-foreground mb-4">A structured 4-year program with courses, quizzes, exams, and capstone projects.</p>
                <Button>Start learning</Button>
              </div>
              <div className="h-48 bg-muted border border-border flex items-center justify-center text-sm text-muted-foreground">Hero image</div>
            </div>
          </Preview>
          <Preview label="Impact headline">
            <div className="py-12">
              <p style={{ fontFamily: 'Impact', fontSize: 64, fontWeight: 400, lineHeight: '54px', letterSpacing: '-2.88px', textTransform: 'uppercase' }} className="mb-4">
                BUILD<br />SHARP
              </p>
              <Button>Explore programs</Button>
            </div>
          </Preview>
        </Section>

        {/* ── FEATURES SECTIONS ── */}
        <Section id="features-sections" title="Features Sections" description="Feature grids, icon + text layouts." refText={`Feature sections:
- 3-column grid: grid grid-cols-3 gap-6, each card border border-border bg-card p-5 with icon mb-3 + h3 font-medium + p text-xs text-muted-foreground
- Icon inline: flex items-start gap-4, icon in bg-primary/10 size-9 shrink-0, title text-sm, desc text-xs
- Icons: use lucide-react icons (BookOpen, Award, Users, Shield, Zap, Globe, etc.)
- Text-primary on icon background for brand accent
- Keep descriptions short (1-2 lines)`}>
          <Preview label="3-column feature grid">
            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: BookOpen, title: 'Structured curriculum', desc: '4-year program with courses, quizzes, and exams.' },
                { icon: Award, title: 'Certifications', desc: 'Earn recognized certificates upon completion.' },
                { icon: Users, title: 'Community', desc: 'Join a network of learners and professionals.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="border border-border bg-card p-5">
                  <Icon className="size-5 text-primary mb-3" />
                  <h3 className="font-medium mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </Preview>
          <Preview label="Feature with icon inline">
            <div className="space-y-4">
              {[
                { icon: Shield, title: 'Secure payments', desc: 'Paystack integration with full encryption.' },
                { icon: Zap, title: 'Fast performance', desc: 'Built on Next.js for instant page loads.' },
                { icon: Globe, title: 'Multi-device', desc: 'Responsive design that works everywhere.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4 border border-border bg-card p-4">
                  <div className="flex items-center justify-center size-9 bg-primary/10 shrink-0"><Icon className="size-4 text-primary" /></div>
                  <div>
                    <h3 className="font-medium text-sm">{title}</h3>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Preview>
        </Section>

        {/* ── PRICING SECTIONS ── */}
        <Section id="pricing-sections" title="Pricing Sections" description="Pricing cards, comparison tables." refText={`Pricing cards:
- Grid grid-cols-3 gap-4
- Each card: border p-5 flex flex-col, primary card gets border-primary bg-primary/5
- Header: h3 font-medium + p text-2xl font-bold
- Features list: ul space-y-2 mb-6 flex-1, each li flex items-center gap-2 text-xs with Check icon text-primary
- CTA: Button full-width, primary card = variant="default", others variant="outline"
- Highlight middle card as recommended/primary`}>
          <Preview label="Pricing cards">
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'Free', price: '₦0', features: ['5 courses', 'Community access', 'Basic quizzes'], cta: 'Start free', primary: false },
                { name: 'Standard', price: '₦50,000/yr', features: ['All courses', 'Exams & certs', 'Priority support', 'Mentorship'], cta: 'Enroll now', primary: true },
                { name: 'Lifetime', price: '₦150,000', features: ['Everything in Standard', 'Lifetime access', 'All future courses', '1-on-1 mentorship'], cta: 'Go lifetime', primary: false },
              ].map(({ name, price, features, cta, primary }) => (
                <div key={name} className={`border p-5 flex flex-col ${primary ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                  <h3 className="font-medium mb-1">{name}</h3>
                  <p className="text-2xl font-bold mb-4">{price}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs"><Check className="size-3 text-primary shrink-0" /> {f}</li>
                    ))}
                  </ul>
                  <Button variant={primary ? 'default' : 'outline'} className="w-full">{cta}</Button>
                </div>
              ))}
            </div>
          </Preview>
        </Section>

        {/* ── CTA SECTIONS ── */}
        <Section id="cta-sections" title="CTA Sections" description="Call-to-action banners, inline CTAs." refText={`CTA patterns:
- Full banner: bg-primary/10 border border-primary/20 p-8 text-center, h2 text-2xl font-bold + p text-sm text-muted-foreground max-w-md mx-auto + Button
- Inline CTA: flex items-center justify-between border border-border bg-card p-4, left text (h3 text-sm + p text-xs), right Button size="max-w-sm"
- Use for: enrollment prompts, upgrade prompts, feature announcements
- Keep copy concise (1-2 lines)`}>
          <Preview label="Full-width CTA banner">
            <div className="bg-primary/10 border border-primary/20 p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Ready to start learning?</h2>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">Join thousands of students building their future with Aorthar Academy.</p>
              <Button>Get started today</Button>
            </div>
          </Preview>
          <Preview label="Inline CTA">
            <div className="flex items-center justify-between border border-border bg-card p-4">
              <div>
                <h3 className="font-medium text-sm">Upgrade to Standard</h3>
                <p className="text-xs text-muted-foreground">Unlock all courses and certifications</p>
              </div>
              <Button size="sm">Upgrade</Button>
            </div>
          </Preview>
        </Section>

        {/* ── METRICS SECTIONS ── */}
        <Section id="metrics-sections" title="Metrics Sections" description="Stat / number callout rows." refText={`Metrics section:
- Grid grid-cols-4 gap-6 text-center
- Each stat: p text-3xl font-bold text-primary (value) + p text-xs text-muted-foreground mt-1 (label)
- Use for: landing page stats, hero supporting data, social proof
- Numbers should be bold and oversized (text-3xl or text-4xl)
- Labels: concise (1-2 words)
- Example values: 2,500+ Students, 120+ Courses, 95% Completion rate, 4.8 Avg rating`}>
          <Preview label="Stats row">
            <div className="grid grid-cols-4 gap-6 text-center">
              {[
                { value: '2,500+', label: 'Students' },
                { value: '120+', label: 'Courses' },
                { value: '95%', label: 'Completion rate' },
                { value: '4.8', label: 'Avg rating' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-3xl font-bold text-primary">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>
          </Preview>
        </Section>

        {/* ── NEWSLETTER CTA ── */}
        <Section id="newsletter-cta" title="Newsletter CTA" description="Email capture sections." refText={`Newsletter CTA:
- Container: border border-border bg-card p-8 text-center
- Icon: Mail size-8 text-primary mx-auto mb-3
- Heading: text-xl font-semibold mb-1
- Description: text-sm text-muted-foreground mb-4
- Form: flex gap-2 max-w-sm mx-auto, Input placeholder="Your email" className="flex-1" + Button
- Use for: blog footer, sidebar, landing page sections`}>
          <Preview>
            <div className="border border-border bg-card p-8 text-center">
              <Mail className="size-8 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-semibold mb-1">Stay updated</h2>
              <p className="text-sm text-muted-foreground mb-4">Get the latest courses and updates delivered to your inbox.</p>
              <div className="flex gap-2 max-w-sm mx-auto">
                <Input placeholder="Your email" className="flex-1" />
                <Button>Subscribe</Button>
              </div>
            </div>
          </Preview>
        </Section>

        {/* ── TESTIMONIAL SECTIONS ── */}
        <Section id="testimonial-sections" title="Testimonial Sections" description="Quote cards, carousel testimonials." refText={`Testimonials:
- Grid grid-cols-2 gap-4
- Card: border border-border bg-card p-5
- Stars: flex gap-0.5 mb-3, Star className="size-3 fill-primary text-primary"
- Quote: text-sm mb-4 with &ldquo;...&rdquo; smart quotes
- Author: flex items-center gap-2, Avatar size="sm" + name text-xs font-medium + role text-[10px] text-muted-foreground
- Quote text should be genuine-sounding, 1-2 sentences`}>
          <Preview label="Testimonial cards">
            <div className="grid grid-cols-2 gap-4">
              {[
                { quote: 'Aorthar Academy changed my career. The structured curriculum and mentorship are unmatched.', name: 'Ada E.', role: 'Software Developer' },
                { quote: 'The exam system really tests your knowledge. I feel confident in my skills now.', name: 'Chidi N.', role: 'Frontend Engineer' },
              ].map(({ quote, name, role }) => (
                <div key={name} className="border border-border bg-card p-5">
                  <div className="flex gap-0.5 mb-3">{[1,2,3,4,5].map((s) => <Star key={s} className="size-3 fill-primary text-primary" />)}</div>
                  <p className="text-sm mb-4">&ldquo;{quote}&rdquo;</p>
                  <div className="flex items-center gap-2">
                    <Avatar size="sm"><AvatarFallback>{name.split(' ').map((n) => n[0]).join('')}</AvatarFallback></Avatar>
                    <div><p className="text-xs font-medium">{name}</p><p className="text-[10px] text-muted-foreground">{role}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </Preview>
        </Section>

        {/* ── SOCIAL PROOF ── */}
        <Section id="social-proof" title="Social Proof" description="Logo clouds, press mentions." refText={`Social proof:
- Logo cloud: flex items-center justify-center gap-8 opacity-50
- Each logo: text-sm font-medium text-muted-foreground (text placeholder for real logos)
- Use for: "Trusted by" sections, partner logos, press mentions
- Keep subtle (opacity-50 or opacity-60) so it doesn't compete with main content
- Typically 4-6 logos in a row`}>
          <Preview label="Logo cloud">
            <div className="flex items-center justify-center gap-8 opacity-50">
              {['Company A', 'Company B', 'Company C', 'Company D', 'Company E'].map((name) => (
                <span key={name} className="text-sm font-medium text-muted-foreground">{name}</span>
              ))}
            </div>
          </Preview>
        </Section>

        {/* ── BLOG SECTIONS ── */}
        <Section id="blog-sections" title="Blog Sections" description="Blog listing grids, featured post." refText={`Blog grid:
- Grid grid-cols-3 gap-4
- Card: border border-border bg-card overflow-hidden
- Thumbnail: h-28 bg-muted flex items-center justify-center text-xs text-muted-foreground
- Content: p-4 with Badge variant="secondary" text-[10px] for tag + h3 font-medium text-sm + p text-[10px] text-muted-foreground for date
- Tags: Tutorial, Engineering, Spotlight, etc.
- Use for: blog index, news listing, resource hub`}>
          <Preview label="Blog grid">
            <div className="grid grid-cols-3 gap-4">
              {[
                { title: 'Getting started with Next.js 16', date: '1 Jul 2026', tag: 'Tutorial' },
                { title: 'Why we chose Supabase', date: '25 Jun 2026', tag: 'Engineering' },
                { title: 'Student spotlight: Ada E.', date: '20 Jun 2026', tag: 'Spotlight' },
              ].map(({ title, date, tag }) => (
                <div key={title} className="border border-border bg-card overflow-hidden">
                  <div className="h-28 bg-muted flex items-center justify-center text-xs text-muted-foreground">Thumbnail</div>
                  <div className="p-4">
                    <Badge variant="secondary" className="mb-2 text-[10px]">{tag}</Badge>
                    <h3 className="font-medium text-sm mb-1">{title}</h3>
                    <p className="text-[10px] text-muted-foreground">{date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Preview>
        </Section>

        {/* ── CONTENT ── */}
        <Section id="content" title="Content" description="Long-form prose content blocks." refText={`Content blocks:
- Wrapper: prose prose-invert prose-sm max-w-none (if using prose) or manual spacing
- Headings: h2 for main, h3 for sub
- Body: p text-sm text-muted-foreground
- Blockquote: border-l-2 border-primary pl-4 text-sm text-muted-foreground italic
- Lists: ul text-sm text-muted-foreground space-y-1
- Use for: blog posts, course descriptions, documentation pages
- Keep max-width readable (max-w-2xl or max-w-3xl for prose)`}>
          <Preview>
            <div className="prose prose-invert prose-sm max-w-none">
              <h2>Building a design system from scratch</h2>
              <p className="text-sm text-muted-foreground">A design system is more than a component library. It&apos;s a shared language between designers and developers, a set of principles and patterns that guide every decision.</p>
              <h3>Why consistency matters</h3>
              <p className="text-sm text-muted-foreground">When every button, every input, every interaction follows the same rules, users spend less time learning your interface and more time achieving their goals.</p>
              <blockquote className="border-l-2 border-primary pl-4 text-sm text-muted-foreground italic">
                &ldquo;Good design is as little design as possible.&rdquo; — Dieter Rams
              </blockquote>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Consistency reduces cognitive load</li>
                <li>Shared tokens ensure visual harmony</li>
                <li>Component documentation speeds onboarding</li>
              </ul>
            </div>
          </Preview>
        </Section>

        {/* ── CONTACT SECTIONS ── */}
        <Section id="contact-sections" title="Contact Sections" description="Contact form layouts." refText={`Contact section:
- Grid grid-cols-2 gap-8
- Left: h2 text-xl font-semibold + p text-sm text-muted-foreground + contact info (flex items-center gap-2 with Mail/MapPin icons text-primary)
- Right: space-y-3 with Input + Input type="email" + Textarea rows={3} + Button className="w-full"
- Use for: contact page, support page, partnership inquiries
- Keep form simple (3-4 fields max)`}>
          <Preview>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-2">Get in touch</h2>
                <p className="text-sm text-muted-foreground mb-4">Have a question? We&apos;d love to hear from you.</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2"><Mail className="size-4 text-primary" /> hello@aorthar.com</div>
                  <div className="flex items-center gap-2"><MapPin className="size-4 text-primary" /> Lagos, Nigeria</div>
                </div>
              </div>
              <div className="space-y-3">
                <Input placeholder="Name" />
                <Input placeholder="Email" type="email" />
                <Textarea placeholder="Message" rows={3} />
                <Button className="w-full">Send message</Button>
              </div>
            </div>
          </Preview>
        </Section>

        {/* ── TEAM SECTIONS ── */}
        <Section id="team-sections" title="Team Sections" description="Team member cards and grids." refText={`Team grid:
- Grid grid-cols-4 gap-4
- Card: border border-border bg-card p-4 text-center
- Avatar: size="lg" mx-auto mb-3 with AvatarFallback initials
- Name: h3 font-medium text-sm
- Role: p text-[10px] text-muted-foreground
- Use for: about page, team section, contributor listing
- Initials from name split: name.split(' ').map(n => n[0]).join('')`}>
          <Preview>
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: 'Moski Ade', role: 'Founder', initials: 'MA' },
                { name: 'Ada Obi', role: 'Lead Engineer', initials: 'AO' },
                { name: 'Chidi Nwosu', role: 'Head of Content', initials: 'CN' },
                { name: 'Bola Smith', role: 'Design Lead', initials: 'BS' },
              ].map(({ name, role, initials }) => (
                <div key={name} className="border border-border bg-card p-4 text-center">
                  <Avatar size="lg" className="mx-auto mb-3"><AvatarFallback>{initials}</AvatarFallback></Avatar>
                  <h3 className="font-medium text-sm">{name}</h3>
                  <p className="text-[10px] text-muted-foreground">{role}</p>
                </div>
              ))}
            </div>
          </Preview>
        </Section>

        {/* ── CAREERS SECTIONS ── */}
        <Section id="careers-sections" title="Careers Sections" description="Job listing layouts." refText={`Job listings:
- space-y-2 container
- Each job: flex items-center justify-between border border-border bg-card p-4
- Left: h3 font-medium text-sm + p text-[10px] text-muted-foreground (dept · location)
- Right: Badge variant="secondary" for type + Button variant="outline" size="sm" for "Apply"
- Types: Full-time, Contract, Part-time
- Use for: careers page, job board`}>
          <Preview>
            <div className="space-y-2">
              {[
                { title: 'Frontend Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time' },
                { title: 'Content Creator', dept: 'Content', location: 'Lagos', type: 'Contract' },
                { title: 'Product Designer', dept: 'Design', location: 'Remote', type: 'Full-time' },
              ].map(({ title, dept, location, type }) => (
                <div key={title} className="flex items-center justify-between border border-border bg-card p-4">
                  <div>
                    <h3 className="font-medium text-sm">{title}</h3>
                    <p className="text-[10px] text-muted-foreground">{dept} · {location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{type}</Badge>
                    <Button size="sm" variant="outline">Apply</Button>
                  </div>
                </div>
              ))}
            </div>
          </Preview>
        </Section>

        {/* ── FAQ SECTIONS ── */}
        <Section id="faq-sections" title="FAQ Sections" description="Accordion FAQ layouts." refText={`FAQ accordion:
- space-y-2 max-w-2xl
- Item: border border-border bg-card
- Header: flex items-center justify-between p-4 cursor-pointer, question text-sm font-medium + ChevronDown icon text-muted-foreground
- Answer: px-4 pb-4 text-xs text-muted-foreground (show/hide with state)
- Use useState to toggle open/closed per item
- Use for: help center, pricing page, enrollment page
- Keep questions concise, answers 1-2 sentences`}>
          <Preview>
            <div className="space-y-2 max-w-2xl">
              {[
                { q: 'How does the university program work?', a: 'A 4-year structured curriculum with courses, quizzes, exams, and a capstone project.' },
                { q: 'Can I get a refund?', a: 'Refunds are available within 14 days of purchase if you haven&apos;t accessed premium content.' },
                { q: 'Are certifications recognized?', a: 'Yes, our certifications are recognized by partner organizations and employers.' },
              ].map(({ q, a }, i) => (
                <div key={i} className="border border-border bg-card">
                  <div className="flex items-center justify-between p-4 cursor-pointer">
                    <span className="text-sm font-medium">{q}</span>
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </div>
                  {i === 0 && <div className="px-4 pb-4 text-xs text-muted-foreground">{a}</div>}
                </div>
              ))}
            </div>
          </Preview>
        </Section>

        {/* ── FOOTERS ── */}
        <Section id="footers" title="Footers" description="Full footer, minimal footer." refText={`Footer patterns:
- Full: border-t border-border pt-8, grid grid-cols-4 gap-8 mb-8
  - Col 1: logo + tagline p text-xs text-muted-foreground
  - Cols 2-4: p text-xs font-medium (title) + ul space-y-1, each li has a text-xs text-muted-foreground hover:text-foreground cursor-pointer link
  - Bottom: Separator + copyright text-[10px]
- Minimal: border-t border-border pt-4, flex justify-between, copyright left + links right
- Links: Product (Courses, Bootcamps, Internship, Pricing), Company (About, Blog, Careers, Contact), Legal (Privacy, Terms, Refund policy)`}>
          <Preview label="Full footer">
            <div className="border-t border-border pt-8">
              <div className="grid grid-cols-4 gap-8 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-3"><img src="/Aorthar Favion.svg" alt="Aorthar" className="h-4 w-4" /><span className="font-bold text-sm">Aorthar</span></div>
                  <p className="text-xs text-muted-foreground">Building the next generation of software engineers.</p>
                </div>
                {[
                  { title: 'Product', links: ['Courses', 'Bootcamps', 'Internship', 'Pricing'] },
                  { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
                  { title: 'Legal', links: ['Privacy', 'Terms', 'Refund policy'] },
                ].map(({ title, links }) => (
                  <div key={title}>
                    <p className="text-xs font-medium mb-2">{title}</p>
                    <ul className="space-y-1">{links.map((l) => <li key={l}><a className="text-xs text-muted-foreground hover:text-foreground transition-colors">{l}</a></li>)}</ul>
                  </div>
                ))}
              </div>
              <Separator />
              <p className="text-[10px] text-muted-foreground mt-4">&copy; 2026 Aorthar. All rights reserved.</p>
            </div>
          </Preview>
          <Preview label="Minimal footer">
            <div className="border-t border-border pt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">&copy; 2026 Aorthar</p>
              <div className="flex gap-4 text-xs text-muted-foreground"><span className="hover:text-foreground cursor-pointer">Privacy</span><span className="hover:text-foreground cursor-pointer">Terms</span></div>
            </div>
          </Preview>
        </Section>

        {/* ── BANNERS ── */}
        <Section id="banners" title="Banners" description="Announcement bars, cookie banners." refText={`Banner patterns:
- Announcement bar: bg-primary text-primary-foreground px-4 py-2 text-center text-sm, with underline link
- Cookie banner: border border-border bg-card p-4 flex items-center justify-between, p text-xs text-muted-foreground + flex gap-2 with Button variant="outline" size="xs" "Decline" + Button size="xs" "Accept"
- Use for: promotions, legal notices, limited-time offers
- Keep banners thin and non-intrusive`}>
          <Preview label="Announcement bar">
            <div className="bg-primary text-primary-foreground px-4 py-2 text-center text-sm">
              New cohort starting September 2026 — <span className="underline cursor-pointer">Enroll now</span>
            </div>
          </Preview>
          <Preview label="Cookie banner">
            <div className="border border-border bg-card p-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">We use cookies to improve your experience.</p>
              <div className="flex gap-2">
                <Button variant="outline" size="xs">Decline</Button>
                <Button size="xs">Accept</Button>
              </div>
            </div>
          </Preview>
        </Section>

        {/* ════════════════════════════════════════════ APPLICATION COMPONENTS ════════════════════════════════════════════ */}

        {/* ── PAGE HEADERS ── */}
        <Section id="page-headers" title="Page Headers" description="App page title + action row." refText={`Page header patterns:
- Simple: flex items-center justify-between, left (h1 text-2xl font-bold + p text-sm text-muted-foreground), right Button(s)
- With breadcrumbs: breadcrumbs row above, then same title + actions row
- Breadcrumbs: flex items-center gap-1.5 text-sm, Home icon + ChevronRight + links
- Actions: Button variant="outline" size="sm" for secondary + Button size="sm" primary action
- Icons in buttons: <Filter className="size-3" />, <Plus className="size-3" />`}>
          <Preview label="With actions">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Courses</h1>
                <p className="text-sm text-muted-foreground">Manage your university courses</p>
              </div>
              <Button><Plus className="size-4" /> Create course</Button>
            </div>
          </Preview>
          <Preview label="With breadcrumbs">
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <Home className="size-3" /> <ChevronRight className="size-3" /> <span>University</span> <ChevronRight className="size-3" /> <span className="text-foreground">Courses</span>
              </div>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">All Courses</h1>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Filter className="size-3" /> Filter</Button>
                  <Button size="sm"><Plus className="size-3" /> Create</Button>
                </div>
              </div>
            </div>
          </Preview>
        </Section>

        {/* ── CARD HEADERS ── */}
        <Section id="card-headers" title="Card Headers" description="Card title + meta + actions." refText={`Card header:
- Uses Card, CardHeader, CardTitle, CardDescription, CardContent
- Pattern: <Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle>Title</CardTitle><CardDescription>Description</CardDescription></div><Button variant="ghost" size="icon"><MoreHorizontal /></Button></div></CardHeader><CardContent>...</CardContent></Card>
- MoreHorizontal icon for overflow menu
- Use for: dashboard cards, stat containers, content blocks`}>
          <Preview>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student Progress</CardTitle>
                    <CardDescription>Overview of student performance across all courses</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button>
                </div>
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Card content goes here.</p></CardContent>
            </Card>
          </Preview>
        </Section>

        {/* ── SECTION HEADERS ── */}
        <Section id="section-headers" title="Section Headers" description="In-page section headings." refText={`Section header patterns:
- Simple: flex items-center justify-between mb-4, h2 text-lg font-semibold + Button variant="ghost" size="sm" "View all"
- With badge: flex items-center gap-2 mb-4, h2 + Badge for count
- With description: mb-4, h2 text-lg font-semibold + p text-xs text-muted-foreground
- Use for: card section titles, dashboard sections, content areas
- Keep consistent spacing (mb-4 or mb-6)`}>
          <Preview label="Simple">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent activity</h2>
              <Button variant="ghost" size="sm">View all</Button>
            </div>
          </Preview>
          <Preview label="With badge count">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <Badge>3</Badge>
            </div>
          </Preview>
          <Preview label="With description">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Course materials</h2>
              <p className="text-xs text-muted-foreground">Upload and manage lecture slides, readings, and resources.</p>
            </div>
          </Preview>
        </Section>

        {/* ── SECTION FOOTERS ── */}
        <Section id="section-footers" title="Section Footers" description="In-page section footers / &quot;view all&quot; rows." refText={`Section footer:
- border-t border-border pt-4 flex items-center justify-between
- Left: p text-xs text-muted-foreground (pagination info, "Showing X of Y")
- Right: Button variant="ghost" size="sm" with ArrowRight icon "View all courses"
- Use for: table pagination, list footers, "load more" sections`}>
          <Preview>
            <div className="border-t border-border pt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Showing 3 of 12 courses</p>
              <Button variant="ghost" size="sm">View all courses <ArrowRight className="size-3 ml-1" /></Button>
            </div>
          </Preview>
        </Section>

        {/* ── APP NAVIGATION ── */}
        <Section id="app-navigation" title="Application Navigation" description="Sidebar nav, top nav, breadcrumbs." refText={`App navigation patterns:
- Sidebar: border border-border bg-card w-56 p-3 space-y-1
  - Item: flex items-center gap-2 px-3 py-2 text-sm cursor-pointer
  - Active: bg-primary/10 text-primary font-medium
  - Inactive: text-muted-foreground hover:bg-muted
  - Icons: lucide-react, size-4
- Breadcrumbs: flex items-center gap-1.5 text-sm
  - Home icon + ChevronRight + text-muted-foreground links + current page font-medium
  - Separator: <ChevronRight className="size-3 text-muted-foreground" />
- Use for: dashboard nav, course navigation, settings sidebar`}>
          <Preview label="Sidebar nav">
            <div className="border border-border bg-card w-56 p-3 space-y-1">
              {[
                { icon: Home, label: 'Dashboard', active: true },
                { icon: BookOpen, label: 'Courses', active: false },
                { icon: BarChart3, label: 'Analytics', active: false },
                { icon: Users, label: 'Students', active: false },
                { icon: Settings, label: 'Settings', active: false },
              ].map(({ icon: Icon, label, active }) => (
                <div key={label} className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${active ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}>
                  <Icon className="size-4" /> {label}
                </div>
              ))}
            </div>
          </Preview>
          <Preview label="Breadcrumbs">
            <div className="flex items-center gap-1.5 text-sm">
              <Home className="size-4 text-muted-foreground" />
              <ChevronRight className="size-3 text-muted-foreground" />
              <span className="text-muted-foreground cursor-pointer hover:text-foreground">University</span>
              <ChevronRight className="size-3 text-muted-foreground" />
              <span className="text-muted-foreground cursor-pointer hover:text-foreground">Year 1</span>
              <ChevronRight className="size-3 text-muted-foreground" />
              <span className="font-medium">Introduction to Programming</span>
            </div>
          </Preview>
        </Section>

        {/* ── MODALS ── */}
        <Section id="modals" title="Modals" description="Dialog, confirmation, form modals." refText={`Dialog: import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
Confirmation: DialogTrigger asChild > Button, DialogContent > DialogHeader (title + description) + DialogFooter (Cancel outline + Delete destructive)
Form: DialogContent > DialogHeader + form fields (space-y-4 py-2) + DialogFooter (Cancel + Submit)
Pattern: <Dialog><DialogTrigger asChild><Button>Open</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>...</DialogTitle><DialogDescription>...</DialogDescription></DialogHeader>...<DialogFooter>...</DialogFooter></DialogContent></Dialog>
Use for: delete confirmations, create forms, settings modals`}>
          <Preview label="Confirmation dialog">
            <Dialog>
              <DialogTrigger asChild><Button variant="outline">Delete course</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete course?</DialogTitle>
                  <DialogDescription>This action cannot be undone. The course and all its content will be permanently removed.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button variant="destructive">Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Preview>
          <Preview label="Form dialog">
            <Dialog>
              <DialogTrigger asChild><Button>Create new course</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New course</DialogTitle>
                  <DialogDescription>Fill in the details to create a new course.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5"><Label>Course name</Label><Input placeholder="e.g. Introduction to Programming" /></div>
                  <div className="space-y-1.5"><Label>Course code</Label><Input placeholder="e.g. CS101" /></div>
                  <div className="space-y-1.5"><Label>Year level</Label>
                    <Select defaultValue="100"><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="100">Year 1 (100)</SelectItem><SelectItem value="200">Year 2 (200)</SelectItem></SelectContent></Select>
                  </div>
                </div>
                <DialogFooter><Button variant="outline">Cancel</Button><Button>Create course</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </Preview>
        </Section>

        {/* ── COMMAND MENUS ── */}
        <Section id="command-menus" title="Command Menus" description="Command palette (Cmd+K)." refText={`Command palette (custom, not shadcn cmdk):
- Container: border border-border bg-card max-w-md mx-auto overflow-hidden
- Search bar: flex items-center gap-2 border-b border-border px-4 py-3, Search icon + "Search commands..." + kbd "⌘K"
- Sections: p px-2 py-1 text-[10px] uppercase text-muted-foreground for group labels ("Suggestions", "Actions")
- Items: flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-muted, Icon + label + hint text-[10px] text-muted-foreground ml-auto
- Separator: <Separator className="my-1" />
- Use for: global search, quick actions, navigation shortcuts`}>
          <Preview>
            <div className="border border-border bg-card max-w-md mx-auto overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Search className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Search commands...</span>
                <kbd className="ml-auto text-[10px] text-muted-foreground border border-border px-1.5 py-0.5">⌘K</kbd>
              </div>
              <div className="p-2">
                <p className="px-2 py-1 text-[10px] text-muted-foreground uppercase">Suggestions</p>
                {[
                  { icon: BookOpen, label: 'Go to Courses', hint: 'navigation' },
                  { icon: Users, label: 'Go to Students', hint: 'navigation' },
                  { icon: BarChart3, label: 'View Analytics', hint: 'navigation' },
                ].map(({ icon: Icon, label, hint }) => (
                  <div key={label} className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-muted">
                    <Icon className="size-4 text-muted-foreground" /><span>{label}</span><span className="ml-auto text-[10px] text-muted-foreground">{hint}</span>
                  </div>
                ))}
                <Separator className="my-1" />
                <p className="px-2 py-1 text-[10px] text-muted-foreground uppercase">Actions</p>
                {[
                  { icon: Plus, label: 'Create new course', hint: 'action' },
                  { icon: Upload, label: 'Upload content', hint: 'action' },
                ].map(({ icon: Icon, label, hint }) => (
                  <div key={label} className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-muted">
                    <Icon className="size-4 text-muted-foreground" /><span>{label}</span><span className="ml-auto text-[10px] text-muted-foreground">{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          </Preview>
        </Section>

        {/* ── CHARTS ── */}
        <Section id="charts" title="Charts" description="Bar, line, pie — placeholder frames for now." refText={`Chart placeholders (no charting library yet):
- Bar chart: flex items-end gap-2 h-32, each bar flex-1 bg-primary/30 with height percentage
- Line chart: SVG polyline with stroke-primary, area fill text-primary/10
- Pie chart: SVG with concentric circles using strokeDasharray, color-coded segments
- Labels: flex justify-between mt-2 text-[10px] text-muted-foreground
- Use for: dashboard analytics, course stats, enrollment data
- Real charts (recharts/chart.js) to be added later`}>
          <Preview label="Bar chart placeholder">
            <div className="border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-4"><p className="text-sm font-medium">Enrollments</p><Badge variant="secondary">This month</Badge></div>
              <div className="flex items-end gap-2 h-32">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/30" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => <span key={d}>{d}</span>)}
              </div>
            </div>
          </Preview>
          <Preview label="Line chart placeholder">
            <div className="border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-4"><p className="text-sm font-medium">Revenue</p><Badge variant="secondary">Last 6 months</Badge></div>
              <div className="h-32 flex items-end">
                <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none">
                  <polyline points="0,60 33,40 66,50 100,20 133,30 166,10 200,25" fill="none" className="stroke-primary" strokeWidth="2" />
                  <polyline points="0,60 33,40 66,50 100,20 133,30 166,10 200,25 200,80 0,80" fill="currentColor" className="text-primary/10" />
                </svg>
              </div>
            </div>
          </Preview>
          <Preview label="Pie chart placeholder">
            <div className="border border-border bg-card p-4 flex items-center gap-8">
              <div className="relative size-24">
                <svg viewBox="0 0 36 36" className="size-24 -rotate-90">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-primary" strokeWidth="3" strokeDasharray="60 100" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-secondary" strokeWidth="3" strokeDasharray="25 100" strokeDashoffset="-60" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted-foreground/30" strokeWidth="3" strokeDasharray="15 100" strokeDashoffset="-85" />
                </svg>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2"><span className="h-2 w-2 bg-primary" /> University (60%)</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 bg-secondary" /> Bootcamps (25%)</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 bg-muted-foreground/30" /> Internship (15%)</div>
              </div>
            </div>
          </Preview>
        </Section>

        {/* ── METRICS ── */}
        <Section id="metrics" title="Metrics" description="KPI cards, stat blocks." refText={`KPI metric cards:
- Grid grid-cols-3 gap-4
- Card: border border-border bg-card p-4
- Label: p text-xs text-muted-foreground mb-1
- Value: p text-2xl font-bold
- Change: span text-xs, positive text-primary "+12%", negative text-destructive "-2%"
- Use for: dashboard overview, admin stats, course analytics
- Pattern: <div className="border border-border bg-card p-4"><p className="text-xs text-muted-foreground mb-1">{label}</p><div className="flex items-end justify-between"><p className="text-2xl font-bold">{value}</p><span className="text-xs text-primary">{change}</span></div></div>`}>
          <Preview>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total students', value: '2,547', change: '+12%', up: true },
                { label: 'Revenue', value: '₦4.2M', change: '+8%', up: true },
                { label: 'Completion rate', value: '94%', change: '-2%', up: false },
              ].map(({ label, value, change, up }) => (
                <div key={label} className="border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold">{value}</p>
                    <span className={`text-xs ${up ? 'text-primary' : 'text-destructive'}`}>{change}</span>
                  </div>
                </div>
              ))}
            </div>
          </Preview>
        </Section>

        {/* ── SLIDEOUT MENUS ── */}
        <Section id="slideout-menus" title="Slideout Menus" description="Sheet side panels (left / right)." refText={`Sheet: import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
Right (default): <Sheet><SheetTrigger asChild><Button>Open</Button></SheetTrigger><SheetContent><SheetHeader>...</SheetHeader>...<SheetFooter>...</SheetFooter></SheetContent></Sheet>
Left: <SheetContent side="left">
Sides: "left", "right" (default)
Content: SheetHeader (title + description) + body (px-4 py-6 space-y-4) + SheetFooter (Button full-width)
Use for: filters, detail panels, settings, secondary content
Pattern: form inside sheet for editing metadata`}>
          <Preview label="Right sheet (default)">
            <Sheet>
              <SheetTrigger asChild><Button variant="outline"><PanelRight className="mr-2 size-4" /> Open sheet</Button></SheetTrigger>
              <SheetContent>
                <SheetHeader><SheetTitle>Course details</SheetTitle><SheetDescription>Edit the metadata for this course.</SheetDescription></SheetHeader>
                <div className="space-y-4 px-4 py-6">
                  <div className="space-y-1.5"><Label>Client</Label><Input placeholder="e.g. Lagos Creative Studio" /></div>
                  <div className="space-y-1.5"><Label>Year</Label><Input placeholder="2025" /></div>
                  <div className="space-y-1.5"><Label>Status</Label><Select defaultValue="draft"><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent></Select></div>
                </div>
                <SheetFooter className="px-4"><Button className="w-full">Save changes</Button></SheetFooter>
              </SheetContent>
            </Sheet>
          </Preview>
          <Preview label="Left sheet">
            <Sheet>
              <SheetTrigger asChild><Button variant="outline" size="sm">Open left</Button></SheetTrigger>
              <SheetContent side="left">
                <SheetHeader><SheetTitle>Navigation</SheetTitle><SheetDescription>Studio sections</SheetDescription></SheetHeader>
                <div className="px-4 py-6 space-y-1">
                  {['Work', 'Clients', 'Settings', 'Analytics'].map((item) => (
                    <div key={item} className="px-3 py-2 text-sm text-muted-foreground hover:bg-muted cursor-pointer">{item}</div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </Preview>
        </Section>

        {/* ── INLINE CTAs ── */}
        <Section id="inline-ctas" title="Inline CTAs" description="Upsell banners inside app pages." refText={`Inline CTA patterns:
- Upgrade banner: border border-primary/20 bg-primary/5 p-4 flex items-center justify-between, Sparkles icon + text + Button size="sm"
- Promo banner: bg-primary text-primary-foreground p-4 flex items-center justify-between, Flame icon + text + Button variant="secondary" size="sm"
- Use inside dashboard pages, course viewers, settings
- Keep compact and non-intrusive
- Trigger based on: free tier users, expired subscriptions, new features`}>
          <Preview>
            <div className="border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Upgrade to Standard</p>
                  <p className="text-xs text-muted-foreground">Unlock all courses, exams, and certifications</p>
                </div>
              </div>
              <Button size="sm">Upgrade</Button>
            </div>
          </Preview>
          <Preview label="Promo banner">
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="size-4" />
                <span className="text-sm font-medium">Limited offer: 20% off lifetime access</span>
              </div>
              <Button variant="secondary" size="sm">Claim offer</Button>
            </div>
          </Preview>
        </Section>

        {/* ── PAGINATION ── */}
        <Section id="pagination" title="Pagination" description="Page number nav, load more." refText={`Pagination patterns:
- Page numbers: flex items-center gap-1
  - Arrow buttons: Button variant="outline" size="icon" className="size-8" with ArrowLeft/ArrowRight
  - Page buttons: Button variant="default" (active) or "outline" (inactive) size="icon" className="size-8"
  - Ellipsis: disabled button with "..."
- Load more: text-center, Button variant="outline" "Load more" + p text-xs text-muted-foreground "Showing X of Y results"
- Use for: table pagination, course listing, blog posts`}>
          <Preview label="Page numbers">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="size-8"><ArrowLeft className="size-3" /></Button>
              {[1,2,3,'...',8].map((p, i) => (
                <Button key={i} variant={p === 1 ? 'default' : 'outline'} size="icon" className="size-8" disabled={p === '...'}>{p}</Button>
              ))}
              <Button variant="outline" size="icon" className="size-8"><ArrowRight className="size-3" /></Button>
            </div>
          </Preview>
          <Preview label="Load more">
            <div className="text-center">
              <Button variant="outline">Load more</Button>
              <p className="text-xs text-muted-foreground mt-2">Showing 10 of 42 results</p>
            </div>
          </Preview>
        </Section>

        {/* ── PROGRESS STEPS ── */}
        <Section id="progress-steps" title="Progress Steps" description="Step wizard / multi-step progress." refText={`Progress steps:
- Container: flex items-center max-w-lg
- Each step: flex flex-col items-center + flex-1
  - Circle: size-8 flex items-center justify-center text-xs font-medium
    - Completed: bg-primary text-primary-foreground (shows Check icon)
    - Current: bg-primary/20 text-primary border border-primary (shows step number)
    - Upcoming: bg-muted text-muted-foreground border border-border
  - Label: text-[10px] mt-1 text-muted-foreground
- Connector: flex-1 h-px mx-2, bg-primary (completed) or bg-border (upcoming)
- Use for: onboarding flow, checkout steps, course enrollment`}>
          <Preview>
            <div className="flex items-center max-w-lg">
              {['Account', 'Profile', 'Courses', 'Complete'].map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`size-8 flex items-center justify-center text-xs font-medium ${i < 2 ? 'bg-primary text-primary-foreground' : i === 2 ? 'bg-primary/20 text-primary border border-primary' : 'bg-muted text-muted-foreground border border-border'}`}>
                      {i < 2 ? <Check className="size-4" /> : i + 1}
                    </div>
                    <span className="text-[10px] mt-1 text-muted-foreground">{step}</span>
                  </div>
                  {i < 3 && <div className={`flex-1 h-px mx-2 ${i < 2 ? 'bg-primary' : 'bg-border'}`} />}
                </div>
              ))}
            </div>
          </Preview>
        </Section>

        {/* ── ACTIVITY FEEDS ── */}
        <Section id="activity-feeds" title="Activity Feeds" description="Timeline, activity log." refText={`Activity feed:
- space-y-4 container
- Item: flex items-start gap-3
  - Icon: text-primary for positive actions, text-muted-foreground for neutral (size-4)
  - Content: p text-sm (action text) + p text-[10px] text-muted-foreground (timestamp)
- Common icons: User (enroll), Check (completion), Upload (content), Award (certificate)
- Timestamps: "2 hours ago", "1 day ago", "2 days ago"
- Use for: dashboard activity, course updates, notification feeds`}>
          <Preview>
            <div className="space-y-4">
              {[
                { icon: User, text: 'Ada E. enrolled in CS101', time: '2 hours ago', color: 'text-primary' },
                { icon: Check, text: 'Chidi N. passed quiz for CS201', time: '5 hours ago', color: 'text-primary' },
                { icon: Upload, text: 'Admin uploaded new lesson to CS301', time: '1 day ago', color: 'text-muted-foreground' },
                { icon: Award, text: 'Bola S. earned certificate', time: '2 days ago', color: 'text-primary' },
              ].map(({ icon: Icon, text, time, color }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-0.5 ${color}`}><Icon className="size-4" /></div>
                  <div>
                    <p className="text-sm">{text}</p>
                    <p className="text-[10px] text-muted-foreground">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Preview>
        </Section>

        {/* ── MESSAGING ── */}
        <Section id="messaging" title="Messaging" description="Chat bubbles, message thread layout." refText={`Chat/messaging:
- Container: space-y-3 max-w-sm
- Sent (right): flex justify-end, bubble bg-primary text-primary-foreground px-3 py-2 text-sm max-w-[70%]
- Received (left): flex justify-start, bubble bg-muted px-3 py-2 text-sm max-w-[70%]
- Typing indicator: flex items-center gap-1, 3 dots (h-1.5 w-1.5 bg-muted-foreground/40 animate-bounce with staggered delays)
- Use for: support chat, messaging feature, notification previews
- Keep bubbles sharp (no rounded corners on containers)`}>
          <Preview>
            <div className="space-y-3 max-w-sm">
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground px-3 py-2 text-sm max-w-[70%]">Hey, how do I enroll in the bootcamp?</div>
              </div>
              <div className="flex justify-start">
                <div className="bg-muted px-3 py-2 text-sm max-w-[70%]">Go to the bootcamp page and click &ldquo;Enroll now&rdquo;. You&apos;ll be redirected to checkout.</div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground px-3 py-2 text-sm max-w-[70%]">Got it, thanks!</div>
              </div>
              <div className="flex justify-start">
                <div className="bg-muted px-3 py-2 text-sm max-w-[70%] flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="inline-block h-1.5 w-1.5 bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="inline-block h-1.5 w-1.5 bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </Preview>
        </Section>

        {/* ── TABS ── */}
        <Section id="tabs" title="Tabs" description="Line variant only — text + lemon underline, no filled backgrounds." refText={`Tabs: import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
Line variant (preferred): <TabsList variant="line" className="h-auto w-full border-b border-border p-0">
Triggers: <TabsTrigger value="overview">Overview</TabsTrigger> — active state gets lemon underline (after:opacity-100)
Content: <TabsContent value="overview" className="pt-6">...</TabsContent>
Pattern: <Tabs defaultValue="overview"><TabsList variant="line" className="..."><TabsTrigger>...</TabsTrigger></TabsList><TabsContent>...</TabsContent></Tabs>
No filled backgrounds on active tabs — only text color change + underline
Use for: course detail tabs (Overview, Media, Metadata, SEO)`}>
          <Preview>
            <Tabs defaultValue="overview">
              <TabsList variant="line" className="h-auto w-full border-b border-border p-0">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="pt-6"><p className="text-sm text-muted-foreground">Overview content goes here.</p></TabsContent>
              <TabsContent value="media" className="pt-6"><p className="text-sm text-muted-foreground">Media content goes here.</p></TabsContent>
              <TabsContent value="metadata" className="pt-6"><p className="text-sm text-muted-foreground">Metadata content goes here.</p></TabsContent>
              <TabsContent value="seo" className="pt-6"><p className="text-sm text-muted-foreground">SEO content goes here.</p></TabsContent>
            </Tabs>
          </Preview>
        </Section>

        {/* ── TABLES ── */}
        <Section id="tables" title="Tables" description="Data tables with actions." refText={`Table: import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
Pattern: <Table><TableHeader><TableRow><TableHead>...</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>...</TableCell></TableRow></TableBody></Table>
Row actions: <DropdownMenu> inside TableCell className="text-right"
Status badges: <Badge variant={status === 'Published' ? 'default' : 'secondary'}>{status}</Badge>
Cell content: primary text font-medium + secondary text text-xs text-muted-foreground (e.g. name + email)
Use for: student lists, course management, transaction history, admin dashboards`}>
          <Preview>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { course: 'Introduction to Programming', code: 'CS101', students: 145, status: 'Published', completion: '78%' },
                  { course: 'Data Structures', code: 'CS201', students: 89, status: 'Published', completion: '62%' },
                  { course: 'Web Development', code: 'CS301', students: 0, status: 'Draft', completion: '—' },
                ].map(({ course, code, students, status, completion }) => (
                  <TableRow key={code}>
                    <TableCell><p className="font-medium">{course}</p><p className="text-xs text-muted-foreground">{code}</p></TableCell>
                    <TableCell>{students}</TableCell>
                    <TableCell><Badge variant={status === 'Published' ? 'default' : 'secondary'}>{status}</Badge></TableCell>
                    <TableCell>{completion}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-3" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem>Duplicate</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem></DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Preview>
        </Section>

        {/* ── BREADCRUMBS ── */}
        <Section id="breadcrumbs" title="Breadcrumbs" description="Path breadcrumb nav." refText={`Breadcrumb patterns:
- Standard: flex items-center gap-1.5 text-sm
  - Home icon (size-3.5 text-muted-foreground) + ChevronRight (size-3) + text-muted-foreground links + current page font-medium
  - Separator: <ChevronRight className="size-3 text-muted-foreground" />
- With icons: each segment can have an icon (Folder, File) before text
- Links: hover:text-foreground cursor-pointer transition-colors
- Use for: nested navigation (University > Year 1 > Course), file browsers
- Current page: font-medium text-foreground (no hover)`}>
          <Preview label="Standard">
            <div className="flex items-center gap-1.5 text-sm">
              <Home className="size-3.5 text-muted-foreground" />
              <ChevronRight className="size-3 text-muted-foreground" />
              <span className="text-muted-foreground hover:text-foreground cursor-pointer">Dashboard</span>
              <ChevronRight className="size-3 text-muted-foreground" />
              <span className="text-muted-foreground hover:text-foreground cursor-pointer">University</span>
              <ChevronRight className="size-3 text-muted-foreground" />
              <span className="font-medium">CS101</span>
            </div>
          </Preview>
          <Preview label="With icons">
            <div className="flex items-center gap-1.5 text-sm">
              <Home className="size-3.5 text-muted-foreground" />
              <ChevronRight className="size-3 text-muted-foreground" />
              <div className="flex items-center gap-1"><Folder className="size-3 text-muted-foreground" /><span className="text-muted-foreground">Projects</span></div>
              <ChevronRight className="size-3 text-muted-foreground" />
              <div className="flex items-center gap-1"><File className="size-3 text-muted-foreground" /><span className="font-medium">report.pdf</span></div>
            </div>
          </Preview>
        </Section>

        {/* ── ALERTS & NOTIFICATIONS ── */}
        <Section id="alerts-notifications" title="Alerts & Notifications" description="Alert banners, toast notifications." refText={`Alert: import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
Info: <Alert><Info className="size-4" /><AlertTitle>Title</AlertTitle><AlertDescription>Description</AlertDescription></Alert>
Error: <Alert variant="destructive"><AlertCircle className="size-4" /><AlertTitle>...</AlertTitle><AlertDescription>...</AlertDescription></Alert>

Toast (sonner): import { toast } from 'sonner'
- Default: toast('Message')
- Success: toast.success('Done')
- Error: toast.error('Failed')
- Warning: toast.warning('Caution')
- Info: toast.info('Note')
- With action: toast('Done', { action: { label: 'View', onClick: () => {} } })
- Loading → done: const id = toast.loading('...'); toast.success('Done', { id })
- Use for: form feedback, real-time updates, non-blocking notifications`}>
          <Preview label="Alert variants">
            <div className="space-y-3">
              <Alert><Info className="size-4" /><AlertTitle>Info</AlertTitle><AlertDescription>Your draft has unsaved changes.</AlertDescription></Alert>
              <Alert variant="destructive"><AlertCircle className="size-4" /><AlertTitle>Error</AlertTitle><AlertDescription>Failed to save. Check your connection.</AlertDescription></Alert>
            </div>
          </Preview>
          <Preview label="Toast notifications">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={() => toast('Case study saved')}>Default</Button>
              <Button variant="outline" size="sm" onClick={() => toast.success('Published successfully')}>Success</Button>
              <Button variant="outline" size="sm" onClick={() => toast.error('Failed to save')}>Error</Button>
              <Button variant="outline" size="sm" onClick={() => toast.warning('Unsaved changes')}>Warning</Button>
              <Button variant="outline" size="sm" onClick={() => toast.info('Auto-save enabled')}>Info</Button>
              <Button variant="outline" size="sm" onClick={() => { const id = toast.loading('Uploading…'); setTimeout(() => toast.success('Done', { id }), 2000); }}>Loading→done</Button>
            </div>
          </Preview>
        </Section>

        {/* ── DATE PICKERS ── */}
        <Section id="date-pickers" title="Date Pickers" description="Calendar / date input." refText={`Date input patterns:
- Simple: <Input type="date" /> with Label
- Calendar placeholder (custom):
  - Container: border border-border bg-card p-4 max-w-xs
  - Header: flex justify-between, ArrowLeft/ArrowRight Button variant="ghost" size="icon" className="size-7" + month/year text-sm font-medium
  - Weekday row: grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground
  - Day grid: grid grid-cols-7 gap-1 text-center text-xs
  - Today: bg-primary text-primary-foreground
  - Out of month: text-muted-foreground/30
  - Hover: hover:bg-muted
- No date picker library installed yet — use native input or add react-day-picker later`}>
          <Preview label="Date input">
            <div className="max-w-xs space-y-1.5">
              <Label>Start date</Label>
              <Input type="date" />
            </div>
          </Preview>
          <Preview label="Calendar placeholder">
            <div className="border border-border bg-card p-4 max-w-xs">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" className="size-7"><ArrowLeft className="size-3" /></Button>
                <span className="text-sm font-medium">July 2026</span>
                <Button variant="ghost" size="icon" className="size-7"><ArrowRight className="size-3" /></Button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground mb-2">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => <span key={d}>{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: 35 }).map((_, i) => {
                  const day = i - 0 + 1;
                  const inMonth = day >= 1 && day <= 31;
                  const isToday = day === 28;
                  return <span key={i} className={`py-1.5 cursor-pointer ${!inMonth ? 'text-muted-foreground/30' : isToday ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{inMonth ? day : ''}</span>;
                })}
              </div>
            </div>
          </Preview>
        </Section>

        {/* ── FILE UPLOAD ── */}
        <Section id="file-upload" title="File Upload" description="Drag-and-drop upload zone." refText={`File upload patterns:
- Drop zone: border-2 border-dashed border-border p-8 text-center cursor-pointer hover:border-primary/50 transition-colors
  - Icon: Upload size-8 text-muted-foreground mx-auto mb-3
  - Title: text-sm font-medium mb-1
  - Subtitle: text-xs text-muted-foreground (file types + size limit)
- Uploaded file: border border-border bg-card p-3 flex items-center gap-3
  - Icon: FileText size-8 text-primary shrink-0
  - Info: flex-1 min-w-0, filename text-sm font-medium truncate + size text-[10px] text-muted-foreground
  - Delete: Button variant="ghost" size="icon" className="size-7" with Trash2 icon
- Use for: course content upload, avatar upload, document management`}>
          <Preview>
            <div className="border-2 border-dashed border-border p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="size-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">Drop files here or click to upload</p>
              <p className="text-xs text-muted-foreground">Supports PDF, images, and documents up to 10MB</p>
            </div>
          </Preview>
          <Preview label="Uploaded file">
            <div className="border border-border bg-card p-3 flex items-center gap-3">
              <FileText className="size-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">CS101-lecture-notes.pdf</p>
                <p className="text-[10px] text-muted-foreground">2.4 MB</p>
              </div>
              <Button variant="ghost" size="icon" className="size-7 shrink-0"><Trash2 className="size-3" /></Button>
            </div>
          </Preview>
        </Section>

        {/* ── CONTENT DIVIDERS ── */}
        <Section id="content-dividers" title="Content Dividers" description="Section separators, horizontal rules." refText={`Divider: import { Separator } from '@/components/ui/separator'
Horizontal: <Separator /> (default, h-px w-full bg-border)
Labeled: <div className="flex items-center gap-4"><Separator className="flex-1" /><span className="text-[10px] text-muted-foreground uppercase">or</span><Separator className="flex-1" /></div>
Vertical: <Separator orientation="vertical" /> with flex items-center gap-4 h-8 container
Use for: form section breaks, content section separators, "or" dividers between options
Keep minimal — dividers should be subtle`}>
          <Preview label="Horizontal rule">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Content above</p>
              <Separator />
              <p className="text-sm text-muted-foreground">Content below</p>
            </div>
          </Preview>
          <Preview label="Labeled divider">
            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-[10px] text-muted-foreground uppercase">or</span>
              <Separator className="flex-1" />
            </div>
          </Preview>
          <Preview label="Vertical divider">
            <div className="flex items-center gap-4 h-8">
              <span className="text-sm">Item 1</span>
              <Separator orientation="vertical" />
              <span className="text-sm">Item 2</span>
              <Separator orientation="vertical" />
              <span className="text-sm">Item 3</span>
            </div>
          </Preview>
        </Section>

        {/* ── LOADING INDICATORS ── */}
        <Section id="loading-indicators" title="Loading Indicators" description="Skeleton, spinner, progress." refText={`Loading patterns:
- Spinner (Apple-style): SVG circle with strokeDasharray="50 150", animate-spin
  - Sizes: size-4 (sm), size-6 (md), size-8 (lg)
  - Color: text-foreground (default) or text-primary
  - Pattern: <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 150" /></svg>
- Skeleton: import { Skeleton } from '@/components/ui/skeleton'
  - Card skeleton: flex items-center gap-3 + Skeleton className="size-10" (avatar) + Skeleton h-3 w-32 (text) + multiple Skeleton lines + Skeleton h-8 w-24 (button)
  - Table skeleton: space-y-2, each row flex gap-4 with Skeleton h-4 w-{various}
- Pulse animation: animate-pulse on Skeleton (default behavior)
- Use for: page load states, content loading, table loading`}>
          <Preview label="Spinner">
            <div className="flex items-center gap-6">
              <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 150" />
              </svg>
              <svg className="size-6 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="50 150" />
              </svg>
              <svg className="size-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="50 150" />
              </svg>
            </div>
          </Preview>
          <Preview label="Card skeleton">
            <div className="border border-border bg-card p-5 max-w-sm space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10" />
                <div className="flex-1 space-y-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-20" /></div>
              </div>
              <Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-3/4" /><Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-24" />
            </div>
          </Preview>
          <Preview label="Table skeleton">
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4 border-b border-border pb-2">
                  <Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-20" /><Skeleton className="ml-auto h-4 w-16" />
                </div>
              ))}
            </div>
          </Preview>
        </Section>

        {/* ── EMPTY STATES ── */}
        <Section id="empty-states" title="Empty States" description="Zero-data states with illustration + CTA." refText={`Empty state patterns:
- Container: flex flex-col items-center justify-center py-12 text-center
- Icon: size-12 bg-muted flex items-center justify-center mb-4, inner icon size-6 text-muted-foreground
- Title: h3 font-medium mb-1
- Description: text-xs text-muted-foreground mb-4 max-w-xs
- CTA: Button size="sm" with Plus icon + action text
- Variants:
  - No data: BookOpen icon, "No courses yet", "Create your first course"
  - No results: Search size-10 text-muted-foreground/30, "No results found", "Try adjusting your search"
- Use for: empty dashboards, search with no results, first-time user states`}>
          <Preview>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-12 bg-muted flex items-center justify-center mb-4"><BookOpen className="size-6 text-muted-foreground" /></div>
              <h3 className="font-medium mb-1">No courses yet</h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-xs">Create your first course to start teaching students.</p>
              <Button size="sm"><Plus className="size-3" /> Create course</Button>
            </div>
          </Preview>
          <Preview label="Search empty">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="size-10 text-muted-foreground/30 mb-3" />
              <h3 className="font-medium mb-1">No results found</h3>
              <p className="text-xs text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          </Preview>
        </Section>

        {/* ── CODE SNIPPETS ── */}
        <Section id="code-snippets" title="Code Snippets" description="Syntax-highlighted code block." refText={`Code blocks:
- Container: border border-border bg-card overflow-hidden
- Header: flex items-center justify-between border-b border-border px-4 py-2
  - Filename: text-xs font-mono text-muted-foreground
  - Copy button: Button variant="ghost" size="icon" className="size-6" with Copy icon
- Code: pre p-4 text-xs font-mono overflow-x-auto leading-relaxed
- Syntax colors (One Dark theme): imports #c678dd (purple), strings #98c37b (green), functions #61afef (blue), tags #e06c7b (red), text #abb2bf (gray), types #e5c07b (yellow)
- Inline code: <code className="bg-muted px-1.5 py-0.5 text-xs font-mono">command</code>
- Use for: API docs, command references, code examples in courses`}>
          <Preview>
            <div className="border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">page.tsx</span>
                </div>
                <Button variant="ghost" size="icon" className="size-6"><Copy className="size-3" /></Button>
              </div>
              <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed">
                <code>
                  <span className="text-[#c678dd]">import</span>{' '}<span className="text-[#e5c07b]">{'{ Button }'}</span>{' '}<span className="text-[#c678dd]">from</span>{' '}<span className="text-[#98c379]">&apos;@/components/ui/button&apos;</span>{';\n\n'}
                  <span className="text-[#c678dd]">export default function</span>{' '}<span className="text-[#61afef]">Home</span>{'() {\n'}
                  {'  '}<span className="text-[#c678dd]">return</span>{' (\n'}
                  {'    '}<span className="text-[#e06c75]">{'<main>'}</span>{'\n'}
                  {'      '}<span className="text-[#e06c75]">{'<h1>'}</span><span className="text-[#abb2bf]">Hello, Aorthar</span><span className="text-[#e06c75]">{'</h1>'}</span>{'\n'}
                  {'      '}<span className="text-[#e06c75]">{'<Button>'}</span><span className="text-[#abb2bf]">Get started</span><span className="text-[#e06c75]">{'</Button>'}</span>{'\n'}
                  {'    '}<span className="text-[#e06c75]">{'</main>'}</span>{'\n'}
                  {'  '});{'\n}'}
                </code>
              </pre>
            </div>
          </Preview>
          <Preview label="Inline code">
            <p className="text-sm text-muted-foreground">
              Run <code className="bg-muted px-1.5 py-0.5 text-xs font-mono">bun run dev</code> to start the development server.
            </p>
          </Preview>
        </Section>

        <div className="border-t border-border py-8 text-center text-xs text-muted-foreground">
          Aorthar Design System · All components use <span className="font-mono">rounded-none</span>
        </div>

      </main>
    </div>
    </TooltipProvider>
  );
}
