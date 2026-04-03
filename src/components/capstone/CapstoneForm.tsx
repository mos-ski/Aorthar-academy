'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { capstoneSchema, type CapstoneInput } from '@/utils/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function CapstoneForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, control } = useForm<CapstoneInput>({
    resolver: zodResolver(capstoneSchema),
    defaultValues: { tech_stack: [] },
  });

  const [techInput, setTechInput] = useState('');
  const techStack = useWatch({ control, name: 'tech_stack' }) ?? [];

  function addTech() {
    if (!techInput.trim()) return;
    setValue('tech_stack', [...techStack, techInput.trim()]);
    setTechInput('');
  }

  async function onSubmit(values: CapstoneInput) {
    setLoading(true);
    setError(null);

    const res = await fetch('/api/capstone/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(typeof data.error === 'string' ? data.error : 'Submission failed');
      return;
    }

    toast.success('Capstone submitted for review!');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label>GitHub Repository URL</Label>
        <Input placeholder="https://github.com/username/repo" {...register('github_url')} />
        {errors.github_url && <p className="text-sm text-destructive">{errors.github_url.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Live Project URL</Label>
        <Input placeholder="https://yourproject.vercel.app" {...register('live_url')} />
        {errors.live_url && <p className="text-sm text-destructive">{errors.live_url.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Project Description</Label>
        <Textarea
          rows={5}
          placeholder="Describe what you built, the problem it solves, and how you built it..."
          {...register('description')}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Tech Stack</Label>
        <div className="flex gap-2">
          <Input
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            placeholder="e.g. React"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTech();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addTech}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          {techStack.map((tech, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-muted rounded px-2 py-1 text-xs">
              {tech}
              <button
                type="button"
                onClick={() => {
                  setValue('tech_stack', techStack.filter((_, idx) => idx !== i));
                }}
                className="text-muted-foreground hover:text-destructive"
              >×</button>
            </span>
          ))}
        </div>
        {errors.tech_stack && <p className="text-sm text-destructive">{errors.tech_stack.message}</p>}
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Submitting...' : 'Submit for Review'}
      </Button>
    </form>
  );
}
