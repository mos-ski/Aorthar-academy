import { requireAuth } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={profile?.role ?? 'student'} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar user={{ name: profile?.full_name ?? '', email: user.email ?? '', role: profile?.role ?? 'student' }} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto w-full max-w-none">{children}</div>
        </main>
      </div>
    </div>
  );
}
