import { requireAuth } from '@/lib/auth';
import { isDemoMode } from '@/lib/demo/mode';
import UniversitySidebar from '@/components/university/Sidebar';
import UniversityTopBar from '@/components/university/TopBar';
import { createClient } from '@/lib/supabase/server';

export default async function ClassroomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireAuth();
  const demo = await isDemoMode();
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? 'development';

  // Fetch user's enrolled courses for sidebar
  let courses: { id: string; code: string; name: string; progress: number }[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('user_progress')
      .select(`
        course_id,
        status,
        courses(id, code, name)
      `)
      .eq('user_id', user.id)
      .limit(5);

    courses = (data ?? []).map((item: any) => ({
      id: item.courses.id,
      code: item.courses.code,
      name: item.courses.name,
      progress: item.status === 'passed' ? 100 : item.status === 'in_progress' ? 50 : 0,
    }));
  } catch {
    // Silent fail
  }

  return (
    <div className="flex h-screen bg-[#060708]">
      <UniversitySidebar
        role={profile?.role ?? 'student'}
        department={profile?.department ?? null}
        courses={courses}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <UniversityTopBar
          userName={profile?.full_name ?? ''}
          userEmail={user.email ?? ''}
          role={profile?.role ?? 'student'}
          isDemoMode={demo}
          appEnv={appEnv}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
