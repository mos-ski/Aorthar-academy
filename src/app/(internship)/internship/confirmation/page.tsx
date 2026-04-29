import Link from 'next/link';

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#18191a', color: '#ffffff' }}>
      {/* Nav */}
      <header
        className="flex items-center justify-between px-5 sm:px-10 h-14 border-b"
        style={{ backgroundColor: '#18191a', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <Link href="/internship">
          <img src="/Aorthar Logo long complete.svg" alt="Aorthar" width={99} height={43} />
        </Link>
      </header>

      <section className="px-5 sm:px-10 py-20 sm:py-32" style={{ backgroundColor: '#101010', minHeight: 'calc(100vh - 56px)' }}>
        <div className="max-w-[560px] mx-auto text-center space-y-6">
          {/* Checkmark */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: 'rgba(167,210,82,0.15)' }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M6 16l7 7 13-13" stroke="#a7d252" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="space-y-3">
            <h1 className="text-[32px] sm:text-[40px] font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>
              Application Submitted!
            </h1>
            <p className="text-[16px] leading-7" style={{ color: '#b1b1b1' }}>
              Your application is confirmed. Check your inbox — we&apos;ve sent you a <strong className="text-white">welcome email with your study material</strong>.
            </p>
          </div>

          {/* Timeline */}
          <div className="text-left space-y-3 pt-2">
            {[
              {
                step: '1',
                title: 'Check your inbox now',
                body: 'You\'ll receive a welcome email with a link to the Aorthar Standard SOP — your complete study guide.',
                accent: true,
              },
              {
                step: '2',
                title: 'Study for 24 hours',
                body: 'Read the Aorthar Standard carefully. Every question in your exam is drawn directly from it.',
                accent: false,
              },
              {
                step: '3',
                title: 'Your exam link arrives by email',
                body: '24 hours after your application, we\'ll send you the assessment link. You\'ll have 24 hours to complete it.',
                accent: false,
              },
              {
                step: '4',
                title: 'Complete the assessment',
                body: 'Verify your email, enter a one-time code, answer the questions, and see your score immediately. No retakes.',
                accent: false,
              },
            ].map(({ step, title, body, accent }) => (
              <div key={step} className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: accent ? 'rgba(167,210,82,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${accent ? 'rgba(167,210,82,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5"
                  style={{ backgroundColor: accent ? '#a7d252' : 'rgba(255,255,255,0.1)', color: accent ? '#18191a' : '#a0aba7' }}
                >
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-white text-[14px]">{title}</p>
                  <p className="text-[13px] leading-5 mt-0.5" style={{ color: '#a0aba7' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[13px]" style={{ color: '#6b7280' }}>
            Didn&apos;t get the welcome email? Check your spam folder. Still nothing?{' '}
            <Link href="/contact" className="underline hover:text-white transition-colors">Contact us</Link>.
          </p>

          {/* Study link */}
          <Link
            href="/internship/study"
            className="inline-flex items-center gap-2 font-bold text-[14px] px-6 py-3 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#08694a', color: '#ffffff' }}
          >
            Download Study Material →
          </Link>

          <p className="text-[13px]" style={{ color: '#6b7280' }}>
            <Link href="/internship" className="underline hover:text-white transition-colors">Back to internship page</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
