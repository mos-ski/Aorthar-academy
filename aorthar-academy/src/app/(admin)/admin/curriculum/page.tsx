'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Layers } from 'lucide-react';
import { toast } from 'sonner';

type Semester = { id: string; number: number };
type Year = { id: string; level: number; name: string; semesters: Semester[] };

const ALL_LEVELS = [100, 200, 300, 400];

export default function CurriculumPage() {
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchYears = useCallback(async () => {
    const res = await fetch('/api/admin/curriculum');
    const json = await res.json();
    setYears(json.data ?? []);
  }, []);

  useEffect(() => {
    fetchYears().finally(() => setLoading(false));
  }, [fetchYears]);

  const existingLevels = new Set(years.map((y) => y.level));
  const availableLevels = ALL_LEVELS.filter((l) => !existingLevels.has(l));

  async function addYear(level: number) {
    const res = await fetch('/api/admin/years', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, name: `Year ${level}` }),
    });
    if (res.ok) { toast.success(`Year ${level} added`); fetchYears(); }
    else { const j = await res.json(); toast.error(j.error ?? 'Failed to add year'); }
  }

  async function deleteYear(yearId: string, level: number) {
    if (!confirm(`Delete Year ${level} and ALL its semesters and courses? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/years/${yearId}`, { method: 'DELETE' });
    if (res.ok) { toast.success(`Year ${level} deleted`); fetchYears(); }
    else { const j = await res.json(); toast.error(j.error ?? 'Failed to delete year'); }
  }

  async function addSemester(yearId: string, semNumber: number) {
    const res = await fetch('/api/admin/semesters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year_id: yearId, number: semNumber }),
    });
    if (res.ok) { toast.success(`Semester ${semNumber} added`); fetchYears(); }
    else { const j = await res.json(); toast.error(j.error ?? 'Failed to add semester'); }
  }

  async function deleteSemester(semesterId: string, semNumber: number) {
    if (!confirm(`Delete Semester ${semNumber} and ALL its courses? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/semesters/${semesterId}`, { method: 'DELETE' });
    if (res.ok) { toast.success(`Semester ${semNumber} deleted`); fetchYears(); }
    else { const j = await res.json(); toast.error(j.error ?? 'Failed to delete semester'); }
  }

  if (loading) return <div className="text-muted-foreground text-sm p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5" />Curriculum Structure
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage the year → semester hierarchy. Add courses from the Courses page.
          </p>
        </div>
        {availableLevels.length > 0 && (
          <div className="flex gap-2">
            {availableLevels.map((level) => (
              <Button key={level} size="sm" variant="outline" onClick={() => addYear(level)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />Year {level}
              </Button>
            ))}
          </div>
        )}
      </div>

      {years.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No curriculum structure yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Add a year using the buttons above to get started.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {years
          .sort((a, b) => a.level - b.level)
          .map((year) => {
            const existingSemNums = new Set(year.semesters.map((s) => s.number));
            const missingSems = [1, 2].filter((n) => !existingSemNums.has(n));

            return (
              <Card key={year.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Year {year.level}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">Level {year.level}</span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {missingSems.map((n) => (
                        <Button key={n} size="sm" variant="outline" className="h-7 text-xs gap-1"
                          onClick={() => addSemester(year.id, n)}>
                          <Plus className="h-3 w-3" />Semester {n}
                        </Button>
                      ))}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => deleteYear(year.id, year.level)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {year.semesters.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No semesters yet — add one above.</p>
                  ) : (
                    <div className="space-y-2">
                      {year.semesters
                        .sort((a, b) => a.number - b.number)
                        .map((sem) => (
                          <div key={sem.id} className="flex items-center justify-between bg-muted/40 rounded px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">Semester {sem.number}</Badge>
                              <span className="text-xs text-muted-foreground">{sem.id.slice(0, 8)}…</span>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => deleteSemester(sem.id, sem.number)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
