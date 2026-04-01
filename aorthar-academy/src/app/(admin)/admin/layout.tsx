export const dynamic = 'force-dynamic';

import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { createClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/demo/mode';

async function getAdminUser() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role, admin_level')
      .eq('user_id', user.id)
      .single();
    return {
      name: profile?.full_name ?? 'Admin',
      email: user.email ?? '',
      role: (profile?.role ?? 'admin') as 'admin' | 'student' | 'contributor',
      adminLevel: (profile as { admin_level?: 'super_admin' | 'content_admin' | 'finance_admin' | null } | null)?.admin_level ?? 'super_admin',
    };
  } catch {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await getAdminUser();
  const user = adminUser ?? {
    name: 'Admin Preview',
    email: 'admin@aorthar.com',
    role: 'admin' as const,
    adminLevel: 'super_admin' as const,
  };
  const demo = await isDemoMode();
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? 'development';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={user.role} adminLevel={user.adminLevel} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar user={user} isDemoMode={demo} appEnv={appEnv} />
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6 lg:p-8 lg:pb-8">
          <div className="mx-auto max-w-6xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
