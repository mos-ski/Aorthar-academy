'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Course = { id: string; slug: string; title: string };

export default function InviteStudentDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  async function loadCourses() {
    if (courses.length > 0) return;
    setCoursesLoading(true);
    try {
      const res = await fetch('/api/admin/standalone-courses');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to load bootcamps:', res.status, errorData);
        toast.error(`Failed to load bootcamps: ${errorData.error ?? 'Unknown error'}`);
        return;
      }
      const data = await res.json();
      console.log('Loaded bootcamps:', data);
      setCourses(data ?? []);
    } catch (err) {
      console.error('Error loading bootcamps:', err);
      toast.error('Error loading bootcamps');
    } finally {
      setCoursesLoading(false);
    }
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      loadCourses();
    } else {
      // Reset form
      setEmail('');
      setFullName('');
      setSelectedSlugs([]);
    }
  }

  function toggleSlug(slug: string) {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !fullName || selectedSlugs.length === 0) {
      toast.error('Please fill in all fields and select at least one bootcamp');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/invite-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          full_name: fullName.trim(),
          standalone_course_slugs: selectedSlugs,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.status === 'invited' ? 'Student invited successfully! Email sent.' : data.reason ?? 'Student already exists, access granted.');
        setOpen(false);
        router.refresh();
      } else {
        toast.error(data.error ?? 'Failed to invite student');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2"
        size="sm"
      >
        <UserPlus className="h-4 w-4" />
        Invite Student
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite Student to Bootcamp</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 py-2">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Select Bootcamps */}
            <div className="space-y-2">
              <Label>Bootcamps to Grant</Label>
              {coursesLoading ? (
                <p className="text-sm text-muted-foreground">Loading bootcamps…</p>
              ) : courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bootcamps found.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3 bg-muted/30">
                  {courses.map((course) => {
                    const isSelected = selectedSlugs.includes(course.slug);
                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => toggleSlug(course.slug)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background hover:bg-muted'
                        }`}
                      >
                        <span className="truncate">{course.title}</span>
                        {isSelected && <X className="h-4 w-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedSlugs.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedSlugs.length} bootcamp{selectedSlugs.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !email || !fullName || selectedSlugs.length === 0}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Inviting…
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite & Grant Access
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
