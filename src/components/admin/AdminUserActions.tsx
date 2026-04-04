'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Shield, User, Star, StarOff, UserCog, BookOpen, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Purchase = { course_id: string; standalone_courses: { title: string } | null };
type Props = { userId: string; currentRole: string; isPremium: boolean; purchases: Purchase[] };
type Course = { id: string; slug: string; title: string };

export default function AdminUserActions({ userId, currentRole, isPremium, purchases }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bootcampDialogOpen, setBootcampDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [coursesLoading, setCoursesLoading] = useState(false);

  async function setRole(role: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    setLoading(false);
    if (res.ok) { toast.success(`Role set to ${role}`); router.refresh(); }
    else toast.error('Failed to update role');
  }

  async function togglePremium() {
    setLoading(true);
    const action = isPremium ? 'revoke' : 'grant';
    const res = await fetch(`/api/admin/users/${userId}/premium`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setLoading(false);
    if (res.ok) { toast.success(`Premium ${action}d`); router.refresh(); }
    else toast.error('Failed to update premium');
  }

  async function openBootcampDialog() {
    setBootcampDialogOpen(true);
    setSelectedSlug('');
    if (courses.length > 0) return;
    setCoursesLoading(true);
    try {
      const res = await fetch('/api/admin/standalone-courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data ?? []);
      }
    } finally {
      setCoursesLoading(false);
    }
  }

  async function grantBootcamp() {
    if (!selectedSlug) return;
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}/bootcamp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_slug: selectedSlug }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success('Bootcamp access granted — student notified by email');
      setBootcampDialogOpen(false);
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? 'Failed to grant bootcamp access');
    }
  }

  async function removeBootcamp(courseId: string, title: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}/bootcamp`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: courseId }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success(`Removed from "${title}"`);
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? 'Failed to remove bootcamp access');
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={loading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRole('admin')} disabled={currentRole === 'admin'}>
            <Shield className="h-4 w-4 mr-2" /> Make Admin
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRole('contributor')} disabled={currentRole === 'contributor'}>
            <UserCog className="h-4 w-4 mr-2" /> Make Contributor
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRole('student')} disabled={currentRole === 'student'}>
            <User className="h-4 w-4 mr-2" /> Make Student
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={togglePremium}>
            {isPremium
              ? <><StarOff className="h-4 w-4 mr-2" /> Revoke Premium</>
              : <><Star className="h-4 w-4 mr-2" /> Grant Premium</>}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={openBootcampDialog}>
            <BookOpen className="h-4 w-4 mr-2" /> Invite to Bootcamp
          </DropdownMenuItem>
          {purchases.length > 0 && (
            <DropdownMenuItem onClick={() => setRemoveDialogOpen(true)}>
              <X className="h-4 w-4 mr-2" /> Remove from Bootcamp
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Grant dialog */}
      <Dialog open={bootcampDialogOpen} onOpenChange={setBootcampDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Bootcamp Access</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {coursesLoading ? (
              <p className="text-sm text-muted-foreground">Loading bootcamps…</p>
            ) : courses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bootcamps found.</p>
            ) : (
              <Select value={selectedSlug} onValueChange={setSelectedSlug}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a bootcamp…" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground mt-3">The student will receive an email notification.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBootcampDialogOpen(false)}>Cancel</Button>
            <Button onClick={grantBootcamp} disabled={!selectedSlug || loading}>
              {loading ? 'Granting…' : 'Grant Access'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Bootcamp Access</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <p className="text-sm text-muted-foreground mb-3">Select a bootcamp to revoke access:</p>
            {purchases.map((p) => (
              <div key={p.course_id} className="flex items-center justify-between gap-3 py-1">
                <Badge variant="outline" className="text-sm font-normal">
                  {p.standalone_courses?.title ?? 'Unknown'}
                </Badge>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={loading}
                  onClick={() => removeBootcamp(p.course_id, p.standalone_courses?.title ?? 'course')}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
