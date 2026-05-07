import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 0;

async function getTopPerformers() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('internship_applications')
      .select('full_name, address, track, exam_score, selected, cohort_id')
      .not('exam_score', 'is', null)
      .order('exam_score', { ascending: false })
      .limit(50);

    // Fetch cohort names
    const cohortIds = [...new Set(data?.map((d) => d.cohort_id).filter(Boolean))];
    let cohortMap: Record<string, string> = {};
    if (cohortIds.length > 0) {
      const { data: cohorts } = await admin
        .from('internship_cohorts')
        .select('id, name')
        .in('id', cohortIds);
      cohortMap = Object.fromEntries((cohorts ?? []).map((c) => [c.id, c.name]));
    }

    return (data ?? []).map((d) => ({
      full_name: d.full_name,
      address: d.address,
      track: d.track ?? 'N/A',
      exam_score: Number(d.exam_score),
      selected: d.selected,
      cohort: cohortMap[d.cohort_id] ?? 'Unknown',
    }));
  } catch {
    return [];
  }
}

const TRACK_COLORS: Record<string, string> = {
  'Product Design': '#a7d252',
  'Product Management': '#5fc49a',
  'QA & Testing': '#7eb8f7',
  'Scrum & Agile': '#f7c97e',
  'Tech Operations': '#c49af0',
};

function getMedal(rank: number) {
  if (rank === 1) return { icon: '🥇', bg: 'rgba(255,215,0,0.12)', border: 'rgba(255,215,0,0.3)' };
  if (rank === 2) return { icon: '🥈', bg: 'rgba(192,192,192,0.12)', border: 'rgba(192,192,192,0.3)' };
  if (rank === 3) return { icon: '🥉', bg: 'rgba(205,127,50,0.12)', border: 'rgba(205,127,50,0.3)' };
  return null;
}

export default async function ScoreboardPage() {
  const performers = await getTopPerformers();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#18191a', color: '#ffffff' }}>
      {/* Nav */}
      <header
        className="flex items-center justify-between px-5 sm:px-10 h-14 border-b sticky top-0 z-10"
        style={{ backgroundColor: '#18191a', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <Link href="/internship">
          <img src="/Aorthar Logo long complete.svg" alt="Aorthar" width={99} height={43} />
        </Link>
        <Link
          href="/internship/apply"
          className="text-sm font-semibold hover:opacity-80 transition-opacity"
          style={{ color: '#a7d252' }}
        >
          Apply Now →
        </Link>
      </header>

      {/* Hero */}
      <section className="px-5 sm:px-10 pt-12 sm:pt-16 pb-8" style={{ backgroundColor: '#101010' }}>
        <div className="max-w-[800px] mx-auto text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: '#a7d252' }}>
            Leaderboard
          </p>
          <h1
            className="text-[32px] sm:text-[48px] font-semibold leading-[1.1] mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            Top Performers
          </h1>
          <p className="text-[15px] sm:text-[17px] leading-7 max-w-[520px] mx-auto" style={{ color: '#b1b1b1' }}>
            The best scorers across all internship cohorts. Top performers earn placement in real startups.
          </p>
        </div>
      </section>

      {/* Scoreboard */}
      <section className="px-5 sm:px-10 py-12" style={{ backgroundColor: '#18191a' }}>
        <div className="max-w-[800px] mx-auto">
          {performers.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[16px] mb-2" style={{ color: '#b1b1b1' }}>No results published yet.</p>
              <p className="text-[14px]" style={{ color: '#6b7280' }}>Be the first to make the leaderboard.</p>
              <Link
                href="/internship/apply"
                className="inline-block mt-6 px-6 py-3 font-bold text-[14px] hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#08694a', color: '#ffffff' }}
              >
                Apply Now →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Table header */}
              <div
                className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: '#6b7280' }}
              >
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Name</div>
                <div className="col-span-2">Track</div>
                <div className="col-span-2">Cohort</div>
                <div className="col-span-2">Location</div>
                <div className="col-span-1 text-right">Score</div>
              </div>

              {performers.map((p, i) => {
                const rank = i + 1;
                const medal = getMedal(rank);
                const trackColor = TRACK_COLORS[p.track] ?? '#a7d252';

                return (
                  <div
                    key={i}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-5 py-4 rounded-xl transition-colors"
                    style={{
                      backgroundColor: medal ? medal.bg : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${medal ? medal.border : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    {/* Rank */}
                    <div className="sm:col-span-1 flex sm:block items-center gap-3">
                      {medal ? (
                        <span className="text-xl sm:text-2xl">{medal.icon}</span>
                      ) : (
                        <span className="text-[14px] sm:text-[15px] font-semibold" style={{ color: '#6b7280' }}>
                          #{rank}
                        </span>
                      )}
                    </div>

                    {/* Name + selected badge */}
                    <div className="sm:col-span-4 flex flex-col justify-center">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[15px] text-white">{p.full_name}</p>
                        {p.selected && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: 'rgba(167,210,82,0.15)', color: '#a7d252', border: '1px solid rgba(167,210,82,0.3)' }}
                          >
                            Placed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Track */}
                    <div className="sm:col-span-2 flex items-center">
                      <span
                        className="text-[13px] font-medium px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: `${trackColor}18`, color: trackColor }}
                      >
                        {p.track}
                      </span>
                    </div>

                    {/* Cohort */}
                    <div className="sm:col-span-2 flex items-center">
                      <p className="text-[13px]" style={{ color: '#a0aba7' }}>{p.cohort}</p>
                    </div>

                    {/* Location */}
                    <div className="sm:col-span-2 flex items-center">
                      <p className="text-[13px]" style={{ color: '#a0aba7' }}>{p.address ?? '—'}</p>
                    </div>

                    {/* Score */}
                    <div className="sm:col-span-1 flex sm:justify-end items-center">
                      <p className="text-[16px] sm:text-[18px] font-bold" style={{ color: '#a7d252' }}>
                        {p.exam_score}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 sm:px-10 py-8 border-t text-center text-[13px]" style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#6b7280' }}>
        © 2025 Aorthar Academy ·{' '}
        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
        {' · '}
        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
      </footer>
    </div>
  );
}
