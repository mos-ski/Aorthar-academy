import Link from 'next/link';

export default function StudyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#18191a', color: '#ffffff' }}>
      {/* Nav */}
      <header className="flex items-center justify-between px-5 sm:px-10 h-14 border-b" style={{ backgroundColor: '#18191a', borderColor: 'rgba(255,255,255,0.08)' }}>
        <Link href="/internship">
          <img src="/Aorthar Logo long complete.svg" alt="Aorthar" width={99} height={43} />
        </Link>
        <span className="text-[13px] font-semibold uppercase tracking-[0.15em]" style={{ color: '#a7d252' }}>Study Material</span>
      </header>

      <section className="px-5 sm:px-10 py-20 sm:py-32" style={{ backgroundColor: '#101010', minHeight: 'calc(100vh - 56px)' }}>
        <div className="max-w-[560px] mx-auto text-center space-y-6">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(167,210,82,0.12)', border: '1px solid rgba(167,210,82,0.25)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a7d252" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>

          <div className="space-y-3">
            <p className="text-[13px] font-semibold uppercase tracking-[0.2em]" style={{ color: '#a7d252' }}>Aorthar Standard</p>
            <h1 className="text-[28px] sm:text-[36px] font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>
              Your Study Material is Ready
            </h1>
            <p className="text-[15px] leading-7" style={{ color: '#b1b1b1' }}>
              Download the <strong className="text-white">Aorthar Standard SOP</strong> — your complete study guide for the internship assessment. Every exam question is drawn directly from this document.
            </p>
          </div>

          {/* Download options */}
          <div className="space-y-3 pt-2">
            <a
              href="/aorthar-standard-sop.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 font-bold text-[15px] hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#08694a', color: '#ffffff' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Open &amp; Save as PDF
            </a>
            <p className="text-[13px]" style={{ color: '#6b7280' }}>
              Opens in a new tab — use <strong className="text-white">File → Print → Save as PDF</strong> or the button on the page.
            </p>
          </div>

          {/* Key facts */}
          <div
            className="p-5 rounded-xl text-left space-y-3"
            style={{ backgroundColor: 'rgba(167,210,82,0.06)', border: '1px solid rgba(167,210,82,0.18)' }}
          >
            <p className="text-[13px] font-semibold text-white">What&apos;s inside:</p>
            {[
              '13 sections covering every aspect of product team operations',
              'Bug severity levels and exact response times',
              'Sprint mechanics, ceremonies, and definitions',
              'Engineering standards, release protocols, and change management',
              'Roles, responsibilities, and communication rules',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#a7d252' }} />
                <p className="text-[13px] leading-5" style={{ color: '#c4cdd6' }}>{item}</p>
              </div>
            ))}
          </div>

          {/* Reminder */}
          <div
            className="p-4 rounded-xl text-[13px] leading-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#c4cdd6' }}
          >
            Your <strong className="text-white">exam link will arrive by email</strong> when your 24-hour study window ends. There are no retakes — come prepared.
          </div>

          <p className="text-[13px]" style={{ color: '#6b7280' }}>
            <Link href="/internship" className="underline hover:text-white transition-colors">Back to internship page</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
