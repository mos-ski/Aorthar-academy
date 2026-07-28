'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

const NAV = [
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'forms', label: 'Forms' },
  { id: 'cards', label: 'Cards' },
  { id: 'tabs', label: 'Tabs' },
  { id: 'badges', label: 'Badges' },
  { id: 'tables', label: 'Tables' },
  { id: 'dialogs', label: 'Dialogs' },
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

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-20 scroll-mt-8">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
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
      <div className="rounded-none border border-border bg-muted/20 p-6">
        {children}
      </div>
    </div>
  );
}

export default function GuideLibraryPage() {
  const [activeNav, setActiveNav] = useState('colors');

  return (
    <div className="flex min-h-screen bg-background text-foreground">

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-52 overflow-y-auto border-r border-border bg-card px-4 py-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Aorthar</p>
          <h1 className="mt-1 text-base font-bold">Design System</h1>
        </div>
        <nav className="space-y-0.5">
          {NAV.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setActiveNav(id)}
              className={`block rounded-none px-3 py-2 text-sm transition-colors ${activeNav === id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              {label}
            </a>
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
          <div className="mb-2 flex items-center gap-3">
            <span className="inline-block h-3 w-3 bg-primary" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">v1.0</p>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Component Library</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            All UI primitives for the Aorthar design system. Sharp edges, lemon accents, dark-first.
          </p>
        </div>

        {/* ── COLORS ── */}
        <Section id="colors" title="Colors" description="Core brand palette and semantic tokens.">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {COLORS.map((c) => <Swatch key={c.name} {...c} />)}
          </div>
          <div className="mt-8 border border-border bg-card p-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Brand mark</p>
            <div className="flex items-center gap-3">
              <span className="inline-block h-4 w-4 bg-primary" />
              <span className="font-mono text-sm text-primary">#a7d252 — Lemon</span>
            </div>
          </div>
        </Section>

        {/* ── TYPOGRAPHY ── */}
        <Section id="typography" title="Typography" description="Type scale using system sans-serif stack.">
          <Preview>
            <div className="space-y-6">
              <div><p className="mb-1 font-mono text-[10px] text-muted-foreground">text-4xl / font-bold</p><p className="text-4xl font-bold leading-none">Display heading</p></div>
              <div><p className="mb-1 font-mono text-[10px] text-muted-foreground">text-3xl / font-bold</p><p className="text-3xl font-bold">Section heading</p></div>
              <div><p className="mb-1 font-mono text-[10px] text-muted-foreground">text-2xl / font-semibold</p><p className="text-2xl font-semibold">Page title</p></div>
              <div><p className="mb-1 font-mono text-[10px] text-muted-foreground">text-xl / font-medium</p><p className="text-xl font-medium">Sub-heading</p></div>
              <div><p className="mb-1 font-mono text-[10px] text-muted-foreground">text-base</p><p className="text-base">Body text — the quick brown fox jumps over the lazy dog.</p></div>
              <div><p className="mb-1 font-mono text-[10px] text-muted-foreground">text-sm / text-muted-foreground</p><p className="text-sm text-muted-foreground">Secondary / meta text — used for labels, captions, timestamps.</p></div>
              <div><p className="mb-1 font-mono text-[10px] text-muted-foreground">text-xs / uppercase / tracking-widest</p><p className="text-xs uppercase tracking-widest text-muted-foreground">Section label</p></div>
              <div><p className="mb-1 font-mono text-[10px] text-muted-foreground">font-mono</p><p className="font-mono text-sm">/api/admin/studio/case-studies/:id</p></div>
            </div>
          </Preview>
        </Section>

        {/* ── BUTTONS ── */}
        <Section id="buttons" title="Buttons" description="Six variants across four sizes. All sharp-edged.">
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
              <Button><span className="mr-1 inline-block h-3 w-3 animate-spin rounded-none border border-current border-t-transparent" />Loading</Button>
            </div>
          </Preview>
        </Section>

        {/* ── FORMS ── */}
        <Section id="forms" title="Forms" description="Input, Textarea, Select — all square-edged.">
          <Preview label="Input">
            <div className="max-w-sm space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="ex-text">Text input</Label>
                <Input id="ex-text" placeholder="e.g. Test Canvas Study" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ex-email">Email</Label>
                <Input id="ex-email" type="email" placeholder="admin@aorthar.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ex-disabled">Disabled</Label>
                <Input id="ex-disabled" value="Read-only value" disabled />
              </div>
            </div>
          </Preview>
          <Preview label="Textarea">
            <div className="max-w-sm space-y-1.5">
              <Label htmlFor="ex-ta">Subtitle</Label>
              <Textarea id="ex-ta" placeholder="Describe the project…" />
            </div>
          </Preview>
          <Preview label="Select">
            <div className="max-w-xs space-y-1.5">
              <Label>Status</Label>
              <Select defaultValue="draft">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Preview>
        </Section>

        {/* ── CARDS ── */}
        <Section id="cards" title="Cards" description="Container surfaces. Sharp, no shadow by default.">
          <Preview>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Test Canvas Study</CardTitle>
                  <CardDescription>Last edited 1 Jul 2026 · Draft</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Brand identity and strategy for a new creative studio based in Lagos.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Adire Campaign</CardTitle>
                  <CardDescription>Published · 2025</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">Visual identity system and campaign collateral.</p>
                  <Button size="sm" variant="outline">Open editor</Button>
                </CardContent>
              </Card>
            </div>
          </Preview>
        </Section>

        {/* ── TABS ── */}
        <Section id="tabs" title="Tabs" description="Line variant only — text + lemon underline, no filled backgrounds.">
          <Preview>
            <Tabs defaultValue="overview">
              <TabsList variant="line" className="h-auto w-full border-b border-border p-0">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="pt-6">
                <p className="text-sm text-muted-foreground">Overview content goes here.</p>
              </TabsContent>
              <TabsContent value="media" className="pt-6">
                <p className="text-sm text-muted-foreground">Media content goes here.</p>
              </TabsContent>
              <TabsContent value="metadata" className="pt-6">
                <p className="text-sm text-muted-foreground">Metadata content goes here.</p>
              </TabsContent>
              <TabsContent value="seo" className="pt-6">
                <p className="text-sm text-muted-foreground">SEO content goes here.</p>
              </TabsContent>
            </Tabs>
          </Preview>
        </Section>

        {/* ── BADGES ── */}
        <Section id="badges" title="Badges" description="Small status indicators and labels.">
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

        {/* ── TABLES ── */}
        <Section id="tables" title="Tables" description="Data tables with sharp borders.">
          <Preview>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Webinar</TableHead>
                  <TableHead>Attendee</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead className="text-right">Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { webinar: 'Build with Moski', attendee: 'Tywo Smith', email: 'tywo@gmail.com', phone: '08164804596', paid: 'Free', date: '1 Jul 2026' },
                  { webinar: 'Build with Moski', attendee: 'Adegoke Oniyelu', email: 'adegoke@gmail.com', phone: '+2347049484371', paid: 'Free', date: '1 Jul 2026' },
                  { webinar: 'Build with Moski', attendee: 'Mani Danson', email: 'mani@gmail.com', phone: '08130210332', paid: 'Free', date: '1 Jul 2026' },
                ].map((row) => (
                  <TableRow key={row.email}>
                    <TableCell className="font-medium">{row.webinar}</TableCell>
                    <TableCell>
                      <p className="font-medium">{row.attendee}</p>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                    </TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell><Badge variant="ghost">{row.paid}</Badge></TableCell>
                    <TableCell><Button size="sm" variant="outline">Mark attended</Button></TableCell>
                    <TableCell className="text-right text-muted-foreground">{row.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Preview>
        </Section>

        {/* ── DIALOGS ── */}
        <Section id="dialogs" title="Dialogs" description="Modal overlays for confirmations and forms.">
          <Preview label="Confirmation dialog">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete case study?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. The case study and all its blocks will be permanently removed.
                  </DialogDescription>
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
              <DialogTrigger asChild>
                <Button>Create new study</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New case study</DialogTitle>
                  <DialogDescription>Fill in the details to create a new work entry.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input placeholder="e.g. Adire Campaign" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Client</Label>
                    <Input placeholder="e.g. Lagos Creative Studio" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select defaultValue="draft">
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Create study</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Preview>
        </Section>

        <div className="border-t border-border py-8 text-center text-xs text-muted-foreground">
          Aorthar Design System · All components use <span className="font-mono">rounded-none</span>
        </div>

      </main>
    </div>
  );
}
