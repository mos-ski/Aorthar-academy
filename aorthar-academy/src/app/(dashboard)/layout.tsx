import { requireAuth } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { isDemoMode } from '@/lib/demo/mode';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireAuth();
  const demo = await isDemoMode();
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? 'development';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={profile?.role ?? 'student'} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          user={{ name: profile?.full_name ?? '', email: user.email ?? '', role: profile?.role ?? 'student' }}
          isDemoMode={demo}
          appEnv={appEnv}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto w-full px-[15%]">{children}</div>
        </main>
      </div>
    </div>
  );
}
