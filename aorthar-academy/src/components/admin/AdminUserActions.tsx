'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Shield, User, Star, StarOff, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Props = { userId: string; currentRole: string; isPremium: boolean };

export default function AdminUserActions({ userId, currentRole, isPremium }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  return (
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
